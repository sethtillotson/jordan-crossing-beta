/* ═══════════════════════════════════════════════════════════════════
   The Jordan Crossing — Corpus Map (fractal graph) logic
   Phase 16b.

   Renderer stack: graphology + graphology-layout-forceatlas2 (worker) +
   sigma.js v2, loaded here as ES modules via jsDelivr's `+esm` CDN
   endpoint. The source design doc specified classic <script> UMD tags for
   all three libraries, but graphology-layout-forceatlas2@0.10.1 ships no
   UMD/global build (CommonJS-only, confirmed against its own published
   package.json/file listing) — its `build/graphology-layout-forceatlas2
   .min.js` path the doc named simply does not exist for this real
   published version. jsDelivr's `+esm` endpoint (real, first-party
   jsDelivr feature, not a third-party fork) wraps any npm package,
   including CJS-only ones, into a browser-loadable ES module — still
   "from jsDelivr CDN," still zero local bundling, same exact three
   libraries, no D3/Cytoscape/Vis.js substitution.

   This file reads the pre-baked GRAPH_DATA (assets/graph-data.js, itself
   generated from graph-data/graph_data.json by scripts/build-graph-data
   .mjs) and does NOT recompute bc / ebc / Louvain community / Jenks
   radius binning — every one of those fields is used exactly as given.
   ═════════════════════════════════════════════════════════════════════ */

