#!/usr/bin/env python3
"""
Fractal Dynamic Corpus Map — precompute pipeline.

Reads:
  - Personal Space/memo/PLAUD Meditations/Corpus Lattice.json (nodes, v1.3)
  - Personal Space/memo/PLAUD Meditations/Corpus Lattice.csv  (edges, v1.3)
  - Every meditation body under PLAUD Meditations/{Feb..September}/
  - Every stone tablet body under Stone Tablets/

Writes:
  - Personal Space/memo/PLAUD Meditations/graph_data.json

Metrics computed:
  - Node betweenness centrality (BC) with Jenks 5-class radius binning
  - Node diversivity (BC / degree)
  - Edge weight = full-text mention count of target inside source body
  - Edge width = 1 + log2(weight); opacity = 0.35 + 0.10 * min(weight, 6)
  - Edge betweenness centrality (EBC) with Jenks 3-class bridge/mid/default
  - Louvain communities (weighted, seed=42) with top-3 BC members per community
"""

from __future__ import annotations

import csv
import json
import math
import re
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

import networkx as nx
import jenkspy
from networkx.algorithms.community import louvain_communities


# ─────────────────────────────────────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────────────────────────────────────

VAULT_ROOT = Path.cwd()  # sandbox cwd = vault root
SPACE = VAULT_ROOT / "Personal Space"
MEMO = SPACE / "memo"
PLAUD = MEMO / "PLAUD Meditations"
TABLETS_DIR = MEMO / "Stone Tablets"

LATTICE_JSON = PLAUD / "Corpus Lattice.json"
LATTICE_CSV = PLAUD / "Corpus Lattice.csv"
OUTPUT_JSON = PLAUD / "graph_data.json"


# ─────────────────────────────────────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────────────────────────────────────

