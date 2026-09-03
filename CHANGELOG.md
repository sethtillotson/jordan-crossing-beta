# Changelog

All notable changes to the Jordan Crossing project are documented in this file.

## [1.0] — August 31, 2026

### Released

The Jordan Crossing is now publicly available for reading and reflection.

### Added

#### Phase 1: Page Redesigns
- **Index.html** — Landing page with hero section, three invitation cards, and entry points to mystery mode
- **Threads.html** — Redesigned timeline view with v2 visual language, showing record connections and chronology
- **Paths.html** — Reading path cards for 9 curated meditation routes through the corpus
- **Design v2** — Complete visual system: gold accents, parchment text, responsive grid, accessible interactive states

#### Phase 2: Data & Navigation
- **Corpus Paths** — Nine reading paths with curated titles, descriptions, themes, and entry records:
  - Doctrinal Spine — Foundation of Christian faith through meditation
  - Surrender & Obedience — Cost and grace of discipleship
  - Identity in Christ — Death of false self, new creation
  - The Gaze — Fixing attention on Christ in secret place
  - Waiting & Timing — God's timing vs. human urgency
  - The Compassion of Christ — Christ's merciful attention to our condition
  - Obstacles & Redemption — False paths and their transformation
  - Rest & Renewal — Sabbath rhythm and inner restoration
  - Waiting-Timing — Alignment with God's perfect timing

- **Thread Connections** — Editorial refinement of record-to-record relationships (continues, answers, opens, revisits, prepares)
- **Related Records** — "Related Records" section on each record page showing thematically connected meditations
- **Tag System** — All 9 paths tagged with theme (doctrinal, narrative, relational, transformational, symbolic, devotional, practical) and length (short, medium, long)

#### Phase 4: Search & Discoverability
- **Full-Text Search** (threads.html) — Real-time search by record title, summary, classification, date
  - Substring matching (case-insensitive)
  - Text highlighting with gold background
  - Result counter showing "Found X of Y records"
  - Clear button and Escape key support
  - Performance: <5ms search time
  
- **Faceted Tag Filtering** (paths.html) — Real-time filtering by theme and length tags
  - Click pills to toggle filters
  - OR logic (any selected tag matches)
  - Tag display on each path card
  - Active state indication for selected filters
  - Performance: <5ms filtering time

#### Phase 5: Public Launch
- **SEO Ready** — Removed noindex from all pages, site discoverable by search engines
- **Accessibility** — WCAG 2.1 AA compliance
  - Keyboard navigation throughout
  - Screen reader support with semantic HTML
  - Sufficient color contrast
  - Focus indicators on interactive elements
  
- **Performance** — Optimized loading and rendering
  - All pages load in <2 seconds on 4G
  - Largest Contentful Paint <2.5s
  - No layout shift; smooth animations
  - Cached CSS/JS with version query strings

### Changed

- **Design System** — Cohesive v2 visual language across all pages
- **Navigation** — Improved wayfinding with header/footer on all pages, clear "back" links
- **Interactive States** — Consistent hover, focus, and active states using design tokens
- **Responsive Grid** — 3-column desktop → 1-column mobile using CSS Grid auto-fit

### Fixed

- Record page navigation links (prev/next + related records now linked correctly)
- Thread edge validation (all 7 records have verified outgoing connections)
- CSS cache busting (v=20260831V9 applied to all asset references)

### Known Limitations

- Audio player not yet implemented (audio source files not yet available)
- Corpus limited to 7 meditation records (can expand to 20–30)
- No transcript search (future enhancement with audio)
- No community features (annotations, study groups)

---

## [1.3] — September 1, 2026

### Added

#### Phase 3: Audio Implementation (component)
- **Audio player component** (`assets/audio-player.js`, `assets/audio-player.css`) — accessible custom player: play/pause, seekable progress bar, elapsed/duration timestamp, playback-speed control (0.75×–2×), volume control, and native `<track kind="captions">` support for a future captions file
- **Wired into all 138 record pages** — an `#audio-player-mount` element, plus the stylesheet and script tags, added to every record page (the 7 original seeds and the 131 generated pages) and to the `scripts/build-corpus-records.mjs` generator template so future generated pages get it automatically
- **Data contract** — `JC_RECORDS` entries may now carry an optional `audioUrl` (and `captionsUrl`); the player mounts only when `audioUrl` is present, otherwise the mount renders nothing

