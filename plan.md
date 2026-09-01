# Jordan Crossing — Build Progress & Next Steps

## Current Status (August 31, 2026)

### Completed ✓
- **Landing, Mystery Mode, Threads, Corpus Paths, Archive:** all five top-level pages redesigned/built with consistent v2 visual language (dark parchment/gold theme), shared header/nav/footer.
- **Mystery Mode canonicalization:** `mystery.html` is the single public route, carrying the full v2 doorway grid (11 doorways), guidance text, focus-visible states, and correct routing to all destination records. `mystery-v2.html` is retired — it meta-redirects to `mystery.html` and is marked `noindex`.
- **No-interpretation route (design doc §6.2):** the "No-interpretation route" link on Mystery Mode now dynamically targets whichever record the chosen doorway leads to (`records/<record>-v2.html?mode=original`), and that query param genuinely hides recommendations, discernment prompts, the carry-a-question tool, and thread bridges on the record page — leaving only title, date, source status, and the original content, with a link back to the full experience.
- **Record presentation:** Markdown embedded in all 7 curated record pages renders as semantic, readable HTML (headings, paragraphs, lists, tables, quotes, emphasis).
- **Related Records / Threads / Corpus Paths routing bug fixed:** `records-data.js` `href` fields previously pointed at the old, unformatted, `beta.css` record pages instead of the redesigned `-v2.html` pages — meaning every Related Records card, Threads timeline link, and Corpus Paths step link silently sent readers to broken/unformatted pages. Fixed all 7 hrefs; verified via browser testing.
- **Full-text search, faceted filters, tagged reading paths** (Phase 4) complete.
- **Public launch prep (partial):** noindex removed, CHANGELOG/DEPLOYMENT/README written, sitemap/robots created, links validated.
- **Accessibility audit:** keyboard navigation, focus-visible outlines, heading hierarchy, alt text/labels, and console cleanliness verified across all public pages. Found and fixed a real contrast bug on `threads.html` (thread-status badges had near-invisible dark-on-dark text left over from a light-theme mockup).
- **Performance/Lighthouse audit:** ran real Lighthouse audits (not simulated) across every public page. Found and fixed: missing favicon (404), `aria-allowed-role` violations (`role="listitem"` directly on `<a>` elements), a WCAG 2.5.3 label/name mismatch on the landing page's invitation cards, and missing meta descriptions on Threads and all 7 record pages. **Final scores: performance/accessibility/best-practices/SEO all 99–100 on every page.**
- **Archive page (Stage 6, metadata-only):** `archive.html` shows the wider corpus's shape by month (count only — no titles, quotations, or names), with an explicit explanation of why full text isn't published yet. See "The living archive" below.

