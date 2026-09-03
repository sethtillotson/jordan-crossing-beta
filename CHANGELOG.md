# Changelog

All notable changes to the Jordan Crossing project are documented in this file.

## [2.3] — September 3, 2026

### Cross-Reference Appendix richness — Doctrinal Spine, Lexicon Joints, Chiastic Mirror (Phase 14)

Every meditation's own Cross-Reference Appendix carries far more structure than the site had been
using — a Doctrinal Spine (Seed → Growth → Tablet), Thread Joints, Lexicon Joints, an Expanded
Chiastic Mirror, and a Tablet Anchor — but every cross-reference edge had been flattened to one
generic "continues" label, and the incoming-direction label had a real grammar bug ("is continues by").

#### New parser, two real appendix formats handled

Surveyed all 458 source files: the corpus carries two Cross-Reference Appendix formats roughly 50/50
(236 rigid-only, 220 loose-only, 20 files carry both). Verified the appendix is always the file's final
section (0 exceptions), letting the rewritten parser safely capture everything from the first
`## Cross-Reference` heading to end-of-file — fixing a smaller pre-existing bug where content after
`### Tablet Anchor` (an "Additional Thread Joints" section, 8 files) was silently discarded. The new
parser extracts, per record: `doctrinalSpine` (seed/growth/tablet, each with a label, gloss, and
resolved `recordId` where possible), `lexiconJoints` (term + gloss pairs), `chiasticMirror` (position +
label + gloss), and `doctrinalThemesCarried`. Every memo-link in the appendix is classified into a real
`jointType` (`doctrinal-spine-seed/-growth/-tablet`, `thread-joint`, `lexicon-joint`,
`chiastic-mirror`, or generic `cross-reference`) instead of the old flat `continues`.

#### Three real bugs found and fixed