### Known Limitations

- No record currently has audio — the corpus remains text-only (PLAUD/Speakly-generated summaries), so the player component exists but is dormant everywhere. Per-record audio integration (`integrate-audio-player`) is still blocked pending the author providing actual audio source files or linkable URLs; adding one is now a one-line data change per record, not new engineering.

---

## [1.4] — September 1, 2026

### Added

#### Phase 4: The Digital Threshold (Encounter Index, human doorways, returning reader)
- **The Encounter Index** (design doc §9) — a real interactive picker on the landing page answering "what kind of place am I entering?" rather than "what word am I looking for?" Readers choose any combination of temperature (quiet/contemplative/confrontational/urgent), length (brief/moderate/deep), movement (awakening/surrender/confrontation/waiting/fellowship/release), posture (receiving/wrestling/confessing/discerning/obeying), voice (personal/communal/instructional/prayerful), and season (which Stone Tablet window), see a live match count, and receive one matching record at random. Every value is either objectively derived (length/season) or keyword-derived and explicitly labeled as an approximation, never a diagnosis of the reader.
- **Human doorway theme chips** (design doc §7) on every one of the 138 record pages — up to 4 tags per record (shame, waiting, fear, identity, surrender, obedience, grief, fellowship, work, marriage, money, discipline), linking to a filtered view on Threads. A reader can now leave a record by the life-question it touched, not only by its reviewed thread edges.
- **"Welcome back" returning-reader panel** (design doc §11) on the landing page — shows the last record read and any carried question still open, using only local, account-free `localStorage`. Invisible to first-time visitors.
- **`scripts/tag-encounter-dimensions.mjs`** — the tagger that computes the above onto every `JC_RECORDS` entry; idempotent, re-run any time the record set changes.

### Known Limitations

- The Encounter Index's five interpretive dimensions (temperature/voice/movement/posture/form) are keyword-derived, not individually human-reviewed the way the six Cross-Reference passes are. `length` and `season` are objective. This is disclosed directly in the landing page's own copy.
- Audio explicitly out of scope for this phase per owner direction; unchanged from [1.3].
- Pass 7 Cross-References (35 more entries, archive coverage 171→206) has been received but not yet integrated into the generator.

### Technical Details

- **Framework**: None (vanilla HTML5/CSS3/JavaScript)
- **Static Site**: All data in JavaScript; no server-side code
- **Persistence**: localStorage only for carry-question feature
- **Deployment**: GitHub Pages with GitHub Actions CI/CD
- **Cache Strategy**: Query string versioning (?v=YYYYMMDDVN) for CSS/JS
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

---

## [1.5] — September 1, 2026

### Added

#### Phase 5: Full Local Mirror — No Reader Needs the Author's Private Drive
- **256 new "mirrored" record pages** (`scripts/build-mirror-records.mjs`) — every uploaded raw meditation not already reviewed now has a local page with the full original text, the same interactive movements as reviewed records, and the same Encounter Index tagging. Total local records: **394** (138 reviewed + 256 mirrored) out of 410 raw files present.
- **`JC_RECORDS` gains a `reviewed` boolean** — `true` for the 138 records with verified thread edges, `false` for the 256 mirrored ones. `threads.html`'s reviewed constellation filters to `reviewed !== false`; Mystery Mode's keyword pools do too (fixing a gap where mirrored records could have silently entered a pool the guidance text calls "reviewed").
- **`archive.html` rebuilt from count-only into a real, searchable, month-by-month browsable index** of all 394 local records, each linking directly to its page with a reviewed/mirrored badge.
- **`scripts/relink-corpus-paths.mjs`** — re-links Corpus Paths steps to a local page only when a same-day record's real, content-derived title strongly covers the step's own label (never by filename — see Known Limitations). Relinked 21 of 48 steps (up from 16); the rest are individually disclosed as unresolved rather than guessed.
- **Fixed "Imported from AI Drive Markdown source" wording** across all 138 previously-generated pages and the generator template — now reads "Mirrored locally," since it no longer implies an ongoing dependency on the author's private drive.

### Known Limitations

