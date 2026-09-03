# The Jordan Crossing

## Public Beta 2.0 for the Living Topology Corpus

**Status:** Public Beta 2.0 · Reader discretion advised
**Last major update:** September 3, 2026 (Phase 11 — full corpus rebuild from `records-2/`)
**Local corpus:** 456 records readable locally (all fully reviewed & threaded) of 458 in the direct archive

> This repository is now a **public beta**. Every page carries a lighter
> "PUBLIC BETA 2.0 · Reader discretion advised" banner (replacing the earlier private-workspace
> notice) — the content is real, first-person, unredacted spiritual testimony, offered as-is.
> GitHub Pages auto-deploys this repo's `master` branch.

---

## What this is

The Jordan Crossing is an interactive, text-based encounter with a real-time witness record —
*A Living Topology of Transformation* — recorded by Seth Tillotson across February–September 2026.
Each record is a first-person meditation: discernment, questioning, transformation, recognition.

This repository holds the **design, interactive logic, and complete beta site**: a landing page,
a "Mystery Mode" entry point, a reviewed thread constellation, curated reading paths, a fully
browsable archive of the entire local corpus, and the eight Stone Tablet volumes themselves — no
reader needs to leave this app, or reach the author's private drive, to read any meditation that
has been uploaded here.

For the full build history, current status, and open items, see [`plan.md`](plan.md) (living
project-status document) and [`CHANGELOG.md`](CHANGELOG.md) (dated release notes).

---

## The local corpus, in brief

Following the **Phase 11 full corpus rebuild** (September 2026), the owner replaced the entire raw
source layer with a freshly hand-verified corpus copied directly into **`records-2/`** — 456
meditation files (Feb 15 – Sep 1, 2026), the 8 Stone Tablet volumes, a Tablet VII audit document,
and 5 updated reference documents (Master Index, Tracker CSV, and three infographic pages). Every
record page, the entire cross-reference graph, and every stated count in this site was regenerated
directly from that source — not patched incrementally.

> **A note on how this section changed.** Two earlier corrections preceded this one: [1.9] parsed
> summary Pass-N ledger documents (later found partly hallucinated); [1.10] rebuilt from each
> file's own embedded Cross-Reference Appendix but left the *displayed article bodies* themselves
> stale/pre-verification. **Phase 11** replaces both the raw source folder and every generated page
> wholesale from the owner's newly verified `records-2/` bundle. See [`CHANGELOG.md`](CHANGELOG.md)
> for the full account, including several source-data bugs found and fixed during the rebuild (a
> corrupted binary file excluded, a date-parsing bug, an unbounded-regex bug, and a broken Mystery
> Mode doorway-routing table).

- **All 456 records are fully reviewed and threaded** as complete pages under `records/*-v2.html` —
  every one carries a verified Cross-Reference Appendix (hand-checked by the author against the
  eight real Stone Tablet volumes) and a `tabletAnchor` field naming the specific Stone Tablet
  volume + date window it belongs to. Nothing is asserted without a citation traceable back to the
  meditation's own appendix. There is no more "mirrored, not yet reviewed" tier — that distinction
  is now moot.
- **One source file was found to be corrupted** (raw binary/zip content saved with a `.md`
  extension, not real text) and was excluded rather than published — this is exactly the gap
  between the 457 candidate files and the 456 actually published.
- **Seven named threads** run underneath the reviewed chronology, transcribed meditation-by-meditation
  from the author's own corpus map documents and resolved via Corpus Lattice path-matching (Phase 13):
  **The Zechariah 3 Loop** (filthy garments removed, replaced, given away), **the Samuel Loop** (the
  carried, quietly learning to carry), **the Mantle Sequence** (the calling itself), **the Murmuration**
  (the *maskîlîm* are plural), **the Exousia / Dunamis Distinction** (legal right, not raw power),
  **the Sacred Ordinary** (holiness in the kitchen, the phone call, the parking lot), and **the Descent
  Into Hiddenness** (the arc bends downward). Each is browsable on [`threads.html`](threads.html) as
  its own filtered path.
- **Eight Stone Tablets** — the real written volumes in the author's *Living Topology of
  Transformation* series, each covering a specific window of days — now anchor every record via
  its `tabletAnchor` field, and are readable in full at [`stone-tablets.html`](stone-tablets.html).
  See also [`six-doctrinal-spines.html`](six-doctrinal-spines.html),
  [`spines-timeline.html`](spines-timeline.html), and [`corpus-architecture.html`](corpus-architecture.html)
  for the visual companions.
