# The Jordan Crossing

## Interior Beta for the Living Topology Corpus

**Status:** Interior Beta · Private workspace · Not for public distribution
**Last major update:** September 1, 2026
**Reviewed corpus:** 138 published records (of 451 in the direct archive)
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
a "Mystery Mode" entry point, a reviewed thread constellation, curated reading paths, and a
metadata-only archive view of the wider corpus.

For the full build history, current status, and open items, see [`plan.md`](plan.md) (living
project-status document) and [`CHANGELOG.md`](CHANGELOG.md) (dated release notes).

---

## The reviewed corpus, in brief

The underlying witness record holds **451 meditations** (Feb 14 – Aug 30, 2026) plus one received
prophetic word. Per the project's own governing design document, that corpus is introduced to this
site **in reviewed layers**, not as a bulk export:

- **138 records are fully reviewed and published** as complete pages under `records/*-v2.html` —
  the original 7 curated "Tablet VIII" seeds (Aug 29–30, 2026) plus 131 more meditations resolved
  from **six dated Cross-Reference passes** (documented editorial review, not automated bulk import).
- Every published record carries labeled, source-cited connections to other records — `continues`,
  `answers`, `open question`, or `echoes` (a cross-month thread bridge) — each traceable to the
  specific pass or map section that justifies it. Nothing is asserted without a citation.
- **Four named threads** run underneath the chronology, traced meditation-by-meditation in the
  *PLAUD Meditations Corpus Map*: **Zechariah 3** (filthy garments removed, replaced, given away),
  **the Samuel Loop** (the carried, quietly learning to carry), **the Murmuration** (the *maskîlîm*
  are plural), and **the Descent Into Hiddenness** (the arc bends downward). Each is browsable on
  [`threads.html`](threads.html) as its own filtered path.
- The remaining **~280 meditations** (of the ~407–410 mirrored locally) stay **metadata-only** on
  [`archive.html`](archive.html) — counted by month, dated, but not yet titled, quoted, or
  published — until a future review pass verifies them the same way.

---

## Site map

| Page | Purpose |
|------|---------|
| [`index.html`](index.html) | Landing page: corpus overview, entry invitations, and first-draft Chronological/Thematic/Encounter navigation maps |
| [`mystery.html`](mystery.html) | Mystery Mode — name a doorway (one of 11 questions/states), receive one record drawn from a keyword-matched pool across all 138 reviewed records |
| [`threads.html`](threads.html) | The reviewed thread constellation — full chronology, per-thread filters, and full-text search |
| [`paths.html`](paths.html) | Nine curated reading paths through the corpus (doctrinal spine, Samuel Loop, Murmuration, Descent, Zechariah 3, the Gaze, Surrender & Obedience, Identity & Transformation, Waiting & Timing) |
| [`archive.html`](archive.html) | Metadata-only view of the wider ~451-meditation corpus, by month, with an explanation of why full text isn't published yet |
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
│   ├── records-data.js            # JC_RECORDS (138 records), JC_EDGES (142 edges), JC_THREADS (4)
│   ├── corpus-paths-data.js       # JC_CORPUS_PATHS — the nine curated reading paths
│   ├── audio-player.js/.css       # Accessible audio player component (dormant — see Audio below)
│   └── beta.js/.css               # Legacy logic, kept for compatibility
├── records/
│   ├── *-v2.html                  # 138 published, reviewed record pages
│   ├── *.html (no -v2 suffix)     # Superseded originals, kept as historical artifacts only
│   └── *.md                       # Raw meditation source mirror (NOT committed — see below)
├── scripts/
│   └── build-corpus-records.mjs   # Generator: parses the six Cross-Reference passes, resolves
│                                   #   them to source files, and produces the *-v2.html pages
├── index.html, mystery.html, threads.html, paths.html, archive.html, record.html
├── plan.md                        # Living project-status document — read this first
├── CHANGELOG.md                   # Dated release notes
└── .github/workflows/deploy.yml   # GitHub Pages auto-deploy on push to master
```

**Also present in this repository (unreviewed source layer):** the raw `records/*.md` source
meditations (410 files), `Corpus Map.md`, `PLAUD Meditations Corpus Map.md`, and the
`Pass 1–8 *-Cross-References.md` documents. This is the private "Personal Space" source layer the
generator reads from — committed because this repository remains a private Interior Beta, not a
public deploy. Only the 138 *published-and-reviewed* meditations are surfaced anywhere in the
live site's navigation; the rest stay metadata-only on `archive.html` until reviewed.

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

### Regenerating the reviewed corpus

`node scripts/build-corpus-records.mjs` re-parses the six Cross-Reference pass documents, resolves
newly added entries to source meditation files, regenerates the `-v2.html` pages, and rebuilds the
generated portion of `assets/records-data.js` (`JC_RECORDS` and same-cluster `JC_EDGES`). It does
**not** touch the hand-authored `JC_THREADS` array or the cross-month `"echoes"` edges, which live
in the same file below the generated block — extend those by hand if a thread hinge resolves to a
newly generated page.

---

## Tech stack

- **HTML5** — semantic markup, no framework
- **CSS3** — hand-written responsive grid and design tokens
- **Vanilla JavaScript** — no build step, no dependencies; `localStorage` for the carry-question
  feature only
- **Node.js** — used only for the offline `scripts/build-corpus-records.mjs` generator, not at runtime
- **GitHub Pages + GitHub Actions** — static hosting and auto-deploy on push to `master`

---

## Roadmap

See [`CHANGELOG.md`](CHANGELOG.md)'s Roadmap section and [`plan.md`](plan.md) for the full,
current list. In brief:

- [ ] Manually resolve the ~27 pass-doc references that couldn't be confidently matched to a
      source file (truncated/inconsistent export filenames)
- [ ] Manually verify and relink Corpus Paths steps to local pages where safe (filename-based
      automation was tried and found unsafe — some source filenames don't match their own content)
- [ ] Review and publish further layers of the remaining ~280 unreviewed meditations (Pass 7 and
      Pass 8 — 70 more entries, archive coverage 171→241 — have been received but not yet
      integrated into the generator)
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