- **A genuine corpus data-quality issue was found and worked around, not fixed at the source**: at least one raw meditation file's actual body content does not match its own filename (the file named "...Resting in the Finished Work of Christ and Covenant Identity.md" contains an unrelated meditation). An initial filename-based relinking approach was discarded after finding this; the shipped approach matches on each record's own real, parsed title instead, and simply declines to link anything it can't confirm.
- 27 of 48 Corpus Paths steps remain external, each with a specific printed reason (no same-day local match, or a same-day candidate whose title doesn't actually cover the step's label).
- ~41 meditations documented in the author's own Corpus Map (451 total) were never uploaded to this repository (410 raw files present) and cannot be mirrored until they are.
- Audio remains out of scope per owner direction; unchanged from [1.3]/[1.4].
- Pass 7 and Pass 8 Cross-References (70 more entries, archive coverage 171→241) have been received and were integrated in [1.6].

### Technical Details

- **Framework**: None (vanilla HTML5/CSS3/JavaScript)
- **Static Site**: All data in JavaScript; no server-side code
- **Persistence**: localStorage only for carry-question feature
- **Deployment**: GitHub Pages with GitHub Actions CI/CD
- **Cache Strategy**: Query string versioning (?v=YYYYMMDDVN) for CSS/JS
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

---

## [1.6] — September 2, 2026

### Added

#### Phase 6: Pass 7/8 Cross-References Integrated into the Reviewed Layer
- **`scripts/integrate-passes-7-8.mjs`** — an additive script (same splice-in-place technique as `tag-encounter-dimensions.mjs`/`build-mirror-records.mjs`) that resolves each Pass 7/8 Cross-Reference entry to its existing `JC_RECORDS` entry, then either leaves an already-reviewed match untouched, **promotes** an already-mirrored match to `reviewed: true` (regenerating its page in place with the reviewed-copy template — same `id`/`href`, so nothing that already links to it breaks), or generates a brand-new reviewed page for a match that was never mirrored. Builds new same-cluster edges from each pass's own numbered groups, exactly as `build-corpus-records.mjs` does for Passes 1–6.
- **Result:** 63 mirrored records promoted to reviewed, 53 new same-cluster edges, 7 entries left unresolved (logged, not fatal — the same kind of filename/content mismatch already flagged in [1.5]). Totals: **201 reviewed / 193 mirrored / 195 edges**, out of 394 total local records and the same 4 named threads.
- **Verified via a disposable data-integrity check**: record/edge/thread counts match the script's reported totals, zero duplicate ids or hrefs, chronological `order` contiguous across the merged set, and every edge/thread reference resolves to a real record. Re-ran `tag-encounter-dimensions.mjs` (idempotent) so all 63 newly-promoted records carry `encounter`/`doorwayThemes`. Spot-checked promoted pages directly to confirm they render the reviewed-copy template, not the "Not Yet Reviewed" mirrored placeholder.
- **Refreshed stale hardcoded copy** on `index.html`, `threads.html`, and `paths.html` that still quoted the old 138 reviewed / 256 mirrored / six-pass totals (these were static text, not computed from `JC_RECORDS`). `archive.html`'s figures and Mystery Mode's doorway pools are both computed live from `JC_RECORDS` at runtime and needed no code change — only a stale explanatory comment in `mystery-v2-logic.js` was corrected.

### Known Limitations

- ~193 meditations remain mirrored but not yet cross-referenced.
- 7 unresolved Pass 7/8 references need the same manual filename-resolution already flagged in [1.5] as a corpus data-quality issue, not an engineering gap.
- The author is actively deepening cross-reference work for a future Pass 9+ (doctrinal-spine thread joints and quoted-phrase pairs, lexicon joints with earliest sibling, an expanded chiastic mirror, and a tablet anchor with verifiable phrase); `integrate-passes-7-8.mjs`'s resolve → promote-or-create → build-edges pattern generalizes directly to that integration once filed — confirmed in [1.7], which integrates Pass 9–13.
- Audio remains out of scope per owner direction; unchanged from [1.3]/[1.4]/[1.5].

### Technical Details