- **Corpus Paths** (5 curated reading paths) link exclusively to local pages — every step resolved
  via the same Corpus Lattice path-matching as the threads above (Phase 13); any step that could not
  be confidently resolved was dropped rather than linked externally, so there are zero external links
  anywhere on this page.

---

## Site map

| Page | Purpose |
|------|---------|
| [`index.html`](index.html) | Landing page: corpus overview, entry invitations, and Chronological/Thematic/Encounter navigation maps |
| [`mystery.html`](mystery.html) | Mystery Mode — name a doorway (one of 11 questions/states), receive one record drawn from a keyword-matched pool across all 456 records |
| [`stone-tablets.html`](stone-tablets.html) | The eight Stone Tablet volumes themselves, each with its own full reader page |
| [`six-doctrinal-spines.html`](six-doctrinal-spines.html) | The Eight Stone Tablets — a standalone infographic on the eight real Stone Tablet volumes that anchor the corpus |
| [`spines-timeline.html`](spines-timeline.html) | Timeline of the Eight Stone Tablets — weekly growth of the eight tablet windows across all eight months of the record |
| [`corpus-architecture.html`](corpus-architecture.html) | How the whole record fits together — a standalone infographic on the corpus's architecture |
| [`threads.html`](threads.html) | The reviewed thread constellation — full chronology, per-thread filters, and full-text search |
| [`paths.html`](paths.html) | Five curated reading paths through the corpus (Samuel Loop end-to-end, the Zechariah 3 walk, the Apr 11-14 merged week, the Mar 28 sermon day, the Jul 10 exousia cascade) |
| [`archive.html`](archive.html) | A full, searchable, month-by-month browsable index of all 456 local records, each linking directly to its page |

---

## Repository structure