### The living archive (Stage 6) — now a reviewed layer of 138 records
On 2026-08-31 the full raw meditation corpus (~407-410 `.md` files after excluding supporting documents), a Corpus Map, and **six** dated Cross-Reference passes were added under `records/`. These are the private "Personal Space" source layer (the corpus's own working record puts the full count at 451 as of Aug 30, 2026).

The six Cross-Reference passes are the "reviewed layer" the design document itself calls for (§26.13 "introduce the broader corpus in reviewed layers," §26.14 "add thread navigation only as bridges are verified") — each pass tags meditations by which of the four doctrinal threads (Zech 3 / Samuel Loop / Murmuration / Descent) they sit on, their lexicon joints, chiastic mirror, and Stone Tablet anchor. Pass 6's own running total: **171 of 451 meditations threaded.**

Per explicit owner direction (2026-08-31), these reviewed meditations were embedded as full record pages, **as-is and unredacted** — the site remains "INTERIOR BETA / not for public distribution," so any redaction of private third-party names is a pre-public-launch task, not a blocker now.

**What was built:**
- **`scripts/build-corpus-records.mjs`** — a one-time generator that parses all 6 pass documents, resolves each referenced meditation to its raw source file (prefix-fuzzy matching + manual NBSP-filename aliases for filenames with non-breaking spaces), reads each file's own `**Title:**`/`**Recorded:**`/`**Classification:**` metadata (not the filename, since some filenames and bodies don't match — a known corpus data-quality issue the pass docs themselves flag), de-escapes backslash-escaped Markdown, and generates one `records/<id>-v2.html` page per meditation using the same template/CSS/JS as the original 7 seed records.
- The generator also rebuilds `assets/records-data.js`: it merges the new records into `JC_RECORDS` (chronological `order` reassigned across the whole set), and builds new `JC_EDGES` from same-cluster adjacency within each pass's numbered groups — every new edge carries a `source` citation pointing at the specific pass + cluster section, per the file's own governance rule.
- Of the 171 pass-doc references, 160 were unique files; 138 resolved successfully (4 overlapped the existing 7 seed records and were skipped; 27 could not be confidently resolved — mostly filenames the export tool visibly truncated). Of the 134 resolved-and-new files, 3 were rejected by a content-sanity check (no "Opening Observation" section — they turned out to be a Prophetic Word transcript and a template-guidance doc mislabeled under an unrelated meditation's filename), leaving **131 newly published records**.
- **Total published records: 138** (7 original seeds + 131 new). `threads.html` and Related Records both consume `JC_RECORDS`/`JC_EDGES` generically with no hardcoded count, so both scaled to the new size with no code changes.
- `archive.html` counts updated: 138 "fully reviewed & published," 407 "mirrored," 451 "direct-archive count" — replacing the old 7/407/451 figures.
- `threads.html`'s intro copy updated to describe the expanded (not just 7-seed) constellation.
- `paths.html`'s "Editorial Connection" callout updated to explain why the curated reading-path steps were **not** automatically re-linked to the new local pages: attempting this surfaced the same filename/content-mismatch issue above (a step's memo-path resolved to a real local file, but that file's actual title didn't match the curated label) — so re-linking those specific steps needs a manual per-step check, not a filename-matching script. The 7 seed-record steps that already linked locally are untouched.
- Verified via Playwright: zero console errors across every top-level page, the 7 seed records, and 6 randomly-sampled new records; a full end-to-end journey (index → mystery → doorway → record → related record → threads → paths → archive) works at the new 138-record scale; the alpha-composited contrast audit shows zero violations on sampled pages; a Lighthouse spot-check on a random new record page scored Accessibility 100 / Best Practices 100 / SEO 100 / Performance 96 with zero failing binary audits.

**What's left for a future pass:** ~280 of 451 meditations remain outside any of the 6 passes and stay metadata-only in the Archive; the ~27 unresolved pass-doc references need manual filename resolution; Corpus Paths' per-step relinking needs manual (not automated) verification.

The raw `.md` files, Corpus Map, and Cross-Reference passes remain **uncommitted** (present in the working tree for reference, not part of any commit) so the private "Personal Space" source layer doesn't get pushed to a public deploy by accident — only the generated `-v2.html` record pages and `assets/records-data.js` are committed.

### Phase 2 (2026-08-31, later) — the four threads, doorway pooling, landing maps
With the corpus map itself updated to reflect the 138-record reviewed layer, this phase used the six Cross-Reference passes plus the Corpus Map's own §10 ("the four threads, read meditation by meditation") to build real thread-weaving and widen Mystery Mode beyond its original 7 doorway destinations.

**The four named threads.** Resolved each of the four load-bearing threads (Zechariah 3, the Samuel Loop, the Murmuration, the Descent Into Hiddenness) to the actual published record ids that carry them — skipping, and saying so plainly in the edge notes, wherever the Corpus Map names a hinge meditation that hasn't resolved to a local page yet (e.g. Jun 21 "Brought Low, Reclothed, and Sent," Mar 17 "Kenosis"). Added `JC_THREADS` to `records-data.js` (4 threads, 5–10 steps each) and 21 new cross-month `"echoes"` edges — distinct from the existing same-cluster `"continues"` edges — each citing the Corpus Map §10 section it came from. `threads.html` now has a "The four threads" section rendering each as a linked chain with a "Show only this thread" filter (`?thread=zech3|samuel-loop|murmuration|descent`), and a `?q=` param for deep-linking a pre-filled search from elsewhere on the site.