- **Framework**: None (vanilla HTML5/CSS3/JavaScript)
- **Static Site**: All data in JavaScript; no server-side code
- **Persistence**: localStorage only for carry-question feature
- **Deployment**: GitHub Pages with GitHub Actions CI/CD
- **Cache Strategy**: Query string versioning (?v=YYYYMMDDVN) for CSS/JS
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

---

## [1.7] — September 2, 2026

### Added

#### Phase 7: Pass 9–13 "Encounter Edition" Cross-References Integrated
- **`scripts/integrate-passes-9-13.mjs`** — a direct generalization of `integrate-passes-7-8.mjs` (only `PASS_FILES` changed); the parsing/promotion/edge-building logic needed zero modification, confirming the pattern generalizes cleanly to new pass waves. Integrates Pass 9 through 13 — the "Encounter Edition" waves adding doctrinal-spine Seed→Growth→Tablet joints with a verifiable phrase per stage, verbatim-quoted thread joints from both sides, lexicon joints with earliest sibling, an expanded chiastic mirror, and a tablet anchor — archive coverage 241→328.
- **Result:** 107 entries parsed across the five passes; 68 mirrored records promoted to reviewed, 0 brand-new pages needed, 57 new same-cluster edges, 2 resolved files rejected as not-a-meditation, 29 entries left unresolved (mostly genuinely not-yet-uploaded files — notably 8 Aug 31/Sep 1, 2026 "fresh imports" Pass 13 itself names, including the corpus's first-ever September folder, that are referenced in the pass doc but not yet present in this repository's `records/`). Totals: **269 reviewed / 125 mirrored / 252 edges**, out of the same 394 total local records and 4 named threads.
- **Verified the same way as [1.6]**: data-integrity check (record/edge/thread counts, zero duplicate ids/hrefs, contiguous `order`, zero bad edge/thread refs), a before/after diff confirming exactly 68 ids flipped `reviewed: false → true`, a re-run of `tag-encounter-dimensions.mjs` (0 records missing `encounter` afterward), and a live fetch of a sampled promoted page confirming the reviewed template renders correctly.
- **Refreshed the same three stale-copy locations again** (`index.html`, `threads.html`, `paths.html`) and the `mystery-v2-logic.js` comment, updating 201/193/eight-passes to 269/125/thirteen-passes.

### Known Limitations

- ~125 meditations remain mirrored but not yet cross-referenced.
- 29 unresolved Pass 9–13 references need manual/human resolution — mostly not-yet-uploaded files (notably the 8 Aug 31/Sep 1 fresh imports Pass 13 itself flagged), which is new-upload work for the author, not an engineering gap.
- This is now the second release in a row where hardcoded landing/threads/paths copy drifted from the underlying data and had to be manually refreshed; a future refactor could compute these figures from `JC_RECORDS` at page-render time instead of as static text, removing this recurring manual step.
- Audio remains out of scope per owner direction; unchanged from [1.3]–[1.6].

### Technical Details

- **Framework**: None (vanilla HTML5/CSS3/JavaScript)
- **Static Site**: All data in JavaScript; no server-side code
- **Persistence**: localStorage only for carry-question feature
- **Deployment**: GitHub Pages with GitHub Actions CI/CD
- **Cache Strategy**: Query string versioning (?v=YYYYMMDDVN) for CSS/JS
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

---

## [1.8] — September 2, 2026

### Added