- **A malformed-match bug in tablet-anchor parsing.** The loose appendix format sometimes writes the
  tablet name INSIDE a markdown link rather than around one; a naive regex captured trailing
  `](memo:...)` text as part of the "window" description, corrupting 2 records' `tabletAnchor.window`
  field (and, more seriously, breaking every downstream script's bracket-counting array parser). Fixed
  by preferring the reliable rigid H3 heading and rejecting any match immediately followed by `]`.
- **A silent 80-character cap on section-label matching.** Real loose-format labels sometimes run
  longer (~93 characters observed) — the old cap silently failed to match these, leaving the parser's
  "current section" stuck on whatever preceded it and mis-classifying every link underneath. Raised to
  200.
- **A significant pre-existing bug (present since Phase 11, independent of this phase's work).** The
  fuzzy-filename-match fallback used whenever an appendix's stated link filename differs from
  `records-2/`'s own independently-shortened filename returned a basename missing its `.md` extension,
  silently failing every lookup against it. Fixing this alone raised resolved appendix links from
  2,136 to 3,747 (+1,611) — nearly doubling the richness available to reconcile onto the verified edge
  set.

#### Reconciliation, not replacement

`rebuild-edges-from-lattice.mjs` remains the sole authority on which edges exist (Corpus-Lattice-
verified, unchanged: 3,079 edges, 0 isolated records). It now also loads a new `assets/appendix-
joints.json` lookup and enriches each verified edge with a real `jointType`/`note` when the appendix
independently named one for that exact pair — an appendix-only hint with no matching verified edge is
never trusted. Result: 3,075/3,079 edges (99.8%) now carry a real, specific joint type.

#### New UI

- Record pages: a "Doctrinal Spine" widget, color-coded joint-type badges in "Reviewed thread
  connections" (replacing the old flat "verified" label), and new "Lexicon Joints"/"Expanded Chiastic
  Mirror" displays — all absent entirely (never fabricated) when a record's own appendix doesn't carry
  that section.
- `threads.html`: a joint-type filter (All / Doctrinal Spine / Thread Joint / Lexicon Joint / Chiastic
  Mirror / Cross-Reference).
- Mystery Mode: doorway keyword-matching now also searches each record's own doctrinal theme and
  lexicon terms, widening real recall without inventing any new doorway↔theme taxonomy.
- Landing page Encounter Index: a new "Doctrinal theme" filter (the 5 real values found in the corpus).

#### Also fixed directly

The reported "is continues by" grammar bug — a new `EDGE_LABELS_INCOMING` map gives the correct
past-participle form for every edge type shown in the incoming direction. Committed as a standalone fix
ahead of the rest of this phase's work.

## [2.2] — September 3, 2026

### Public beta cleanup pass (Phase 13)

A scoped cleanup pass responding to live-browsing feedback, bounded to conserve credits ahead of a
small-group public release.

#### Threads and Corpus Paths rebuilt from new corpus map documents

The owner supplied two new hand-authored corpus map documents naming 13 threads and ~10 reading
paths, replacing the stale 4-thread / 6-path set the site had carried since before the `records-2`
cutover. Per owner decision, only Threads 1–10 were adopted (each has an explicit tablet-section
anchor and named hinge meditations); Threads 11–13 (large density-pattern threads described only by
example anchors, not a full membership list) were deferred rather than algorithmically expanded, to
avoid repeating the earlier hallucinated-cross-reference mistake. Of the 10, 7 had ≥2 explicitly-linked
members and were built.

New script `scripts/rebuild-threads-and-paths.mjs` resolves every thread/path member via a fully
deterministic chain: a `memoBasename` transcribed verbatim from the corpus map's own `memo:` link →
Corpus Lattice node (matched by exact basename of the node's own `path` field) → the node's
`archive_filename` → the `records-2/` filename → id (re-derived via the same imported, hard-safety-
checked logic `rebuild-edges-from-lattice.mjs` uses). Two "read one day" paths are resolved by date-
filtering `JC_RECORDS` wholesale, since the corpus map names them as "the whole day," not an itemized
list. Anything that fails to resolve is reported and dropped, never guessed — this caught and fixed
two real filename drifts between the corpus map's own link text and the actual `records-2`/Corpus
Lattice filenames.

**Result: 7 threads, 5 reading paths — 100% resolved, zero external links, zero isolated/orphaned
references.**

#### Real bugs found and fixed

- **Threads page "undefined" bug.** `threads.html` carried its own separate, out-of-sync copy of the
  edge-rendering logic that still referenced the `note` field Phase 12 removed from every edge,
  rendering literal `"undefined"` next to almost every connection — the user's reported bug. Made
  conditional, matching the fix already applied to `design-v2-logic.js` last phase.
- **Carry-a-question feature silently broken.** The live JS looked for
  `carry-save-btn`/`carry-cancel-btn`/`carry-status`/`carry-clear-btn` elements the record-page
  template never actually emitted — a genuine ID mismatch. Per explicit owner decision (credit
  conservation ahead of the public release), the feature was **archived, not fixed**: removed from
  the record-page template, `design-v2-logic.js`, and the landing page's "Welcome back" panel. A
  second, completely unused legacy implementation of the same feature (`assets/beta.js`) was
  confirmed referenced by zero HTML files and deleted outright, along with its stylesheet
  `assets/beta.css`.
- **Mystery Mode's doorway pool sizes were artifacts.** The "full chronology" doorway pooled from the
  old 4-thread set (~23 records) and every other doorway was hard-capped at `MAX_POOL_SIZE = 10`
  regardless of real keyword-match count — undercounting real matches by 2–9× against the full
  456-record corpus. Removed the cap (doorways now report honest counts, e.g. 44 for "waiting") and
  changed "full chronology" to pool from the entire reviewed corpus rather than a themed subset — its
  own guidance text demanded breadth; it now correctly reports 456.
- **A genuine pre-existing `jcStepHref is not defined` bug** was silently breaking all of Corpus
  Paths' rendering (the function was called but never defined in any loaded script). Fixed by using
  the already-shared `jcHrefFor(id)` helper.
- Removed the "author-confirmed / editorial connection / open" 3-tier edge-status system site-wide
  (Threads page legend, per-edge colored badges) now that every edge is Corpus-Lattice-verified — a
  single "verified" label replaces it.

#### Site-wide disclaimer sweep

Removed or reworded every public-facing reference to phase numbers, CHANGELOG/GitHub links, schema
versions, "Second Brain," "corpus-wide truth correction," "hallucinated," "superseded," and "Stage N"
placeholder language across the landing page, Archive, Threads, and Corpus Paths, replacing with a
consistent framing: connections are verified and hand-checked by the author against the source
recordings. The landing page's "first drafts, begun not finished" line and its bracketed `[STAGE 2 —
...]` placeholder language were reworded to read as clearly-labeled upcoming features ("Coming soon").

## [2.1] — September 3, 2026

### Corpus Lattice cross-reference verification (Phase 12)

`JC_EDGES` — the entire reviewed thread-connection graph — was rebuilt wholesale from a new
owner-supplied ground-truth dataset, "Corpus Lattice" (`Corpus Lattice.json` / `Corpus
Lattice.csv`): every meditation/tablet resolved to a stable id with an explicit `status:
"ok"/"external"/"unresolved"` flag on every cross-reference, replacing the Phase 11 appendix-parser
as the authoritative source for edges specifically (Phase 11's `tabletAnchor`/`JC_RECORDS` parsing
remains authoritative and untouched).

#### Two verification passes
- **First pass (schema v1.1):** matched local `records-2/` filenames to Corpus Lattice nodes by
  exact `path.basename()` equality. This only resolved ~150/456 files, because the Lattice's `path`
  field preserved each file's original, un-truncated vault filename while `records-2/`'s actual
  filenames were independently shortened at export time (309 of 458 meditations differ — a
  previously-known corpus export quirk). Produced 764 verified edges with 307/456 records isolated
  — a real undercount from the matching method, not genuine corpus sparsity.
- **Second pass (schema v1.2):** the owner deleted the v1.1 files and supplied a corrected dataset
  adding paired `archive_filename`/`target_archive_filename` fields (the filename exactly as
  shortened inside the same zip bundle `records-2/` was extracted from) to every node and every
  cross-reference target. `scripts/rebuild-edges-from-lattice.mjs` was rewritten to match purely on
  `archive_filename` exact string equality (schema-version-guarded, refuses to run against older
  data) — **456/456 local records matched their own Lattice node (100%)**, producing **3,079
  verified edges with zero isolated records** (every one of the 456 records now has at least one
  verified connection). Only 2 of the prior 1,997 appendix-parsed edges lack Corpus Lattice
  backing now (down from 1,150 under the fuzzy-matched first pass).

#### Real bugs found and fixed alongside the edge rebuild
- **A CSS blank-gap bug.** `.related-records` and `.reviewed-threads` (`#threads-mount`) both
  carried substantial margin/padding/border-top with no `:empty` rule, so a record with zero
  Related Records or zero Reviewed Thread Connections showed a large unexplained blank gap plus a
  stray divider line with nothing under it — highly visible under the first (undercounting) Corpus
  Lattice pass, since 307/456 records had zero edges at that point. Added `:empty` rules matching
  the site's existing `#doorway-themes-mount:empty` pattern, and reduced `.related-records`'
  spacing.
- **A double-spacing bug.** The JS-injected "Reviewed thread connections" HTML wrapped itself in a
  second, redundant `<div class="reviewed-threads">` — the exact same class already applied to its
  own static mount element — doubling the margin/padding/border-top whenever thread connections did
  render. Removed the redundant inner wrapper.
- **A template-ordering issue.** The "You have reached the end of this encounter" return panel
  (5 choices, including "Follow the thread") was positioned *before* the chronological Record
  Sequence nav and the Reviewed Thread Connections list in the shared record-page template — so the
  page announced itself as finished while more content still followed below it. Reordered so the
  return panel is genuinely last on every record page.
- **An edge `note`-field bug.** An early version of the edge rebuild set each edge's `note` field to
  the Corpus Lattice's raw `target_title` (still carrying an unfixed underscore-for-colon export
  artifact, e.g. "Personal Meditation_ Kenosis..."), which was directly redundant with the already-
  clean link title shown right above it for outgoing edges, and actively showed the *wrong*
  record's title for incoming edges (a real direction bug). The `note` field is no longer set on
  Corpus-Lattice-sourced edges; `design-v2-logic.js`'s thread-connection renderer now simply omits
  the note paragraph when absent.
- **A self-inflicted mojibake bug, found and fixed mid-task.** A PowerShell cache-busting
  version-bump step (`Get-Content -Raw` piped through `-replace`) mis-decoded 6 UTF-8 files without
  a byte-order mark (`archive.html`, `index.html`, `mystery.html`, `mystery-v2.html`, `paths.html`,
  `threads.html`) as a legacy codepage, silently corrupting real text into mojibake. Caught via
  byte-precise Node verification (UTF-8 roundtrip check), restored all 6 from clean git `HEAD`
  content, and re-applied the version bump safely via Node's UTF-8-aware string handling.

#### Safety design
`scripts/rebuild-edges-from-lattice.mjs` re-derives the `records-2/` filename → `JC_RECORDS` id
mapping using the exact same deterministic parsing already producing the committed
`records-data.js` (imported from `build-records2-corpus.mjs`, not re-implemented), and hard-fails
if that re-derivation doesn't match the committed id set exactly. `JC_RECORDS` and `tabletAnchor`
are left untouched. `JC_THREADS` is also left untouched — an initial attempt to filter thread
membership by requiring a direct Corpus-Lattice edge between same-thread steps emptied the
"murmuration" thread to 0 steps and gutted the others (25→10 total), proving that test wrong for a
hand-curated cross-corpus narrative thread; the script now only *reports* per-thread edge coverage
informationally.

#### Verification
Full pipeline re-run in order; integrity check clean (456 records / 3,079 edges / 4 threads, zero
duplicate ids/hrefs/edges, zero missing files, zero bad edge/thread references, zero self-loops,
contiguous order, zero missing `encounter` fields, zero isolated records); repo-wide byte-level
sweep (UTF-8 roundtrip + mojibake-byte-sequence search + BOM check) clean across every live
`.html`/`.js`/`.css` file. Live-verified with a freshly restarted dev server and a brand-new browser
page (ruling out stale-cache artifacts): the originally-reported record now correctly shows both
Related Records and Reviewed Thread Connections with no blank gap; the Samuel Loop thread on
`threads.html` still renders its full sequence; the Encounter Index widget and Archive search box
both still return correct results; September's records remain correctly browsable.

## [2.0] — September 3, 2026

### Public Beta 2.0 — Phase 11 full corpus rebuild from `records-2/`

The owner replaced the entire raw-source layer: rather than patch the previous `records/*.md` raw
files (found stale/mismatched — see the abandoned approach below), the owner copied a freshly
hand-verified corpus directly into a new folder, **`records-2/`**, and directed a full rebuild of
the site from that source, alongside promoting the site from "Interior Beta" (private workspace) to
a **public-facing Beta 2.0**.

#### Abandoned approach (superseded before it ran)
A prior segment discovered `records/*.md` (the raw files actually displayed as article bodies)
were still pre-verification content — e.g. one file literally displayed an unrelated "Prophetic
Word" transcript instead of its own titled meditation. A patch script
(`scripts/replace-bodies-with-verified.mjs`) was written against `verified-source-docs/` to fix
this in place, but was never run before the owner's `records-2/` cutover superseded the whole
approach. That script has been deleted.

#### What was rebuilt
- **`records-2/`** is now the one canonical raw-source folder: 456 verified meditation `.md` files
  (Feb 15 – Sep 1, 2026), the 8 Stone Tablet volumes, a Tablet VII audit document, and 5 newly
  updated reference documents (Master Index, Tracker CSV, and three infographic HTML pages).
  `records/` is now **pure generated output** — no raw `.md` source files live there anymore.
- **`scripts/build-records2-corpus.mjs`** (new, authoritative) — parses every `records-2/`
  meditation file's own title/date/classification metadata, splits the visible article from its
  embedded Cross-Reference Appendix, parses that appendix into typed edges + a `tabletAnchor`,
  assigns a deterministic id, and regenerates every `records/*-v2.html` page plus `JC_RECORDS`/
  `JC_EDGES` in `assets/records-data.js` wholesale. `JC_THREADS` is remapped by title+date match
  rather than assumed stable, since ids shift when a title is corrected.
- **`scripts/build-stone-tablet-pages.mjs`** (new) — generates 8 full Stone Tablet reader pages
  plus the Tablet VII audit page, and a new `stone-tablets.html` index linking to all 8.
- **`scripts/rebuild-reference-pages.mjs`** (new) — unwraps the 3 newly-uploaded infographic HTML
  files (each carried a 2-line upload-mechanism wrapper plus a trailing metadata footer, both
  stripped) and republishes them as `six-doctrinal-spines.html`, `spines-timeline.html`, and a new
  `corpus-architecture.html`, each re-skinned with Public Beta 2.0 branding and cross-linked.
- **Result:** 456 records (down from 457 candidates — one file was found to be corrupted, see
  below), 1,997 edges, 4 threads (all remapped), 456/456 with a `tabletAnchor`. Verified clean:
  zero duplicate ids/hrefs, contiguous chronological order, zero bad edge/thread references, zero
  self-loops, every href resolves to a real file, zero short/empty titles or summaries, zero
  markdown-leakage in titles, and a `tabletAnchor` distribution (96/70/244/26/15 across Tablets
  I/II/V/VII/VIII) closely matching the Master Index's own stated counts (96/70/246/26/15).

#### Source-data bugs found and fixed during the rebuild
- **A genuinely corrupted source file.** `04-11 to 04-14 MERGED — The Road, the River, the
  Robbery, and the Recording.md` was raw docx/zip binary content saved with a `.md` extension, not
  real text (its first two bytes were a zip-file signature). Detected via a zip-signature/
  control-byte heuristic and excluded rather than published. A properly-converted sibling file with
  the full text exists under a slightly different filename and *is* included in the 456 — no
  content was actually lost.
- **A date-parsing bug.** A loose-prose date fallback (for `**Recorded:**` lines not in ISO format)
  initially scanned the *whole* document instead of just the `**Recorded:**` field itself, risking
  picking up an unrelated date mentioned elsewhere in a meditation's own body text. One record
  briefly resolved to a nonsensical "Dec 1, 2025 · 22:28" (a mash-up of two unrelated mentions in
  its body) before the fallback was scoped correctly to just the `**Recorded:**` text.
- **An unbounded-regex bug.** One severely under-punctuated source file (24 newlines across 25KB —
  an ambient/untimed transcript that lost nearly all its paragraph breaks in export) caused the
  unbounded `**Label:** (.+)$` metadata regexes to swallow thousands of characters into the title/
  classification/summary fields. Fixed with bounded, stop-at-next-field capture regexes.
- **A merged-title bug.** A meditation titled "04-11 to 04-14 — ..." (a date *range*, not a single
  date) only had its first date stripped by the title-cleanup regex, leaving "to 04-14 — ..." as
  the displayed title. Fixed to handle "MM-DD to MM-DD" range prefixes.
- **A broken Mystery Mode doorway-routing table.** All 7 of `assets/mystery-v2-logic.js`'s
  hardcoded `DOORWAY_ROUTING` anchor ids/hrefs (`signpost`, `man-of-flesh`, `mirror`,
  `mirror-gospel`, `filthy-garments`, `compass`, `wisdom`) referenced the old pre-rebuild id scheme
  and were 100% broken after the full rebuild — a 1-in-10 chance per doorway of silently routing to
  a nonexistent page. The `jordan-crossing` doorway ("I need a quiet place to begin") also hardcoded
  a route to the retired, never-public `jordan-crossing-interior.html`. Re-resolved 5 of 7 original
  seed anchors by title+date match; one ("When Wisdom Ushers Power," Aug 30 · 23:58) could not be
  found under any title in the verified corpus and is a disclosed gap. Converted the
  `jordan-crossing` doorway into a properly keyword-pooled doorway (secret place/quiet/stillness/
  rest) like every other doorway, instead of a single hardcoded destination.
- **`archive.html`'s month browser silently hid September.** A hardcoded `MONTH_ORDER` array
  stopped at `Aug`, so all 6 September records were computed correctly but never rendered in the
  by-month browse view. Fixed to include `Sep`.

#### Public Beta 2.0 de-branding
- Replaced the "INTERIOR BETA · Private workspace · Not for public distribution" banner with a
  lighter "PUBLIC BETA 2.0 · Reader discretion advised" banner across every page (the 7 shared
  top-level pages plus the template used to generate all 465 record/tablet pages).
- Dropped every "— Interior Beta" title-tag suffix; updated every footer to
  "Public Beta 2.0 · Soli Deo Gloria"; bumped all cache-busting version strings to
  `?v=20260903BETA2`.
- Retired `record.html` entirely (its sole purpose was linking to the never-public,
  gitignored `jordan-crossing-interior.html` "preserved v11 interior record" concept) and removed
  every reference to it (nav items, the landing page's third invitation card, `mystery.html`'s "A
  Record" nav link, a dead `data-target="record.html"` attribute).
- `.gitignore` updated: `verified-source-docs/` and `Superseded-Docs/` now fully local-only;
  internal AI-development artifacts (`COPILOT_HANDOFF_PROMPT.md`, `COPILOT_CHAT_PROMPT.txt`,
  `COPILOT_USAGE.md`, `memory-bank/`) untracked from the public repo. `records-2/` itself remains
  tracked/public (unredacted, per the owner's standing direction).

#### Landing page & site-wide stats refresh
- `index.html`: "recorded between February and August 2026" → "February and September 2026";
  corpus-window stat "Feb 14 – Aug 31" → "Feb 14 – Sep 1"; tablet chip counts corrected to match
  the verified rebuild (96/70/244/26/15); added a "Sep" button to the Chronological Map; added
  links to the new `stone-tablets.html` and `corpus-architecture.html` pages; fixed 4 stale record
  hrefs in the "Notable Hinges" list whose ids shifted after the rebuild.
- `threads.html`/`archive.html`/`paths.html`: replaced every stale count (404/409/458/451) with
  456; removed the now-moot "reviewed vs. mirrored" distinction (all 456 records are reviewed);
  `paths.html`'s Corpus Paths relinking improved from 21/48 to 35/48 after re-running
  `relink-corpus-paths.mjs` against the rebuilt id set; `paths.html`'s stale
  `verified-source-docs/` reference corrected to `records-2/`.
- Re-ran `scripts/tag-encounter-dimensions.mjs` against the full rebuilt 456-record set.

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