**Fixed dead thread rendering on individual record pages.** While wiring this up, found that `design-v2-logic.js`'s `initGraphNav()`/`initThreadConnections()` — the functions meant to populate `#graph-nav-mount` (prev/next chronology) and `#threads-mount` (reviewed thread connections with source citations) on every record page — referenced nonexistent globals (`RECORDS_DATA`, `THREAD_CONNECTIONS`) left over from an earlier draft, and silently no-opped on all 138 pages. Only `#related-records-mount` (a simpler "Related records" card grid) actually worked. Rewired both functions to the real `JC_RECORDS`/`JC_EDGES` data via the existing `jcGetPrevNext`/`jcGetEdgesFor`/`jcHrefFromRecord`/`jcTitleFor` helpers, and added the missing `.thread-status--confirmed/editorial/open` CSS. Verified in-browser on seed pages, generated pages, first/last-in-sequence edge cases, and `?mode=original` (correctly still hides both mounts).

**Mystery Mode doorway pooling.** Rebuilt `assets/mystery-v2-logic.js`: each of the 11 doorways now draws from a keyword-matched pool of records (title + summary against a per-doorway regex) instead of routing to one hardcoded record every time — the original curated record stays in the pool as a guaranteed fallback. "I want to follow the entire chronology" pools from the union of the four named threads (23 records) rather than keywords. "A quiet place to begin" is left unpooled (routes to the preserved interior page, not a v2 record). Guidance text now notes when a record was "drawn from a reviewed pool of N records on this theme." Verified all 11 doorways in-browser (pool sizes 7–23, correct no-interpretation link, correct Continue-button navigation).

**Landing page — Chronological/Thematic/Encounter maps, begun.** Replaced three of the five Stage-2 placeholder cards on `index.html` with working first drafts: a Chronological Map (7 month links into `threads.html?q=<Mon>`), a Thematic Map (the 4 named threads plus 6 common themes, both via the new `?thread=`/`?q=` params), and an Encounter Index (14 hand-picked hinge records drawn from the Corpus Map's own "key hinges," linked directly to their record pages). Scripture Map and Tablet Map remain untouched placeholders. Explicitly marked as first drafts on the page itself, pending the owner's review.

Not yet done: `corpus-paths-data.js` still needs manual (not scripted) relinking per the known filename/content-mismatch hazard; Scripture Map and Tablet Map remain placeholders; the ~27 unresolved pass references and ~280 unreviewed meditations are unchanged from the prior phase. Pass 7 (35 more entries, coverage 171→206) and Pass 8 (35 more, coverage 206→241) have both since been received and are present in the repository but not yet integrated by the generator.

### Phase 3 (2026-09-01) — audio player component, built ahead of source material
The CHANGELOG's own roadmap named Phase 3 "Audio Implementation." Since no audio/video source files exist anywhere in the repository (confirmed again — zero `.mp3/.m4a/.wav/.ogg/.aac/.mp4/.mov` files), the actual per-record audio integration remains genuinely blocked. What *is* unblocked is the component itself, so this phase built it ahead of time.

**Built `assets/audio-player.js` + `assets/audio-player.css`.** A standalone, accessible custom player: play/pause button, seekable progress bar (`<input type=range>`, native `accent-color` styling), an elapsed/duration timestamp, a playback-speed `<select>` (0.75×–2×), a volume slider, and native `<track kind="captions">` support for a future `captionsUrl`. `mountAudioPlayer(mount, { audioUrl, captionsUrl, title })` is exposed on `window.JordanCrossingAudio` for direct use, plus an auto-init path for any `.audio-player-mount[data-audio-url]` element. The mount renders **nothing** (zero height, no console errors) whenever no `audioUrl` is supplied — which is every record today.

**Wired the hook into all 138 record pages.** Added `#audio-player-mount` immediately before the article body, the `audio-player.css` stylesheet link, and the `audio-player.js` script tag to every `records/*-v2.html` page (both the 7 original seeds and the 131 generated pages), plus `design-v2-logic.js`'s `initAudioPlayer()` — which looks up the current record's `JC_RECORDS` entry and mounts a player only if `record.audioUrl` is present. Also updated `scripts/build-corpus-records.mjs`'s page template so any future generator run produces pages with the hook already in place, and documented the optional `audioUrl`/`captionsUrl` fields in `records-data.js`'s header comment.

**Verified in-browser:** zero console errors across every top-level page and a sample of record pages with the new hook in place; confirmed the mount stays invisible/empty on every current record (no `audioUrl` anywhere yet); confirmed the player actually mounts, plays, pauses, and advances its seek bar correctly when given a real test audio URL via direct JS invocation (not committed — verification only).

**What this does *not* unblock:** `integrate-audio-player` (wiring real audio into specific records) still requires the author to supply actual audio source files or linkable URLs. The day that happens, adding `audioUrl: '...'` (and optionally `captionsUrl`) to a record's `JC_RECORDS` entry is the entire remaining task — no further engineering needed.

### Phase 4 (2026-09-01) — the digital threshold: Encounter Index, human doorways, returning reader
The design document's closing section (§31, "The final shape") describes the site becoming "a digital threshold: part archive, part map, part reading room, part listening chamber, part chain of witness" where "not every reader will have the same encounter." Auditing the site against that section (and §7, §9, §11) surfaced three genuine gaps beyond audio (explicitly out of scope for this phase per owner direction): the landing page's "Encounter Index" card was actually just a hand-picked hinge list, not the dimensional "what kind of place am I entering?" index §9 describes; no record page offered the theme-based "human doorways" (§7) a reader could leave by; and the "returning reader" continuity (§11) had no visible surface anywhere live.

**Built a real Encounter Index.** `scripts/tag-encounter-dimensions.mjs` computes seven dimensions per record — `temperature` (quiet/contemplative/confrontational/urgent), `length` (brief/moderate/deep, calibrated to this corpus's own actual word-count distribution via percentile cutoffs, since every record here is already substantial), `voice` (personal/communal/instructional/prayerful), `movement` (awakening/surrender/confrontation/waiting/fellowship/release, or `null` if none clearly apply), `posture` (receiving/wrestling/confessing/discerning/obeying), `form` (written/dialogue-shaped/spoken/scripture-centered, from the record's own classification), and `season` (which Stone Tablet window the date falls in) — and writes them onto every `JC_RECORDS` entry as an `encounter` object. `length` and `season` are objective; the rest are keyword-derived from the record's own title/summary/classification, explicitly labeled everywhere in the UI as "an approximation for navigation, never a spiritual diagnosis of you" (matching the design doc's own §9 warning). The landing page's real Encounter Index lets a reader pick any combination of these (or leave fields "Any"), see how many records match, and receive one at random — verified in-browser with real matches, an honest "no match" state, and a working reset.