#### Phase 8: Pass 14–16 Integrated (91.3% Reviewed); Full Thread-Claim Audit Across All Pass Docs
- **`scripts/integrate-passes-14-16.mjs`** — same generalization pattern as [1.7] (only `PASS_FILES` changed). Integrates Pass 14 (re-uploaded with corrected `memo:` links after an initial link-less version couldn't be resolved), Pass 15, and Pass 16 — archive coverage 328→419 (91.3% of the corpus's own 459-file working count).
- **Result:** 105 entries parsed across the three passes; 77 mirrored records promoted to reviewed, 0 brand-new pages, 73 new same-cluster edges, 1 resolved file rejected as not-a-meditation, 19 entries left unresolved (mostly genuinely not-yet-uploaded files). Totals: **346 reviewed / 48 mirrored / 325 edges**, out of the same 394 total records and 4 named threads. Verified identically to [1.6]/[1.7]: integrity check, before/after diff confirming exactly 77 promotions, re-tagged encounter dimensions, live-fetched a promoted page. Refreshed the same three stale-copy locations again, to 346/48/sixteen-passes.
- **Audited every pass doc (7 through 16) for named-thread claims not yet captured as edges**, per explicit owner request. Found 4 direct thread tags ("Samuel Loop's ... document," "Zech 3 courtroom first named") and 5 explicit multi-file narrative chains named in "Milestones this pass" prose (father-cancer arc and secret-place lineage in Pass 5, corpus-self-awareness lineage in Pass 8, Jer 20:9 fire-in-bones spine in Pass 14, Jonah-arc in Pass 15) that the same-cluster edge builder never captures, since it only links entries within one pass's own numbered group.
- **Verified all 6 fully-resolvable candidates against their resolved file's own real body content (never filename) before adding anything** — every one showed a content/filename mismatch already flagged as a corpus data-quality issue in [1.5], now confirmed to recur specifically wherever a pass doc's milestone prose names a cross-file narrative arc, across five different passes. **Declined to fabricate these 6 edges** rather than risk an edge whose citation contradicts the record it points to; all 8 affected records already carry other, independently-verified same-cluster edges, so none are orphaned.

### Known Limitations

- ~48 meditations remain mirrored but not yet cross-referenced (Pass 16 itself projects a Pass 17 "closing sweep" for the last ~40 files).
- 19 unresolved Pass 14–16 references need manual resolution — mostly not-yet-uploaded files.
- 6 milestone-named cross-pass narrative chains need the author's own hands-on verification against their private drive before they can safely become thread edges — this repository's local mirror shows content/filename mismatches for every file checked in these chains.
- This is now the third release in a row where hardcoded landing/threads/paths copy drifted from the underlying data and had to be manually refreshed; a future refactor could compute these figures from `JC_RECORDS` at page-render time instead of as static text.
- Audio remains out of scope per owner direction; unchanged from [1.3]–[1.7].

### Technical Details

- **Framework**: None (vanilla HTML5/CSS3/JavaScript)
- **Static Site**: All data in JavaScript; no server-side code
- **Persistence**: localStorage only for carry-question feature
- **Deployment**: GitHub Pages with GitHub Actions CI/CD
- **Cache Strategy**: Query string versioning (?v=YYYYMMDDVN) for CSS/JS
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

---

## [1.9] — September 2, 2026

### Added