def log(msg: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def resolve_source_path(node: dict) -> Path | None:
    """Try node['path']; if missing/nonexistent, search common dirs by filename."""
    p = node.get("path", "")
    if p:
        candidate = VAULT_ROOT / p
        if candidate.exists():
            return candidate
    fname = node.get("filename", "")
    if not fname:
        return None
    # search in PLAUD monthly folders + Stone Tablets
    for sub in ("Feb", "March", "April", "May", "June", "July", "August", "September"):
        c = PLAUD / sub / fname
        if c.exists():
            return c
    c = TABLETS_DIR / fname
    if c.exists():
        return c
    return None


def build_target_patterns(nodes: dict[str, dict]) -> dict[str, re.Pattern]:
    """Regex per target: matches id, filename (with & without .md), or a
    normalized long-title slice.
    """
    patterns: dict[str, re.Pattern] = {}
    for nid, n in nodes.items():
        alts: list[str] = [re.escape(nid)]
        fname = n.get("filename", "")
        if fname:
            alts.append(re.escape(fname))
            if fname.endswith(".md"):
                alts.append(re.escape(fname[:-3]))
        title = (n.get("title") or "").strip()
        if title:
            # take the informative slice after any leading date/tablet marker
            cleaned = re.sub(r"^(Stone Tablet [IVX]+\s*[·:\-]\s*)", "", title)
            cleaned = re.sub(r"^\d{2}-\d{2}(?:\s+(?:at|@)\s+\d{1,2}[:_]\d{2})?\s*", "", cleaned)
            cleaned = cleaned.strip(" ·-:_")
            if len(cleaned) >= 18:
                alts.append(re.escape(cleaned[:80]))
        # de-dup
        seen = set()
        unique = []
        for a in alts:
            if a not in seen:
                seen.add(a)
                unique.append(a)
        patterns[nid] = re.compile("|".join(unique), re.IGNORECASE)
    return patterns


# ─────────────────────────────────────────────────────────────────────────────
# 1. Load nodes
# ─────────────────────────────────────────────────────────────────────────────

def load_nodes() -> dict[str, dict]:
    log(f"Loading lattice JSON: {LATTICE_JSON}")
    data = json.loads(LATTICE_JSON.read_text())
    raw = data["nodes"]
    nodes: dict[str, dict] = {}
    for nid, n in raw.items():
        nodes[nid] = {
            "id": nid,
            "type": n.get("type", "unknown"),
            "title": n.get("title", ""),
            "date": n.get("date", ""),
            "time": n.get("time", ""),
            "tablet": n.get("tablet_id", ""),
            "path": n.get("path", ""),
            "filename": n.get("filename", ""),
        }
    log(f"  Loaded {len(nodes)} nodes")
    log(f"  Types: {Counter(n['type'] for n in nodes.values())}")
    return nodes


# ─────────────────────────────────────────────────────────────────────────────
# 2. Load raw adjacency from lattice CSV
# ─────────────────────────────────────────────────────────────────────────────

def load_raw_adjacency(nodes: dict[str, dict]) -> set[tuple[str, str]]:
    log(f"Loading lattice CSV: {LATTICE_CSV}")
    pairs: set[tuple[str, str]] = set()
    dropped = 0
    with LATTICE_CSV.open() as f:
        reader = csv.DictReader(f)
        for row in reader:
            sid, tid = row.get("source_id", "").strip(), row.get("target_id", "").strip()
            if not sid or not tid or sid == tid:
                continue
            if sid not in nodes or tid not in nodes:
                dropped += 1
                continue
            pairs.add((sid, tid))
    log(f"  Loaded {len(pairs)} unique source→target pairs ({dropped} dropped for unknown ids)")
    return pairs


# ─────────────────────────────────────────────────────────────────────────────
# 3. Upgrade edge weights via full-text mention scan
# ─────────────────────────────────────────────────────────────────────────────

def compute_edge_weights(
    nodes: dict[str, dict],
    raw_pairs: set[tuple[str, str]],
) -> dict[tuple[str, str], int]:
    log("Scanning source bodies for target mentions to upgrade edge weights…")
    patterns = build_target_patterns(nodes)

    # Group pairs by source, so each source body is opened + read once
    source_to_targets: dict[str, list[str]] = defaultdict(list)
    for sid, tid in raw_pairs:
        source_to_targets[sid].append(tid)

    edges: dict[tuple[str, str], int] = {}
    missing_body = 0
    scanned = 0
    total_sources = len(source_to_targets)

    t0 = time.time()
    for i, (sid, targets) in enumerate(source_to_targets.items(), 1):
        node = nodes[sid]
        src_path = resolve_source_path(node)
        if src_path is None:
            missing_body += 1
            # keep adjacency weight = 1 for all its edges
            for tid in targets:
                edges[(sid, tid)] = 1
            continue

        try:
            text = src_path.read_text(errors="ignore")
        except Exception as exc:
            log(f"  ! read error {src_path}: {exc}")
            for tid in targets:
                edges[(sid, tid)] = 1
            continue

        scanned += 1
        for tid in targets:
            hits = patterns[tid].findall(text)
            edges[(sid, tid)] = max(1, len(hits))

        if i % 50 == 0 or i == total_sources:
            elapsed = time.time() - t0
            log(f"  scanned {i}/{total_sources} sources ({elapsed:.1f}s)")

    log(f"  Body scan done: {scanned} scanned, {missing_body} sources had no body on disk")
    log(f"  Edge weight distribution: min={min(edges.values())} max={max(edges.values())} "
        f"mean={sum(edges.values())/len(edges):.2f}")
    weight_hist = Counter()
    for w in edges.values():
        bucket = 1 if w == 1 else (2 if w <= 3 else (3 if w <= 10 else (4 if w <= 30 else 5)))
        weight_hist[bucket] += 1
    labels = {1: "w=1", 2: "w=2-3", 3: "w=4-10", 4: "w=11-30", 5: "w>30"}
    for k in sorted(weight_hist):
        log(f"    {labels[k]}: {weight_hist[k]}")
    return edges


# ─────────────────────────────────────────────────────────────────────────────
# 4. Build networkx graph and compute metrics
# ─────────────────────────────────────────────────────────────────────────────

def build_graph_and_metrics(
    nodes: dict[str, dict],
    edges: dict[tuple[str, str], int],
) -> dict:
    log("Building undirected weighted graph…")
    G = nx.Graph()
    for nid, n in nodes.items():
        G.add_node(nid, **n)
    for (u, v), w in edges.items():
        if G.has_edge(u, v):
            G[u][v]["weight"] += w
        else:
            G.add_edge(u, v, weight=w)

    # Drop isolated nodes — they cannot inform BC and clutter the render
    isolated = [n for n, d in G.degree() if d == 0]
    log(f"  Isolated nodes to drop: {len(isolated)}")
    G.remove_nodes_from(isolated)
    log(f"  Final graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

    log("Computing betweenness centrality (weighted, normalized)… this is the slow step")
    t0 = time.time()
    # For BC, weight is a *distance*, so invert
    for u, v, d in G.edges(data=True):
        d["distance"] = 1.0 / d["weight"]
    bc = nx.betweenness_centrality(G, weight="distance", normalized=True)
    log(f"  Node BC done in {time.time()-t0:.1f}s")

    log("Computing edge betweenness centrality…")
    t0 = time.time()
    ebc = nx.edge_betweenness_centrality(G, weight="distance", normalized=True)
    log(f"  Edge BC done in {time.time()-t0:.1f}s")

    log("Computing Louvain communities (weighted, seed=42)…")
    t0 = time.time()
    communities = louvain_communities(G, weight="weight", seed=42, resolution=1.0)
    log(f"  Louvain done in {time.time()-t0:.1f}s — found {len(communities)} communities")

    node_community: dict[str, int] = {}
    for i, comm in enumerate(communities):
        for nid in comm:
            node_community[nid] = i

    # Jenks binning for node radii
    bc_positive = [v for v in bc.values() if v > 0]
    if len(bc_positive) >= 5:
        bc_breaks = jenkspy.jenks_breaks(bc_positive, n_classes=5)
    else:
        bc_breaks = [0, 0.001, 0.01, 0.05, 0.2, 1.0]
    radii = [6, 10, 16, 24, 36]

    def size_class(v: float) -> int:
        if v <= 0:
            return radii[0]
        for i in range(len(bc_breaks) - 1):
            if v <= bc_breaks[i + 1]:
                return radii[i]
        return radii[-1]

    # Percentile-based bridge classification — Jenks on long-tail EBC
    # collapses the top class to a handful of edges. Percentiles guarantee
    # a visible number of bridges (top ~5%) and mid edges (next ~15%).
    import numpy as np
    ebc_values = list(ebc.values())
    ebc_arr = np.array(ebc_values)
    p95 = float(np.percentile(ebc_arr, 95))
    p80 = float(np.percentile(ebc_arr, 80))
    ebc_breaks = [0.0, p80, p95, float(ebc_arr.max())]

    def bridge_class(v: float) -> str:
        if v >= p95:
            return "bridge"
        if v >= p80:
            return "mid"
        return "default"

    degrees = dict(G.degree(weight="weight"))

    # ── Emit payload ──────────────────────────────────────────────────────
    log("Emitting payload…")
    out_nodes = []
    for nid in G.nodes():
        n = nodes[nid]
        deg = degrees[nid]
        out_nodes.append({
            **n,
            "bc": round(bc[nid], 6),
            "degree_weighted": round(deg, 2),
            "degree": G.degree(nid),
            "diversivity": round(bc[nid] / deg, 6) if deg else 0,
            "community": node_community.get(nid, -1),
            "radius": size_class(bc[nid]),
        })

    out_edges = []
    for u, v in G.edges():
        w = G[u][v]["weight"]
        e = ebc[(u, v)] if (u, v) in ebc else ebc[(v, u)]
        out_edges.append({
            "source": u,
            "target": v,
            "weight": w,
            "width": round(1 + math.log2(w), 3),
            "opacity": round(0.35 + 0.10 * min(w, 6), 3),
            "ebc": round(e, 6),
            "bridge": bridge_class(e),
        })

    out_communities = []
    for i, comm in enumerate(communities):
        members_in_graph = [n for n in comm if n in G]
        top3 = sorted(members_in_graph, key=lambda n: -bc.get(n, 0))[:3]
        out_communities.append({
            "id": i,
            "size": len(members_in_graph),
            "top_nodes": [
                {"id": nid, "title": nodes[nid].get("title", ""), "bc": round(bc[nid], 6)}
                for nid in top3
            ],
        })
    # Sort communities biggest first
    out_communities.sort(key=lambda c: -c["size"])
    # Re-assign display order but keep original id for node.community linkage

    # Top-10 BC nodes for sanity check
    top10 = sorted(G.nodes(), key=lambda n: -bc[n])[:10]
    top10_report = [
        {"id": nid, "title": nodes[nid].get("title", "")[:70], "bc": round(bc[nid], 6),
         "type": nodes[nid].get("type"), "community": node_community.get(nid, -1)}
        for nid in top10
    ]

    stats = {
        "n_nodes": G.number_of_nodes(),
        "n_edges": G.number_of_edges(),
        "n_communities": len(communities),
        "total_edge_weight": int(sum(d["weight"] for _, _, d in G.edges(data=True))),
        "isolated_nodes_dropped": len(isolated),
        "bc_positive_count": len(bc_positive),
        "top_10_bc": top10_report,
        "bc_breaks_jenks": [round(float(b), 6) for b in bc_breaks],
        "ebc_breaks_jenks": [round(float(b), 6) for b in ebc_breaks],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "generator": "build_graph_data.py v1",
        "schema_version": "1.0",
    }

    return {
        "nodes": out_nodes,
        "edges": out_edges,
        "communities": out_communities,
        "stats": stats,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main() -> int:
    if not LATTICE_JSON.exists():
        log(f"FATAL: {LATTICE_JSON} not found. Are you running from the vault root?")
        return 2
    if not LATTICE_CSV.exists():
        log(f"FATAL: {LATTICE_CSV} not found.")
        return 2

    nodes = load_nodes()
    raw_pairs = load_raw_adjacency(nodes)
    edges = compute_edge_weights(nodes, raw_pairs)
    payload = build_graph_and_metrics(nodes, edges)

    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2))
    size_mb = OUTPUT_JSON.stat().st_size / (1024 * 1024)
    log(f"WROTE: {OUTPUT_JSON} ({size_mb:.2f} MB)")

    log("── STATS ──")
    for k, v in payload["stats"].items():
        if k == "top_10_bc":
            log("  top_10_bc:")
            for row in v:
                log(f"    {row['id']:<12} bc={row['bc']:.4f} c={row['community']:<3} "
                    f"{row['type']:<12} {row['title']}")
        else:
            log(f"  {k}: {v}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