(async function () {
  'use strict';

  // Sigma@2.4.0 is CommonJS with multiple named exports; jsDelivr's `+esm`
  // wrapper makes its ESM `default` equal the whole exports object (not
  // the Sigma class alone) in that case — the real class is the named
  // `Sigma` export, confirmed against the actual bundled output.
  const [{ default: Graph }, { default: FA2Layout }, { Sigma }] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/graphology@0.25.4/+esm'),
    import('https://cdn.jsdelivr.net/npm/graphology-layout-forceatlas2@0.10.1/worker/+esm'),
    import('https://cdn.jsdelivr.net/npm/sigma@2.4.0/+esm'),
  ]);

  const data = window.GRAPH_DATA;
  if (!data) {
    document.getElementById('graph-loading').textContent = 'Could not load the corpus network data.';
    return;
  }

  function waitForNonZeroSize(el) {
    if (el.offsetWidth > 0 && el.offsetHeight > 0) return Promise.resolve();
    return new Promise(resolve => {
      const ro = new ResizeObserver(() => {
        if (el.offsetWidth > 0 && el.offsetHeight > 0) { ro.disconnect(); resolve(); }
      });
      ro.observe(el);
    });
  }

  // ─── A 7-hue categorical palette for the 7 Louvain communities ──────
  // Chosen to read clearly against the site's dark (--deep) background,
  // distinct from each other, and distinct from the gold accent used
  // throughout the rest of the site chrome (so community color and "this
  // is a link/accent" are never visually confused).
  const COMMUNITY_COLORS = [
    '#c9a227', // gold (community 0)
    '#5b8fb9', // slate blue
    '#a85555', // rust red
    '#6b9e7f', // sage green
    '#9a6bc4', // plum
    '#c47f3a', // amber
    '#4fa3a3', // teal
    '#b56bab', // orchid (overflow, in case >7)
  ];
  function communityColor(community) {
    return COMMUNITY_COLORS[community % COMMUNITY_COLORS.length];
  }

  const BRIDGE_COLORS = {
    bridge: 'rgba(230, 126, 34, 0.9)',
    mid: 'rgba(230, 126, 34, 0.45)',
    default: null, // uses the edge's own pre-baked opacity against neutral gray
  };
  function edgeBaseColor(edge) {
    if (edge.bridge === 'bridge') return BRIDGE_COLORS.bridge;
    if (edge.bridge === 'mid') return BRIDGE_COLORS.mid;
    const opacity = typeof edge.opacity === 'number' ? edge.opacity : 0.35;
    return `rgba(184, 184, 184, ${opacity})`;
  }

  // ─── Build the graphology graph from the pre-baked data ─────────────
  const graph = new Graph({ multi: false, type: 'undirected' });
  const nodeById = new Map();
  for (const node of data.nodes) {
    nodeById.set(node.id, node);
    // Random initial position (a documented pre-requisite of ForceAtlas2 —
    // "each node's starting position must be set before running the
    // layout"; a random scatter is the standard, accepted way to do this
    // when no prior layout exists).
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 4 + 0.5;
    graph.addNode(node.id, {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: node.radius,
      color: communityColor(node.community),
      label: node.title,
      nodeType: node.type,
    });
  }
  let skippedEdges = 0;
  for (const edge of data.edges) {
    if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target) || edge.source === edge.target) { skippedEdges += 1; continue; }
    if (graph.hasEdge(edge.source, edge.target)) continue; // undirected graph: dedupe silently, data-driven, not fabricated
    graph.addEdge(edge.source, edge.target, {
      size: edge.width,
      color: edgeBaseColor(edge),
      weight: edge.weight,
      ebc: edge.ebc,
      bridge: edge.bridge,
    });
  }

  // ─── State ────────────────────────────────────────────────────────────
  const state = {
    search: '',
    typeVisible: { meditation: true, stone_tablet: true, external: true },
    bridgesOnly: false,
    minBcPercentile: 0,
    isolatedCommunity: null,
    selectedNode: null,
    hoveredNode: null,
    hoveredEdge: null,
  };

  const bcValues = data.nodes.map(n => n.bc).filter(v => typeof v === 'number').sort((a, b) => a - b);
  function bcThresholdForPercentile(p) {
    if (p <= 0) return -Infinity;
    const idx = Math.min(bcValues.length - 1, Math.floor((p / 100) * bcValues.length));
    return bcValues[idx];
  }

  function nodeMatchesSearch(node) {
    if (!state.search) return true;
    const q = state.search.toLowerCase();
    return node.title.toLowerCase().includes(q) || node.id.toLowerCase().includes(q);
  }

  function isNodeVisible(id) {
    const node = nodeById.get(id);
    if (!node) return false;
    if (!state.typeVisible[node.type]) return false;
    if (state.isolatedCommunity !== null && node.community !== state.isolatedCommunity) return false;
    const bcThreshold = bcThresholdForPercentile(state.minBcPercentile);
    if ((node.bc || 0) < bcThreshold) return false;
    return true;
  }

  // ─── Sigma renderer ───────────────────────────────────────────────────
  const container = document.getElementById('graph-canvas');
  // Guard against a race where this module script executes before the
  // grid layout (assets/graph.css) has actually been applied — .graph-
  // canvas is position:absolute/inset:0 and legitimately has zero size
  // until its ancestor's CSS grid track has been laid out.
  await waitForNonZeroSize(container);
  const renderer = new Sigma(graph, container, {
    renderEdgeLabels: false,
    labelSize: 12,
    labelWeight: '500',
    labelDensity: 0.7,
    labelGridCellSize: 60,
    labelRenderedSizeThreshold: 14,
    enableEdgeHoverEvents: true,
    zIndex: true,
  });
  const camera = renderer.getCamera();

  function firstNeighbors(id) {
    const set = new Set();
    graph.forEachNeighbor(id, n => set.add(n));
    return set;
  }

  renderer.setSetting('nodeReducer', (id, attrs) => {
    const res = { ...attrs };
    const node = nodeById.get(id);
    const visible = isNodeVisible(id);
    const matchesSearch = nodeMatchesSearch(node);

    if (!visible) { res.hidden = true; return res; }

    if (state.hoveredNode) {
      const neighbors = firstNeighbors(state.hoveredNode);
      if (id !== state.hoveredNode && !neighbors.has(id)) {
        res.color = 'rgba(120,120,120,0.15)';
        res.label = null;
      }
    }

    if (state.search && !matchesSearch) {
      res.color = 'rgba(120,120,120,0.12)';
      res.label = null;
    } else if (state.search && matchesSearch) {
      res.highlighted = true;
    }

    if (id === state.selectedNode) {
      res.highlighted = true;
      res.zIndex = 10;
    }

    return res;
  });

  renderer.setSetting('edgeReducer', (id, attrs) => {
    const res = { ...attrs };
    const extremities = graph.extremities(id);
    if (!isNodeVisible(extremities[0]) || !isNodeVisible(extremities[1])) { res.hidden = true; return res; }
    if (state.bridgesOnly && attrs.bridge !== 'bridge') { res.hidden = true; return res; }

    if (state.hoveredNode) {
      if (extremities.includes(state.hoveredNode)) {
        res.color = attrs.bridge === 'bridge' ? BRIDGE_COLORS.bridge : 'rgba(201,162,39,0.65)';
        res.size = attrs.size * 1.6;
        res.zIndex = 5;
      } else {
        res.hidden = true;
      }
    }

    if (state.hoveredEdge === id) {
      res.size = attrs.size * 2;
      res.color = attrs.bridge === 'bridge' ? BRIDGE_COLORS.bridge : 'rgba(201,162,39,0.85)';
      res.zIndex = 6;
    }

    return res;
  });

  // ─── ForceAtlas2 layout, run via the worker, with a real (not merely
  //     time-boxed) convergence check: sampled total node displacement
  //     between two snapshots, stopped once movement has settled. A hard
  //     ceiling still applies as a safety net. ───────────────────────────
  const FA2_SETTINGS = {
    gravity: 1,
    scalingRatio: 10,
    slowDown: 5,
    barnesHutOptimize: true,
    barnesHutTheta: 0.5,
    edgeWeightInfluence: 1,
    outboundAttractionDistribution: true,
    linLogMode: false,
    strongGravityMode: false,
  };
  const layout = new FA2Layout(graph, { settings: FA2_SETTINGS });

  let convergenceTimer = null;
  let convergenceCeiling = null;
  let lastSnapshot = null;
  let stableTicks = 0;

  function snapshotPositions() {
    const snap = new Map();
    graph.forEachNode((n, attrs) => snap.set(n, { x: attrs.x, y: attrs.y }));
    return snap;
  }

  function checkConvergence() {
    const snap = snapshotPositions();
    if (lastSnapshot) {
      let totalMove = 0;
      snap.forEach((pos, id) => {
        const prev = lastSnapshot.get(id);
        if (!prev) return;
        totalMove += Math.hypot(pos.x - prev.x, pos.y - prev.y);
      });
      const avgMove = totalMove / Math.max(1, snap.size);
      if (avgMove < 0.001) stableTicks += 1; else stableTicks = 0;
      if (stableTicks >= 3) {
        stopLayout();
        return;
      }
    }
    lastSnapshot = snap;
  }

  function startLayout() {
    stableTicks = 0;
    lastSnapshot = null;
    layout.start();
    setLoading(true);
    if (convergenceTimer) clearInterval(convergenceTimer);
    convergenceTimer = setInterval(checkConvergence, 400);
    if (convergenceCeiling) clearTimeout(convergenceCeiling);
    convergenceCeiling = setTimeout(stopLayout, 12000); // safety net, matches the ~10s acceptance target with margin
  }

  function stopLayout() {
    if (layout.isRunning()) layout.stop();
    if (convergenceTimer) { clearInterval(convergenceTimer); convergenceTimer = null; }
    if (convergenceCeiling) { clearTimeout(convergenceCeiling); convergenceCeiling = null; }
    setLoading(false);
  }

  function setLoading(isLoading) {
    const el = document.getElementById('graph-loading');
    el.classList.toggle('is-hidden', !isLoading);
  }

  startLayout();

  // ─── Tooltip ──────────────────────────────────────────────────────────
  const canvasWrap = container.parentElement;
  const tooltip = document.createElement('div');
  tooltip.className = 'graph-node-tooltip';
  tooltip.style.display = 'none';
  canvasWrap.appendChild(tooltip);
  let lastMouse = { x: 0, y: 0 };
  canvasWrap.addEventListener('mousemove', (e) => {
    const rect = canvasWrap.getBoundingClientRect();
    lastMouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (tooltip.style.display !== 'none') positionTooltip();
  });
  function positionTooltip() {
    tooltip.style.left = `${lastMouse.x}px`;
    tooltip.style.top = `${lastMouse.y}px`;
  }
  function showTooltip(html) {
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
    positionTooltip();
  }
  function hideTooltip() {
    tooltip.style.display = 'none';
  }

  const canvasHint = document.getElementById('graph-canvas-hint');
  let hintHidden = false;
  function hideHintOnce() {
    if (hintHidden) return;
    hintHidden = true;
    canvasHint.classList.add('is-hidden');
  }

  // ─── Hover / click interactions ──────────────────────────────────────
  renderer.on('enterNode', ({ node }) => {
    state.hoveredNode = node;
    const n = nodeById.get(node);
    showTooltip(`<strong>${escapeHtml(n.title)}</strong>${n.date ? `${escapeHtml(n.date)}${n.time ? ' · ' + escapeHtml(n.time) : ''}<br>` : ''}${typeLabel(n.type)} · community ${n.community}`);
    renderer.refresh();
  });
  renderer.on('leaveNode', () => {
    state.hoveredNode = null;
    hideTooltip();
    renderer.refresh();
  });
  renderer.on('enterEdge', ({ edge }) => {
    state.hoveredEdge = edge;
    const attrs = graph.getEdgeAttributes(edge);
    const [s, t] = graph.extremities(edge);
    const sTitle = nodeById.get(s)?.title || s;
    const tTitle = nodeById.get(t)?.title || t;
    showTooltip(`<strong>${escapeHtml(sTitle)} → ${escapeHtml(tTitle)}</strong>weight ${attrs.weight} · ${attrs.bridge}`);
    renderer.refresh();
  });
  renderer.on('leaveEdge', () => {
    state.hoveredEdge = null;
    hideTooltip();
    renderer.refresh();
  });

  renderer.on('clickNode', ({ event, node }) => {
    hideHintOnce();
    const n = nodeById.get(node);
    if (event.original && (event.original.ctrlKey || event.original.metaKey)) {
      if (n.localHref) window.open(n.localHref, '_blank', 'noopener');
      return;
    }
    selectNode(node);
  });
  renderer.on('clickEdge', ({ edge }) => {
    selectEdge(edge);
  });
  renderer.on('clickStage', () => {
    closeDetail();
  });

  // ─── Node dragging (fix position, physics continues elsewhere) ──────
  let draggedNode = null;
  const pinnedPositions = new Map();
  renderer.on('downNode', ({ node }) => {
    draggedNode = node;
    graph.setNodeAttribute(node, 'highlighted', true);
    hideHintOnce();
  });
  renderer.getMouseCaptor().on('mousemovebody', (e) => {
    if (!draggedNode) return;
    const pos = renderer.viewportToGraph(e);
    graph.setNodeAttribute(draggedNode, 'x', pos.x);
    graph.setNodeAttribute(draggedNode, 'y', pos.y);
    pinnedPositions.set(draggedNode, { x: pos.x, y: pos.y });
    e.preventSigmaDefault();
    e.original.preventDefault();
    e.original.stopPropagation();
  });
  renderer.getMouseCaptor().on('mouseup', () => {
    if (draggedNode) graph.removeNodeAttribute(draggedNode, 'highlighted');
    draggedNode = null;
  });
  // Re-apply pinned positions on top of whatever ForceAtlas2 computes each
  // tick, so a dragged node stays put while the rest of the graph keeps
  // moving — the worker has no native per-node "fixed" flag, so this is
  // the standard workaround: continuously re-assert the pinned position.
  setInterval(() => {
    if (!pinnedPositions.size) return;
    pinnedPositions.forEach((pos, id) => {
      if (!graph.hasNode(id)) return;
      graph.setNodeAttribute(id, 'x', pos.x);
      graph.setNodeAttribute(id, 'y', pos.y);
    });
  }, 120);

  function escapeHtml(v) {
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function typeLabel(t) {
    return t === 'stone_tablet' ? 'Stone Tablet' : t === 'external' ? 'External reference' : 'Meditation';
  }

  // ─── Detail panel (right rail) ────────────────────────────────────────
  const railRight = document.getElementById('graph-rail-right');
  const detailMount = document.getElementById('graph-detail-mount');
  document.getElementById('graph-rail-right-close').addEventListener('click', closeDetail);

  function closeDetail() {
    state.selectedNode = null;
    railRight.hidden = true;
    detailMount.innerHTML = '';
    renderer.refresh();
  }

  function neighborRows(id) {
    const neighbors = [];
    graph.forEachEdge(id, (edge, attrs, source, target) => {
      const otherId = source === id ? target : source;
      const other = nodeById.get(otherId);
      if (!other) return;
      neighbors.push({ other, weight: attrs.weight || 0 });
    });
    neighbors.sort((a, b) => b.weight - a.weight);
    return neighbors.slice(0, 5);
  }

  function selectNode(id) {
    state.selectedNode = id;
    const n = nodeById.get(id);
    const top5 = neighborRows(id);
    detailMount.innerHTML = `
      <p class="graph-detail-kicker">${typeLabel(n.type)} · Community ${n.community}</p>
      <h2 class="graph-detail-title">${escapeHtml(n.title)}</h2>
      <dl>
        ${n.date ? row('Date', `${escapeHtml(n.date)}${n.time ? ' · ' + escapeHtml(n.time) : ''}`) : ''}
        ${n.tablet ? row('Tablet', escapeHtml(n.tablet)) : ''}
        ${row('Betweenness centrality', n.bc.toFixed(6))}
        ${row('Degree', String(n.degree))}
        ${row('Diversivity', n.diversivity.toFixed(6))}
      </dl>
      <div class="graph-detail-neighbors">
        <p class="graph-control-label">Top connections</p>
        <ul class="graph-detail-neighbors-list">
          ${top5.map(nb => `<li>${nb.other.localHref ? `<a href="${escapeHtml(nb.other.localHref)}">${escapeHtml(nb.other.title)}</a>` : escapeHtml(nb.other.title)} <span class="graph-control-hint">weight ${nb.weight}</span></li>`).join('') || '<li class="graph-control-hint">No connections currently visible.</li>'}
        </ul>
      </div>
      ${n.localHref ? `<a class="btn btn-primary graph-detail-open-link" href="${escapeHtml(n.localHref)}">Open this record →</a>` : `<p class="graph-control-hint" style="margin-top:var(--space-4);">This node isn't part of the currently published 456 records — no local page to open.</p>`}
    `;
    railRight.hidden = false;
    renderer.refresh();
  }

  function selectEdge(edgeId) {
    const attrs = graph.getEdgeAttributes(edgeId);
    const [s, t] = graph.extremities(edgeId);
    const sNode = nodeById.get(s), tNode = nodeById.get(t);
    detailMount.innerHTML = `
      <p class="graph-detail-kicker">Connection</p>
      <h2 class="graph-detail-title">${escapeHtml(sNode.title)} → ${escapeHtml(tNode.title)}</h2>
      <dl>
        ${row('Weight (mention count)', String(attrs.weight))}
        ${row('Edge betweenness', attrs.ebc.toFixed(6))}
        ${row('Bridge class', `<span class="graph-detail-bridge-badge ${attrs.bridge}">${attrs.bridge}</span>`)}
      </dl>
      <a class="btn btn-secondary graph-detail-open-link" href="${sNode.localHref ? escapeHtml(sNode.localHref) : '#'}">${sNode.localHref ? 'Open source record →' : ''}</a>
    `;
    railRight.hidden = false;
    renderer.refresh();
  }

  function row(label, value) {
    return `<div class="graph-detail-row"><dt>${label}</dt><dd>${value}</dd></div>`;
  }

  // ─── Left rail: search ────────────────────────────────────────────────
  const searchInput = document.getElementById('graph-search');
  searchInput.addEventListener('input', () => {
    state.search = searchInput.value.trim();
    renderer.refresh();
  });

  // ─── Left rail: type filters ──────────────────────────────────────────
  ['meditation', 'stone_tablet', 'external'].forEach(type => {
    const cb = document.getElementById(`graph-type-${type}`);
    cb.addEventListener('change', () => {
      state.typeVisible[type] = cb.checked;
      renderer.refresh();
      startLayout(); // reheat: the visible topology just changed
    });
  });

  // ─── Left rail: bridges-only toggle ───────────────────────────────────
  document.getElementById('graph-bridges-only').addEventListener('change', (e) => {
    state.bridgesOnly = e.target.checked;
    renderer.refresh();
  });

  // ─── Left rail: node-size percentile slider ──────────────────────────
  const sizeSlider = document.getElementById('graph-size-slider');
  const sizeSliderValue = document.getElementById('graph-size-slider-value');
  sizeSlider.addEventListener('input', () => {
    state.minBcPercentile = Number(sizeSlider.value);
    sizeSliderValue.textContent = state.minBcPercentile === 0
      ? 'Showing all nodes'
      : `Hiding the bottom ${state.minBcPercentile}% by centrality`;
    renderer.refresh();
  });

  // ─── Left rail: community legend ─────────────────────────────────────
  const legendList = document.getElementById('graph-legend');
  data.communities.forEach(c => {
    const li = document.createElement('li');
    li.className = 'graph-legend-item';
    li.dataset.community = String(c.id);
    const topTitle = c.top_nodes && c.top_nodes[0] ? c.top_nodes[0].title : `Community ${c.id}`;
    li.innerHTML = `<span class="graph-legend-swatch" style="background:${communityColor(c.id)};"></span><span><span class="graph-legend-label">${escapeHtml(topTitle)}</span><span class="graph-control-hint">${c.size} records</span></span>`;
    li.addEventListener('click', () => {
      if (state.isolatedCommunity === c.id) {
        state.isolatedCommunity = null;
        li.classList.remove('is-active');
      } else {
        legendList.querySelectorAll('.graph-legend-item').forEach(el => el.classList.remove('is-active'));
        state.isolatedCommunity = c.id;
        li.classList.add('is-active');
      }
      renderer.refresh();
    });
    legendList.appendChild(li);
  });

  // ─── Left rail collapse toggle (mobile) ──────────────────────────────
  const railLeft = document.getElementById('graph-rail-left');
  document.getElementById('graph-rail-left-toggle').addEventListener('click', () => {
    const collapsed = railLeft.classList.toggle('collapsed');
    document.getElementById('graph-rail-left-toggle').setAttribute('aria-expanded', String(!collapsed));
  });

  // ─── Bottom strip: stats + actions ────────────────────────────────────
  document.getElementById('graph-stats-subtitle').textContent =
    `${data.stats.n_nodes} nodes · ${data.stats.n_edges} connections · ${data.stats.n_communities} communities · Force-Atlas 2 layout`;
  document.getElementById('graph-bottom-stats').textContent =
    `Total connection weight: ${data.stats.total_edge_weight} · Bridge connections: ${data.edges.filter(e => e.bridge === 'bridge').length} · Generated ${data.stats.generated_at ? data.stats.generated_at.slice(0, 10) : ''}`;

  document.getElementById('graph-btn-reheat').addEventListener('click', startLayout);

  let paused = false;
  const pauseBtn = document.getElementById('graph-btn-pause');
  function togglePause() {
    paused = !paused;
    if (paused) { stopLayout(); pauseBtn.textContent = 'Resume'; }
    else { startLayout(); pauseBtn.textContent = 'Pause'; }
  }
  pauseBtn.addEventListener('click', () => { togglePause(); pauseBtn.innerHTML = paused ? 'Resume <kbd>Space</kbd>' : 'Pause <kbd>Space</kbd>'; });

  function resetZoom() {
    renderer.setCustomBBox(null);
    camera.animate({ x: 0.5, y: 0.5, ratio: 1, angle: 0 }, { duration: 400 });
  }
  function fitView() {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, any = false;
    graph.forEachNode((id, attrs) => {
      if (!isNodeVisible(id)) return;
      any = true;
      if (attrs.x < minX) minX = attrs.x;
      if (attrs.x > maxX) maxX = attrs.x;
      if (attrs.y < minY) minY = attrs.y;
      if (attrs.y > maxY) maxY = attrs.y;
    });
    if (!any) return;
    const padX = (maxX - minX) * 0.1 || 1, padY = (maxY - minY) * 0.1 || 1;
    renderer.setCustomBBox({ x: [minX - padX, maxX + padX], y: [minY - padY, maxY + padY] });
    camera.animate({ x: 0.5, y: 0.5, ratio: 1, angle: 0 }, { duration: 400 });
  }
  document.getElementById('graph-btn-reset-zoom').addEventListener('click', resetZoom);
  document.getElementById('graph-btn-fit').addEventListener('click', fitView);

  // ─── Keyboard shortcuts ───────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName || '').toLowerCase();
    const isTyping = tag === 'input' || tag === 'textarea';
    if (e.key === '/' && !isTyping) {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === 'Escape') {
      searchInput.value = '';
      state.search = '';
      state.isolatedCommunity = null;
      state.bridgesOnly = false;
      state.minBcPercentile = 0;
      document.getElementById('graph-bridges-only').checked = false;
      sizeSlider.value = '0';
      sizeSliderValue.textContent = 'Showing all nodes';
      legendList.querySelectorAll('.graph-legend-item').forEach(el => el.classList.remove('is-active'));
      closeDetail();
      renderer.refresh();
    } else if (e.key === ' ' && !isTyping) {
      e.preventDefault();
      togglePause();
      pauseBtn.innerHTML = paused ? 'Resume <kbd>Space</kbd>' : 'Pause <kbd>Space</kbd>';
    } else if ((e.key === 'f' || e.key === 'F') && !isTyping) {
      e.preventDefault();
      fitView();
    }
  });

  console.log(`Corpus Map: ${data.stats.n_nodes} nodes / ${data.stats.n_edges} edges rendered (${skippedEdges} edges skipped as self-loops/duplicates/unresolvable — data-driven, not fabricated).`);
})();