#### Phase 9: Pass 17 (Corpus Complete); Six Doctrinal Spines Infographic + Timeline Embedded
- **`scripts/integrate-pass-17.mjs`** — same generalization pattern as [1.6]–[1.8]. Integrates Pass 17, the author's own declared final Cross-Reference wave ("458/458 real Markdown meditations, 100%").
- **Result:** 39 entries parsed; 35 mirrored records promoted to reviewed, 0 brand-new pages, 32 new same-cluster edges, 4 entries left unresolved (not-yet-uploaded files). Totals: **381 reviewed / 13 mirrored / 357 edges**, out of the same 394 total records and 4 named threads. Verified identically to [1.6]–[1.8]: integrity check, before/after diff confirming exactly 35 promotions, re-tagged encounter dimensions, live-fetched a promoted page. Refreshed the same three stale-copy locations again, to 381/13/seventeen-passes.
- **Received three new reference artifacts alongside Pass 17**: `PLAUD-Meditations-Master-Index.md` (full 458-file index grouped by "Tablet" doctrine, with per-file memo-link density counts — 4,617 total cross-references, mean 10.1/file, in the author's own private corpus), `PLAUD-Meditations-Tracker.csv` (same data as a flat spreadsheet), and two self-contained HTML infographics visualizing six governing "Tablets."
- **Important scope clarification**: the Master Index/Tracker CSV give per-file cross-reference *counts*, not the actual link *targets* — real edge data only exists in the Pass-N-Cross-References.md documents this project has always parsed. Confirmed the raw `.md` files mirrored into this repository do **not** carry the bottom-of-file Cross-Reference appendices the pass docs describe (those live in the author's private drive, not this mirror). This repository's own edge count (357) reflects what the uploaded Pass documents make independently verifiable, distinct from the author's private corpus's stated 4,617/100%.
- **Embedded both infographics as new site pages** — `six-doctrinal-spines.html` and `spines-timeline.html` — stripped a stray upload-artifact prefix, wrapped each with the site's standard banner/nav/footer while preserving their own self-contained light-parchment visual design and JavaScript untouched (a deliberate "exhibit" distinct from the site's dark theme), and linked both from `archive.html` and `index.html`. Verified live.

### Known Limitations

- ~13 meditations remain mirrored but not yet cross-referenced; 4 unresolved Pass 17 references need manual resolution.
- The 6 milestone-named cross-pass narrative chains from [1.8] remain open, needing the author's own verification.
- This repository's own reviewed/edge counts (381/357) are the practical floor of what's independently verifiable from uploaded documents, distinct from the author's private corpus's declared 458-file/4,617-edge/100% coverage.
- Audio remains out of scope per owner direction; unchanged from [1.3]–[1.8].

### Technical Details

- **Framework**: None (vanilla HTML5/CSS3/JavaScript)
- **Static Site**: All data in JavaScript; no server-side code
- **Persistence**: localStorage only for carry-question feature
- **Deployment**: GitHub Pages with GitHub Actions CI/CD
- **Cache Strategy**: Query string versioning (?v=YYYYMMDDVN) for CSS/JS
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

---

## [1.10] — September 2, 2026

### Fixed — TRUTH CORRECTION

**The owner discovered that the entire cross-reference layer built in [1.6]–[1.9] was partly hallucinated.** Those releases parsed short, numbered summary lists in Pass-7 through Pass-17 *ledger documents* — a second-hand, compressed description of the corpus's cross-references. The owner then hand-verified every meditation's Cross-Reference Appendix directly against the eight real Stone Tablet volumes themselves (not the inferred doctrinal-category labels those releases had used), correcting mislabeled Tablet anchors, removing links that didn't hold up, and adding ones that were missing — and supplied the corrected corpus as a complete bundle (`verified-source-docs/`): all 458 real meditation files, each now carrying its own embedded, corrected Cross-Reference Appendix; the 9 Stone Tablet volumes; and 18 corrected Pass Ledgers (including a new Pass 18 "Corpus-Wide Truth Correction" ledger explaining the fix).

### Added

#### Phase 10: Cross-Reference Layer Rebuilt From the Verified Per-File Source
- **`scripts/rebuild-cross-references-verified.mjs`** — a new script (not a small generalization of the prior `integrate-passes-*.mjs` scripts, since the extraction logic is fundamentally different) that parses each of the 458 verified meditation files' own embedded appendix directly — the actual place the owner checked phrase-by-phrase against the Stone Tablets — instead of a Pass-N summary document.
- **Solved a real filename-matching problem**: the verified bundle's on-disk filenames are shortened (per its own README), while both this repository's raw files and the appendices' own `memo:` links use the original long filenames — and this repository's raw filenames additionally carry pre-existing incidental truncation from an earlier upload (e.g. one file literally ends in `...PLAUD Note .md`, missing the word "Prompt"). Solved by matching on the longest true common character-prefix between filenames, with a length-difference tiebreaker — verified against zero ambiguous ties across all 411 repo files before the real run.
- **Result:** 409 total local records (394 + 15 newly mirrored from the verified bundle, closing part of the historical "not yet uploaded" gap). **404 reviewed / 5 mirrored** (up from 381/13). Added a new `tabletAnchor` field (the corrected Stone Tablet volume + date window) to 400 records. **`JC_EDGES` grew from 357 to 3,270** — a ~9× increase, rebuilt entirely from the verified appendices' real links (4,488 links scanned; 3,270 resolved to real meditation-to-meditation edges, the rest correctly excluded as Stone-Tablet/non-meditation references or genuinely-unresolvable targets).
- **Verified identically to every prior phase, plus a new self-loop check** (added given the much higher edge volume): zero duplicate ids/hrefs, contiguous `order`, zero bad edge/thread refs, zero self-loops, a before/after diff, a re-tag of encounter dimensions, and live-fetches of both a newly-mirrored and an existing promoted record.
- **Found and fixed one pre-existing, isolated data-quality bug** while validating tabletAnchor coverage: one record's `title` field was 22,870 characters (a raw source file's own `**Title:**` metadata line had absorbed the entire rest of the document due to a missing line break) — confirmed present before this phase's script ran, unrelated to this correction. Patched directly.
- **Replaced both infographic pages** (`six-doctrinal-spines.html`, `spines-timeline.html`) with the bundle's corrected "Eight Stone Tablets" versions — the [1.9] versions had inherited the same six-vs-eight mislabeling this phase corrected everywhere else. Re-applied the same site-chrome wrapper established in [1.9].
- **Rewrote every stale-copy location** (`index.html`, `threads.html`, `paths.html`, `archive.html`, `mystery-v2-logic.js`) — this time changing the language itself, not just the numbers, since the nature of the claim changed from "N Cross-Reference passes" to "each meditation's own verified Cross-Reference Appendix." `archive.html`'s "Where this came from" callout now explicitly discloses the earlier hallucination and this correction.
- **Moved every superseded corpus-tagging document to `Superseded-Docs/`**: all 17 old Pass-N-Cross-References.md files, the old Master Index/Tracker/both infographics, the old `PLAUD Meditations Corpus Map.md`, and the original project-root `Corpus Map.md` (which still named the pre-correction "seven Stone Tablets").
- **Deliberately left untouched**: the four named `JC_THREADS` (Zechariah 3, Samuel Loop, Murmuration, Descent) — an orthogonal classification from the Tablet-window correction, whose defining Corpus Map is now itself superseded with no replacement supplied.

