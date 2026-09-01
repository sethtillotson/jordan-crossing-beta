# The Jordan Crossing

## Interior Beta for the Living Topology Corpus

**Status:** Interior Beta · Private workspace · Not for public distribution
**Last major update:** September 1, 2026
**Local corpus:** 394 records readable locally (138 reviewed & threaded, 256 mirrored) of 451 in the direct archive
**Corpus version:** v11 (`jordan-crossing-interior.html`, preserved untouched)

> This repository is a **private working beta**, not a public release. Every page in the site
> carries an explicit "INTERIOR BETA · Not for public distribution" banner. See
> [Status & Distribution](#status--distribution) below before assuming otherwise — GitHub Pages
> auto-deploys this repo's `master` branch, but that is a staging/preview convenience, not a
> sign-off to index or publicize the URL.

---

## What this is

The Jordan Crossing is an interactive, text-based encounter with a real-time witness record —
*A Living Topology of Transformation* — recorded by Seth Tillotson across February–August 2026.
Each record is a first-person meditation: discernment, questioning, transformation, recognition.

This repository holds the **design, interactive logic, and complete beta site**: a landing page,
a "Mystery Mode" entry point, a reviewed thread constellation, curated reading paths, and a fully
browsable archive of the entire local corpus — no reader needs to leave this app, or reach the
author's private drive, to read any meditation that has been uploaded here.

For the full build history, current status, and open items, see [`plan.md`](plan.md) (living
project-status document) and [`CHANGELOG.md`](CHANGELOG.md) (dated release notes).

---

## The local corpus, in brief

The underlying witness record holds **451 meditations** (Feb 14 – Aug 30, 2026) plus one received
prophetic word. **394 of them have a local page in this app** (410 raw files are present in this
repository; 16 of those are supporting documents rather than meditations proper; ~41 meditations
the author's own Corpus Map documents were never uploaded here). Per the project's own governing
design document, the corpus is introduced **in reviewed layers** for *interpretation* — but every
uploaded meditation's own text is available locally regardless of review status:

- **138 records are fully reviewed and threaded** as complete pages under `records/*-v2.html` —
  the original 7 curated "Tablet VIII" seeds (Aug 29–30, 2026) plus 131 more meditations resolved
  from **six dated Cross-Reference passes** (documented editorial review, not automated bulk import).
  Every reviewed record carries labeled, source-cited connections to other records — `continues`,
  `answers`, `open question`, or `echoes` (a cross-month thread bridge) — each traceable to the
  specific pass or map section that justifies it. Nothing is asserted without a citation.
- **256 more records are "mirrored"** — the complete original text, the same interactive page, but
  no thread connections claimed yet since none have been reviewed for them. Browse both kinds from
  [`archive.html`](archive.html), searchable and organized by month.
- **Four named threads** run underneath the reviewed chronology, traced meditation-by-meditation in
  the *PLAUD Meditations Corpus Map*: **Zechariah 3** (filthy garments removed, replaced, given away),
  **the Samuel Loop** (the carried, quietly learning to carry), **the Murmuration** (the *maskîlîm*
  are plural), and **the Descent Into Hiddenness** (the arc bends downward). Each is browsable on
  [`threads.html`](threads.html) as its own filtered path — reviewed records only, by design.
- **Corpus Paths** (9 curated reading paths, 48 steps) link to a local page wherever a step's
  meditation could be *confirmed* as the same content (not just a matching filename) — 21 of 48
  so far; the rest are disclosed as external, each with a specific reason, in
  [`assets/corpus-paths-data.js`](assets/corpus-paths-data.js)'s own header comment.

---

## Site map

| Page | Purpose |
|------|---------|
| [`index.html`](index.html) | Landing page: corpus overview, entry invitations, and first-draft Chronological/Thematic/Encounter navigation maps |
| [`mystery.html`](mystery.html) | Mystery Mode — name a doorway (one of 11 questions/states), receive one record drawn from a keyword-matched pool across the 138 reviewed records |
| [`threads.html`](threads.html) | The reviewed thread constellation — full chronology, per-thread filters, and full-text search |
| [`paths.html`](paths.html) | Nine curated reading paths through the corpus (doctrinal spine, Samuel Loop, Murmuration, Descent, Zechariah 3, the Gaze, Surrender & Obedience, Identity & Transformation, Waiting & Timing) |
| [`archive.html`](archive.html) | A full, searchable, month-by-month browsable index of all 394 local records (reviewed and mirrored alike), each linking directly to its page |
| [`record.html`](record.html) | Legacy wrapper page; retained for the landing page's "read the original" no-interpretation link |

---

## Repository structure

```
.
├── assets/
│   ├── design-v2.css              # Site-wide v2 visual system (dark parchment/gold theme)
│   ├── design-v2-logic.js         # Page init, Markdown rendering, graph nav, thread connections,
│   │                               #   related records, audio player init, no-interpretation mode
│   ├── mystery-v2-logic.js        # Doorway selection, keyword-pool routing, no-interpretation link
│   ├── records-data.js            # JC_RECORDS (394 records: 138 reviewed + 256 mirrored),
│   │                               #   JC_EDGES (142 edges), JC_THREADS (4)
│   ├── corpus-paths-data.js       # JC_CORPUS_PATHS — the nine curated reading paths
│   ├── audio-player.js/.css       # Accessible audio player component (dormant — see Audio below)
│   └── beta.js/.css               # Legacy logic, kept for compatibility
├── records/
│   ├── *-v2.html                  # 394 local record pages: 138 reviewed + 256 mirrored
│   ├── *.html (no -v2 suffix)     # Superseded originals, kept as historical artifacts only
│   └── *.md                       # Raw meditation source mirror (410 files, committed — see below)
├── scripts/
│   ├── build-corpus-records.mjs   # Generator: parses the six Cross-Reference passes, resolves
│   │                               #   them to source files, and produces the reviewed -v2.html pages
│   ├── build-mirror-records.mjs   # Generator: produces a local page for every other uploaded
│   │                               #   meditation not yet reviewed (the 256 "mirrored" records)
│   ├── tag-encounter-dimensions.mjs # Computes Encounter Index dimensions + doorway themes
│   └── relink-corpus-paths.mjs    # Confirms and relinks Corpus Paths steps to local pages
├── index.html, mystery.html, threads.html, paths.html, archive.html, record.html
├── plan.md                        # Living project-status document — read this first
├── CHANGELOG.md                   # Dated release notes
└── .github/workflows/deploy.yml   # GitHub Pages auto-deploy on push to master
```

**Also present in this repository:** the raw `records/*.md` source meditations (410 files),
`Corpus Map.md`, `PLAUD Meditations Corpus Map.md`, and the
`Pass 1–8 *-Cross-References.md` documents. This is the private "Personal Space" source layer the
generators read from — committed because this repository remains a private Interior Beta, not a
public deploy. All 394 locally published meditations (reviewed and mirrored) are surfaced in the
live site's navigation, primarily via `archive.html`.

`jordan-crossing-interior.html` (the preserved v11 interior record, ~136 MB) is excluded from git —
too large for GitHub, hosted separately.

---

## Mystery Mode doorways

Eleven questions/states, each drawing from a **keyword-matched pool across all 138 reviewed
records** (not a single fixed destination) — the originally curated record always stays in the
pool as a guaranteed fallback:

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
| I want to follow the entire chronology | The union of all four named threads (23 records) |
| I need a quiet place to begin | The preserved interior record (single destination) |
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

- **Not publicly announced or indexed.** Every page carries an explicit
  "INTERIOR BETA · Private workspace · Not for public distribution" banner.
- **No account required, no server-side data collection.** `localStorage` is used only for the
  carry-a-question feature and stays on the reader's own device.
- **GitHub Pages auto-deploys `master`** (see `.github/workflows/deploy.yml`) purely as a
  staging/preview convenience — this is *not* the same thing as a public launch decision.
- **Public launch is a pending, explicit stakeholder decision** — not yet made. It requires final
  QA sign-off and a deliberate choice to lift the "not for public distribution" status, decide on
  pre-publication redaction of private third-party names, and set up indexing/domain/monitoring.
  See `plan.md`'s "Pending human decision" section for the current open items.

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

`node scripts/build-corpus-records.mjs` re-parses the six Cross-Reference pass documents, resolves
newly added entries to source meditation files, regenerates the reviewed `-v2.html` pages, and
rebuilds the generated portion of `assets/records-data.js` (`JC_RECORDS` and same-cluster
`JC_EDGES`). It does **not** touch the hand-authored `JC_THREADS` array, the cross-month `"echoes"`
edges, the `encounter`/`doorwayThemes`/`reviewed` fields, or the mirrored records — see its own
header comment for the exact recovery order. After it runs, in order:

1. `node scripts/build-mirror-records.mjs` — mirrors any raw file not already reviewed
2. `node scripts/tag-encounter-dimensions.mjs` — re-tags the full record set
3. `node scripts/relink-corpus-paths.mjs` — re-checks Corpus Paths steps against the current set

---

## Tech stack

- **HTML5** — semantic markup, no framework
- **CSS3** — hand-written responsive grid and design tokens
- **Vanilla JavaScript** — no build step, no dependencies; `localStorage` for the carry-question
  feature only
- **Node.js** — used only for the offline `scripts/*.mjs` generators, not at runtime
- **GitHub Pages + GitHub Actions** — static hosting and auto-deploy on push to `master`

---

## Roadmap

See [`CHANGELOG.md`](CHANGELOG.md)'s Roadmap section and [`plan.md`](plan.md) for the full,
current list. In brief:

- [ ] Manually resolve the ~27 pass-doc references that couldn't be confidently matched to a
      source file (truncated/inconsistent export filenames)
- [ ] Manually resolve the 27 Corpus Paths steps that couldn't be confidently confirmed as a local
      meditation — see `assets/corpus-paths-data.js`'s header for the specific reason each one failed
- [ ] Review and cross-reference the 256 mirrored meditations against future Cross-Reference passes
      to move them from "mirrored" to "reviewed" (Pass 7 and Pass 8 — 70 more entries, archive
      coverage 171→241 — have been received but not yet integrated into the generator)
- [ ] Upload the ~41 meditations the Corpus Map documents but which aren't yet present in this
      repository, so they too can be mirrored locally
- [ ] Wire in real audio once source files or URLs are available (component is ready)
- [ ] Final QA and stakeholder sign-off
- [ ] An explicit decision on public launch (redaction, indexing, domain, monitoring)

---

## Credits

**Design & Development:** Barak (AI watchman)
**Content & Witness:** Seth Tillotson
**Theology & Editing:** Brother Samuel, Jayden, Sister Katie
**Version Manager:** Copilot CLI Runtime

---

**Soli Deo Gloria**