**Added "human doorways" theme chips to every record page.** The same script derives up to 4 `doorwayThemes` per record from the design doc's §7 list (shame, waiting, fear, identity, surrender, obedience, grief, fellowship, work, marriage, money, discipline) via keyword matching, and `design-v2-logic.js`'s new `initDoorwayThemes()` renders them as chips linking to `threads.html?q=<theme>` — a way to leave a record by the life-question it touched, distinct from its reviewed thread edges. Hidden correctly under `?mode=original`.

**Added a "Welcome back" returning-reader panel** to the landing page: reads the existing carried-question `localStorage` state plus a new lightweight `jc_last_record` tracker (written by every record page on load) and shows "You last read [record]" / "You left this question open: [question]" — entirely local, no account, hidden completely for first-time visitors. Verified showing and correctly hiding depending on `localStorage` state.

**Audio was explicitly out of scope for this phase** per owner direction ("we don't need the audio on there right now") — the Phase 3 component remains built and dormant as before.

**What's still open from the design doc:** Scripture Map (§8) and Tablet Map remain placeholders; the encounter/doorway dimensions are heuristic and would benefit from human review at some point, same as any Mystery Mode pool; `corpus-paths-data.js` relinking is still manual-only; Pass 7 (tagged mid-session, 35 more cross-reference entries, archive coverage 171→206) has not yet been integrated into the generator — a natural next step.

### Blocked
- **Audio, per-record integration:** the player component exists (Phase 3), but zero audio/video files exist anywhere in the repository for any record — the meditations here are text-only (PLAUD/Speakly-generated summaries). `integrate-audio-player` stays blocked until the author provides actual audio source files or linkable audio URLs.

### Pending human decision (not an engineering task)
- **final-qa:** requires the actual stakeholder (project owner) to review and approve — this can't be done on their behalf.
- **deploy-public:** every page currently carries an explicit "INTERIOR BETA · Private workspace · Not for public distribution" banner. Flipping this to a genuine public GitHub Pages deployment is a real, semi-irreversible decision (domain, indexing, monitoring) that needs the owner's explicit go-ahead.