```
.
├── assets/
│   ├── design-v2.css              # Site-wide v2 visual system (dark parchment/gold theme)
│   ├── design-v2-logic.js         # Page init, Markdown rendering, graph nav, thread connections,
│   │                               #   related records, audio player init, no-interpretation mode
│   ├── mystery-v2-logic.js        # Doorway selection, keyword-pool routing, no-interpretation link
│   ├── records-data.js            # JC_RECORDS (456 records, all reviewed, all with a tabletAnchor;
│   │                               #   Phase 14 adds optional doctrinalSpine/lexiconJoints/
│   │                               #   chiasticMirror/doctrinalThemesCarried fields where a record's
│   │                               #   own appendix carries them), JC_EDGES (3,079 edges, Corpus-
│   │                               #   Lattice-verified in Phase 12, zero isolated records; Phase 14
│   │                               #   adds a real jointType to 3,075/3,079 of them), JC_THREADS
│   │                               #   (7, rebuilt in Phase 13)
│   ├── appendix-joints.json       # Phase 14: from->to -> {jointType, note} lookup, built by
│   │                               #   build-records2-corpus.mjs, consumed by
│   │                               #   rebuild-edges-from-lattice.mjs
│   ├── corpus-paths-data.js       # JC_CORPUS_PATHS — the five curated reading paths (Phase 13, zero external links)
│   ├── graph-data.js              # window.GRAPH_DATA — the fractal Corpus Map's node/edge/community
│   │                               #   data (Phase 16b), built by scripts/build-graph-data.mjs from
│   │                               #   graph-data/graph_data.json with localId/localHref added per
│   │                               #   resolvable node; every bc/degree/community/radius/width/
│   │                               #   opacity/ebc/bridge field is copied through verbatim, never
│   │                               #   recomputed
│   ├── graph.css                  # Corpus Map page styles (Phase 16b)
│   ├── graph-logic.js             # Corpus Map Sigma.js/graphology/ForceAtlas2 rendering + interactions
│   ├── audio-player.js/.css       # Accessible audio player component (dormant — see Audio below)
├── records/
│   └── *-v2.html                  # 456 meditation record pages + 9 Stone Tablet reader pages —
│                                   #   PURE GENERATED OUTPUT as of Phase 11; do not hand-edit, and
│                                   #   do not expect raw .md source files here anymore (see records-2/)
├── records-2/                     # THE canonical raw-source folder as of Phase 11: 456 verified
│                                   #   meditation .md files, the 8 Stone Tablet volumes + audit doc,
│                                   #   and 5 reference docs (Master Index, Tracker CSV, 3 infographics).
│                                   #   Committed/public (unredacted, per standing owner direction).
├── graph-data/
│   ├── graph_data.json            # Phase 16b: pre-baked fractal-graph payload (475 nodes, 3,619
│   │                               #   edges, 7 Louvain communities, betweenness/edge-betweenness
│   │                               #   centrality, Jenks-binned radius) — read-only input to
│   │                               #   scripts/build-graph-data.mjs; never hand-edited or recomputed
│   │                               #   in the browser
│   └── build_graph_data.py        # The owner's precompute pipeline that produced graph_data.json —
│                                   #   kept for reproducibility/reference; not re-run by this repo
├── scripts/
│   ├── build-records2-corpus.mjs  # CURRENT authoritative generator (Phase 11) — parses every
│   │                               #   records-2/ meditation file's own metadata + embedded
│   │                               #   Cross-Reference Appendix, regenerates every record page and
│   │                               #   assets/records-data.js wholesale. Re-run whenever records-2/
│   │                               #   is updated.
│   ├── build-stone-tablet-pages.mjs # Generates the 8 Stone Tablet reader pages + the audit page
│   ├── rebuild-reference-pages.mjs # Unwraps and republishes the 3 infographic pages from records-2/
│   ├── tag-encounter-dimensions.mjs # Computes Encounter Index dimensions + doorway themes
│   ├── build-graph-data.mjs       # Phase 16b: resolves graph_data.json's meditation/Stone Tablet
│   │                               #   nodes to this site's own record ids/hrefs (exact filename match
│   │                               #   via Corpus Lattice + records-2/, and via build-stone-tablet-
│   │                               #   pages.mjs's own TABLETS/AUDIT constants), writes assets/
│   │                               #   graph-data.js. Re-run whenever records-2/ or graph_data.json
│   │                               #   changes.
│   ├── relink-corpus-paths.mjs    # Confirms and relinks Corpus Paths steps to local pages
│   ├── build-corpus-records.mjs, build-mirror-records.mjs, integrate-passes-7-8.mjs,
│   │   integrate-passes-9-13.mjs, integrate-passes-14-16.mjs, integrate-pass-17.mjs,
│   │   rebuild-cross-references-verified.mjs # SUPERSEDED (Phases 5-10) — kept as historical
│   │                               #   artifacts only; do not re-run, see build-records2-corpus.mjs
├── index.html, mystery.html, mystery-v2.html, threads.html, paths.html, archive.html, graph.html,
│   stone-tablets.html, six-doctrinal-spines.html, spines-timeline.html, corpus-architecture.html
├── plan.md                        # Living project-status document — read this first
├── CHANGELOG.md                   # Dated release notes
└── .github/workflows/deploy.yml   # GitHub Pages auto-deploy on push to master
```

**Gitignored (local-only, not pushed to this public repo):** `verified-source-docs/` (the prior
verification bundle, now superseded by `records-2/`), `Superseded-Docs/` (every document earlier
phases superseded), and internal AI-assisted-development artifacts (`COPILOT_HANDOFF_PROMPT.md`,
`COPILOT_CHAT_PROMPT.txt`, `COPILOT_USAGE.md`, `memory-bank/`). `records-2/` itself is **not**
gitignored — its raw meditation text is committed/public, per the owner's standing direction to
publish as-is now and redact later if needed.

`jordan-crossing-interior.html` (the retired v11 interior record) is excluded from git — it was
never part of any public deploy, and the legacy `record.html` page that referenced it has been
removed.

---

## Mystery Mode doorways

Eleven questions/states, each drawing from a **keyword-matched pool across all 456 records** (not
a single fixed destination) — a well-known anchor record always stays in the pool as a guaranteed
fallback:

| Doorway | Pool basis |
|---------|-----------|
| I am beginning again | Records matching return/renewal/restoration themes |
| I feel trapped in an old identity | Records matching identity/flesh/ego/mirror themes |
| I am waiting for something to change | Records matching waiting/patience/fourth-watch themes |
| I cannot see what God is doing | Records matching hiddenness/mystery/darkness themes |
| I am afraid of what obedience will cost | Records matching obedience/cost/fellowship themes |
| I need to understand surrender | Records matching surrender/kenosis/yielding themes |
| I am searching for Jesus | Records matching Christ/gospel/redemption themes |
| I want to examine the record carefully | Records matching discernment/scripture/doctrine themes |
| I want to follow the entire chronology | The entire reviewed corpus (all 456 records) — Phase 13; previously undersold via a union of only the old 4 named threads |
| I need a quiet place to begin | Records matching secret place/quiet/stillness/rest themes (Phase 11 — previously a dead link to the retired interior file) |
| I do not know what I am carrying, I only know I am here | Records matching "compass"/witness/presence themes |