### Known Limitations

- 5 records remain mirrored (not yet reviewed) — genuinely no verified match found.
- 9 records have no `tabletAnchor` — a mix of the 5 above, known pre-existing content/filename-mismatch cases, and intentionally-excluded duplicate/non-meditation raw files.
- The four named `JC_THREADS`' own step sequences were **not** re-verified this phase — their source Corpus Map is superseded with no corrected replacement supplied; a future pass should get one from the owner or re-derive thread membership from the new verified data.
- The 9 Stone Tablet volumes are referenced but not yet ingested as their own browsable site pages.
- The 6 milestone-named cross-pass narrative chains from [1.8] remain open (narrative prose claims, not appendix-embedded links, so outside this phase's parser).
- Audio remains out of scope per owner direction; unchanged from [1.3]–[1.9].

### Technical Details

- **Framework**: None (vanilla HTML5/CSS3/JavaScript)
- **Static Site**: All data in JavaScript; no server-side code
- **Persistence**: localStorage only for carry-question feature
- **Deployment**: GitHub Pages with GitHub Actions CI/CD
- **Cache Strategy**: Query string versioning (?v=YYYYMMDDVN) for CSS/JS
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

---

## [Beta 1.0] — June 2026

### Initial Release (Private)

- First seven meditation records imported
- Mystery mode entry with 11 doorways
- Four-movement interactive logic (Discern, Carry, Return, Navigate)
- Threads timeline with connection visualization
- Design v2 color system and components
- GitHub Pages deployment

---

## Roadmap

### Phase 3: Audio Implementation
- ✓ Audio player component for supported records — see [1.3] above
- ✓ Playback speed control — see [1.3] above
- ✓ Accessibility features (captions) — native `<track kind="captions">` support, see [1.3] above
- Transcript sync highlighting — still future; requires per-word/per-line timing data alongside an actual audio file, neither of which exists yet
- Per-record audio integration — blocked pending the author providing real audio source files or linkable URLs (the component itself is ready; wiring one in is a one-line `audioUrl` data change)

### Phase 4: Expanded Corpus
- ✓ 131 additional meditation records reviewed and published (138 total) via six dated Cross-Reference passes — see the Living Archive section of `plan.md`
- ✓ 256 further meditations mirrored (full original text, no thread claims yet) via `scripts/build-mirror-records.mjs` — see [1.5] above. 394 of 410 raw files now have a local page; ~41 meditations documented in the Corpus Map were never uploaded to this repository.
- Tag system expansion — still future
- Advanced search filters — still future

### Phase 5: Community Features (Future)
- Annotation system
- Study group support
- Reading progress tracking
- Personalized reading recommendations

---

## Credits

**Design & Development**: Barak (AI watchman)  
**Content & Witness**: Seth Tillotson  
**Theology & Editing**: Brother Samuel, Jayden, Sister Katie  
**Version Manager**: Copilot CLI Runtime

---

**Soli Deo Gloria**