---

## Technical Architecture

### Data Structure
- **records-data.js:** `JC_RECORDS` array (138 records — 7 original curated seeds + 131 generated from the six Cross-Reference passes — `href` pointing at `-v2.html` pages, plus `encounter{}`/`doorwayThemes[]` per record), `JC_EDGES` array (142 labeled thread connections: 121 same-cluster `"continues"`/`"answers"`/`"open"` edges + 21 cross-month `"echoes"` edges for the four named threads, each with a `source` citation), `JC_THREADS` array (the four named threads with their step sequences). The generated portion is rebuilt by `scripts/build-corpus-records.mjs`; the `JC_THREADS`/`"echoes"`-edge portion was hand-authored from the Corpus Map §10; the `encounter`/`doorwayThemes` fields are computed by `scripts/tag-encounter-dimensions.mjs`. All three additions should be re-applied by hand/re-run after `build-corpus-records.mjs` regenerates the file (it overwrites `records-data.js` completely — see the generator's own header warning).
- **corpus-paths-data.js:** `JC_CORPUS_PATHS` array (6 reading paths with steps; most steps still link externally — see the living-archive note above)
- **design-v2-logic.js:** page initialization, Markdown rendering, related records, prev/next chronology (`#graph-nav-mount`), reviewed thread connections (`#threads-mount`), human-doorway theme chips (`#doorway-themes-mount`), audio player init (`#audio-player-mount`, only mounts if `record.audioUrl` is set), last-record tracking for the returning-reader panel, and the `?mode=original` no-interpretation handling
- **mystery-v2-logic.js:** doorway pooling (keyword-matched against `JC_RECORDS`), guidance text, routing, and no-interpretation link targeting
- **audio-player.js / audio-player.css:** standalone accessible audio player component (play/pause, seek, timestamp, speed, volume, captions track support), exposed as `window.JordanCrossingAudio.mountAudioPlayer()`; renders nothing until a record supplies an `audioUrl`
- **scripts/build-corpus-records.mjs:** the corpus-embedding generator (see living-archive section above) — run via `node scripts/build-corpus-records.mjs` from the repo root any time the pass documents are updated or a new pass is added. Re-running it will regenerate `JC_RECORDS` and the same-cluster edges but does **not** touch the hand-authored `JC_THREADS`/`"echoes"` edges or the `encounter`/`doorwayThemes` fields — see its own header comment for the exact recovery steps. Its page template already includes the audio-player and human-doorways mounts/scripts for any newly generated page.
- **scripts/tag-encounter-dimensions.mjs:** computes the Encounter Index (§9) dimensions and human-doorway themes (§7) onto every `JC_RECORDS` entry — idempotent, safe to re-run any time after the record set changes. `length`/`season` are objective (word count percentile within this corpus; recorded date against the Stone Tablet windows); the rest are keyword-derived and explicitly labeled as an approximation in the UI, never a diagnosis.

### Key Functions
- `jcGetRelatedRecords(recordId, count)` — returns connected records from edges
- `jcGetPrevNext(id)` / `jcGetEdgesFor(id)` — chronology and labeled-edge lookups, used by both `design-v2-logic.js` (record pages) and `threads.html` (constellation view)
- `jcShortId(id)` — normalizes full IDs to short IDs (e.g., '08-29-signpost' → 'signpost')
- `initRelatedRecords()` / `initGraphNav()` / `initThreadConnections()` / `initDoorwayThemes()` / `initAudioPlayer()` — run on page load to populate `related-records-mount` / `graph-nav-mount` / `threads-mount` / `doorway-themes-mount` / `audio-player-mount`
- `applyNoInterpretationMode()` — hides interpretive sections (including doorway themes) when `?mode=original` is present
- `JordanCrossingAudio.mountAudioPlayer(mount, { audioUrl, captionsUrl, title })` — mounts a fully wired player into any element; used by `initAudioPlayer()` and available for direct/manual use
- `index.html`'s inline `initEncounterIndex()` / `initWelcomeBack()` — the Encounter Index picker and the returning-reader panel; both read `JC_RECORDS` and/or `localStorage` directly, no separate data file

### Deployment Pipeline
- All changes committed to master → GitHub Actions auto-deploys to GitHub Pages
- Cache-busting via version query string (`?v=YYYYMMDDVN`) — bump the version on every asset change; browsers otherwise cache the HTML document itself (not just linked assets) for repeat visits

---

## File Manifest

- `index.html`, `mystery.html`, `threads.html`, `paths.html`, `archive.html` — all v2, all cross-linked in nav
- `mystery-v2.html`, `record.html` — legacy pages kept only for redirect/reference; not linked from anywhere live except `record.html?mode=original` from the landing page's third invitation card (intentional — refers to the preserved v11 interior record, a different concept from a curated meditation's no-interpretation view)
- `records/*-v2.html` (138 files) — all fully published, reviewed meditation records: the original 7 curated seeds plus 131 generated by `scripts/build-corpus-records.mjs` from the six Cross-Reference passes; every page now carries the audio-player and human-doorways mounts/hooks
- `records/*.html` (7 files, no `-v2` suffix) — superseded by the `-v2` versions; no longer linked anywhere in the site after the routing fix, kept only as historical artifacts
- `assets/favicon.svg` — new, linked from every page
- `assets/audio-player.js`, `assets/audio-player.css` — the Phase 3 audio player component, built ahead of source material
- `scripts/build-corpus-records.mjs` — the generator that produced the 131 new record pages and rebuilt `assets/records-data.js`; safe to re-run if the pass documents are extended (see its own header for what must be re-applied afterward)
- `scripts/tag-encounter-dimensions.mjs` — the Phase 4 tagger that computes `encounter`/`doorwayThemes` for every record
- `records/*.md` (410 files), `Corpus Map.md`, `PLAUD Meditations Corpus Map.md`, `Pass 1–8 *.md` — the raw corpus mirror described above. These are committed to this repository (it remains a private Interior Beta, not a public deploy) so the six-then-eight Cross-Reference passes and the two Corpus Map documents stay available as the generator's own source of truth; only the *published-and-reviewed* 138 meditations are surfaced anywhere in the live site's navigation.