---

## Design system

- **Palette:** deep charcoal background (`#0f1419`), parchment text (`#e8dcc8`), dimmed parchment
  (`#bfb5a5`), gold interactive accents (`#c9a227`)
- **Typography:** serif (Cambria/Georgia) for content and titles; system sans-serif for navigation/UI
- **Components:** gold-bordered cards with hover lift, gold-glow selected states, dotted movement
  dividers, animated response panels
- **Accessibility:** WCAG 2.1 AA — keyboard navigation throughout, visible focus states, semantic
  headings, alt text/labels, verified color contrast

### The four movements (on each record page)

1. **Discern** — name what you actually encountered
2. **Carry** — save a question locally for reflection (localStorage only, never transmitted)
3. **Return** — choose how to leave (five paths forward)
4. **Navigate** — chronological prev/next plus labeled, source-cited thread connections

A `?mode=original` query parameter on any record strips all of the above, leaving only the title,
date, source status, and the original imported text — no editorial framing.

---

## Audio (component built, dormant)

An accessible audio player component (`assets/audio-player.js` + `assets/audio-player.css`) is
built and wired into every record page: play/pause, seekable progress bar, elapsed/duration
timestamp, playback-speed control, volume control, and native caption-track support. It mounts
only when a record's `JC_RECORDS` entry carries an `audioUrl` — **no record currently has one**,
because the underlying corpus is text-only (PLAUD/Speakly-generated summaries with no
audio/video source files anywhere in the repository). The component exists ahead of the data so
that wiring in real audio, whenever it becomes available, is a one-line data change per record
rather than new engineering.

---

## Status & distribution

- **Public Beta 2.0.** Every page carries a lighter "PUBLIC BETA 2.0 · Reader discretion advised"
  banner (replacing the earlier private-workspace notice).
- **No account required, no server-side data collection.** `localStorage` is used only to remember
  the last record you read, and stays on the reader's own device.
- **GitHub Pages auto-deploys `master`** (see `.github/workflows/deploy.yml`).
- **Content is unredacted, as-is**, per the owner's standing direction to publish now and redact
  pre-public-launch only if needed. See `plan.md` for the current open items.

---

## Development

### To edit

1. Clone this repository
2. Edit `.html` / `.css` / `.js` files directly — no build step, no framework, no dependencies
3. Serve locally (e.g. `python3 -m http.server 8000`) and test in a browser
4. Commit and push to `master` — GitHub Actions auto-deploys ~30 seconds later

### Cache-busting

CSS/JS assets are versioned with a `?v=YYYYMMDDVN` query string. Browsers cache the HTML document
itself (not just linked assets) between visits, so **bump the version on every asset change** —
search-and-replace it across every referencing page, not just the one you edited.

### Regenerating the corpus

`node scripts/build-records2-corpus.mjs` is **the current authoritative generator for
records/JC_RECORDS** (Phase 11; Phase 14 rewrote its appendix parser). It reads every meditation file
directly from `records-2/` (the canonical raw-source folder), parses each one's own
title/date/classification metadata and embedded Cross-Reference Appendix — extracting the full
Doctrinal Spine / Lexicon Joints / Chiastic Mirror / Doctrinal Themes Carried structure, not just typed
links — clears and regenerates every `records/*-v2.html` page, and rebuilds `JC_RECORDS` (plus an
interim `JC_EDGES`, immediately superseded by step 1 below) and `assets/appendix-joints.json` in/around
`assets/records-data.js`. It also remaps `JC_THREADS`' record-id references by title+date match (ids
can shift when a title is corrected) and leaves `EDGE_LABELS`, `EDGE_LABELS_INCOMING`, `STATUS_LABELS`,
`JOINT_TYPE_LABELS`, and every helper function in `records-data.js` untouched. Re-run whenever
`records-2/` is updated, then run, in order:

1. `node scripts/rebuild-edges-from-lattice.mjs` — **the current authoritative `JC_EDGES`
   rebuilder** (Phase 12; Phase 14 added joint-type reconciliation). Matches every local record to its
   Corpus Lattice node by exact `archive_filename` string equality (requires `Corpus Lattice.json`
   schema v1.2 or later) and wholesale-replaces `JC_EDGES` with only `status: "ok"`
   meditation-to-meditation cross-references — each enriched with a real `jointType`/`note` from
   `assets/appendix-joints.json` when the appendix independently named one for that exact verified
   pair. Re-run whenever `Corpus Lattice.json`/`Corpus Lattice.csv` are updated, always after step 0
   above (it consumes that step's `appendix-joints.json` output).
2. `node scripts/rebuild-threads-and-paths.mjs` — **the current authoritative `JC_THREADS`/
   `corpus-paths-data.js` rebuilder** (Phase 13). Transcribes thread/path members verbatim from the
   owner's corpus map documents' own `memo:` links, resolves each to a local record via Corpus
   Lattice path-matching (never a paraphrase or a date-only guess), and wholesale-replaces
   `JC_THREADS` plus rewrites `assets/corpus-paths-data.js`. Re-run whenever the corpus map
   documents or Corpus Lattice are updated; always run after step 1.
3. `node scripts/build-stone-tablet-pages.mjs` — regenerates the 8 Stone Tablet reader pages + the
   Tablet VII audit page from `records-2/`'s Stone Tablet volumes
4. `node scripts/rebuild-reference-pages.mjs` — regenerates `six-doctrinal-spines.html`,
   `spines-timeline.html`, and `corpus-architecture.html` from `records-2/`'s reference infographics
5. `node scripts/tag-encounter-dimensions.mjs` — re-tags the full record set
6. `node scripts/build-graph-data.mjs` — (Phase 16b) rebuilds `assets/graph-data.js` for the Corpus
   Map page (`graph.html`) from `graph-data/graph_data.json`, resolving each node to this site's own
   record id/href by exact filename match (via Corpus Lattice + records-2/ for meditations, via
   `build-stone-tablet-pages.mjs`'s own `TABLETS`/`AUDIT` constants for Stone Tablets). Re-run whenever
   `records-2/` or `graph-data/graph_data.json` changes; independent of steps 1-5 above (reads
   `records-2/`/`Corpus Lattice.json` directly, not `assets/records-data.js`).

**Superseded, do not re-run:** `scripts/build-corpus-records.mjs`, `build-mirror-records.mjs`,
`integrate-passes-7-8.mjs`, `integrate-passes-9-13.mjs`, `integrate-passes-14-16.mjs`,
`integrate-pass-17.mjs`, `rebuild-cross-references-verified.mjs`, `relink-corpus-paths.mjs` — each of
these built on an earlier, since-superseded source layer (summary pass ledgers, the pre-Phase-11
`verified-source-docs/` bundle, or the pre-Phase-13 4-thread/6-path data). Kept in the repository as
historical artifacts only.

---

## Tech stack

- **HTML5** — semantic markup, no framework
- **CSS3** — hand-written responsive grid and design tokens
- **Vanilla JavaScript** — no build step, no dependencies; `localStorage` for returning-reader
  continuity only
- **Node.js** — used only for the offline `scripts/*.mjs` generators, not at runtime
- **GitHub Pages + GitHub Actions** — static hosting and auto-deploy on push to `master`

---

## Roadmap

See [`CHANGELOG.md`](CHANGELOG.md)'s Roadmap section and [`plan.md`](plan.md) for the full,
current list. In brief:

- [ ] Resolve the remaining 13 Corpus Paths steps that couldn't be confidently confirmed as a local
      meditation — see `assets/corpus-paths-data.js`'s header for the specific reason each one failed
- [ ] Find the one original Tablet VIII seed record ("When Wisdom Ushers Power," Aug 30 · 23:58)
      that could not be located under any title in the Phase 11 verified corpus
- [ ] Get a corrected thread-defining source from the owner (or re-derive from the new verified
      data) for the four named `JC_THREADS` (Zechariah 3, Samuel Loop, Murmuration, Descent) — their
      original Corpus Map is now superseded and has not been independently re-verified since Phase 11
- [ ] Wire in real audio once source files or URLs are available (component is ready)
- [ ] Final QA and stakeholder sign-off

---

## Credits

**Design & Development:** Barak (AI watchman)
**Content & Witness:** Seth Tillotson
**Theology & Editing:** Brother Samuel, Jayden, Sister Katie
**Version Manager:** Copilot CLI Runtime

---

**Soli Deo Gloria**