---

## Success Criteria

- ✓ All five top-level pages match v2 design and are cross-navigable
- ✓ Related records / threads / paths all route to the correct, formatted pages
- ✓ Accessibility audit clean; Lighthouse 99–100 across the board
- ✓ Mystery Mode fully canonicalized with a working no-interpretation route
- ✓ Living archive: 138 of 451 meditations reviewed (via the six Cross-Reference passes) and fully published as record pages, embedded as-is per owner direction
- ✓ Four named threads (Zechariah 3, Samuel Loop, Murmuration, Descent) resolved and navigable from Threads and the landing page
- ✓ Mystery Mode doorways pool across the full 138-record reviewed set, not just the original 7
- ✓ Reviewed thread connections and chronology visible directly on every record page (fixed a dead-code regression that had silently hidden them)
- ✓ Audio player component built and wired into every record page, verified working; dormant until real audio source material is provided
- ✓ A real Encounter Index (design doc §9) lets a reader choose an encounter by temperature/length/movement/posture/voice/season and receive a matching record, verified with real and empty-match cases
- ✓ Every record page offers "human doorways" theme chips (§7) alongside its reviewed edges
- ✓ A local-only "Welcome back" panel surfaces the last record read and any carried question, verified showing/hiding correctly
- ○ Landing page's Chronological/Thematic/Encounter maps are first drafts pending owner verification; Scripture Map and Tablet Map remain placeholders
- ○ Remaining ~280 unreviewed meditations stay metadata-only in the Archive pending a future review pass; Pass 7 (35 more entries) is tagged but not yet integrated
- ○ Audio: per-record integration blocked pending source material (component itself is done)
- ○ Public launch: pending stakeholder sign-off and an explicit decision to lift the "not for public distribution" status

---

## References
- `.github/workflows/deploy.yml` — Auto-deployment workflow
- `DESIGN_V2_COMPLETE.md`, `JORDAN_CROSSING_MYSTERY_MODE_AND_PUBLIC_WITNESS_DESIGN.md` — design specifications
- Session checkpoints: `~/.copilot/session-state/730c7681-900a-499d-8904-10ffbdd0089d/checkpoints/`
