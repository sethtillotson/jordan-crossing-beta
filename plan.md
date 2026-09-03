# Jordan Crossing — Build Progress & Next Steps

## Current Status (September 3, 2026 — Phase 15: "What did you actually encounter?" buttons fixed)

A real, live-reported bug fixed after Phase 14: on every record page, clicking any of the three
"What did you actually encounter?" buttons (I recognized something / I'm not sure yet / I want to
resist this) did nothing. Root cause: `initDiscernChoices()` in `assets/design-v2-logic.js` queried
`.discern-response` elements and toggled a CSS `.active` class — but the actual record-page template
(`build-records2-corpus.mjs`) emits each reveal panel as `<div class="discern-reveal" hidden>`, a
completely different class name and mechanism (the native `hidden` attribute, not a CSS class). The
querySelector found nothing on all 456 record pages, so clicking any of the three buttons silently
did nothing. Fixed the JS to target the real `.discern-reveal` elements and toggle their `hidden`
attribute directly; also replaced the now-correctly-targeted (previously orphaned, never-applied)
`.discern-response`/`.discern-response.active` CSS rules with `.discern-reveal` rules carrying the
same intended background/border/reveal-animation styling. Verified live: clicking each of the three
buttons now correctly shows its own response text and hides the others.

See "Phase 14" below for the appendix richness work (Doctrinal Spine, Lexicon Joints, Chiastic
Mirror), "Phase 13" for the public-beta cleanup pass, "Phase 12" for the Corpus Lattice cross-reference
verification, and "Phase 11" for the full account of the corpus rebuild from `records-2/`.

## Phase 14 (2026-09-03 — appendix richness: Doctrinal Spine, Lexicon Joints, Chiastic Mirror)

See "Phase 14" below for the latest: replaced the flat "continues" label every cross-reference edge
carried with the REAL structural classification each meditation's own Cross-Reference Appendix names —
Doctrinal Spine (Seed → Growth → Tablet), Thread Joint, Lexicon Joint, and Expanded Chiastic Mirror —
reconciled onto the existing Corpus-Lattice-verified edge set (3,079 edges, unchanged in count; 3,075 of
them, 99.8%, now carry a real specific jointType instead of the generic fallback). New per-record fields
(`doctrinalSpine`, `lexiconJoints`, `chiasticMirror`, `doctrinalThemesCarried`) now surface on record
pages (a new "Doctrinal Spine" widget, joint-type-colored badges in Reviewed Thread Connections, and
small Lexicon Joints / Expanded Chiastic Mirror displays), on the Threads page (a joint-type filter), in
Mystery Mode (doorway keyword-matching now also searches each record's own lexicon terms/doctrinal
theme, not just title/summary), and on the landing page's Encounter Index (a new "Doctrinal theme"
filter). Also fixed a real, pre-existing bug (present since Phase 11, independent of anything done this
phase) that silently dropped roughly 1,600 genuinely-resolvable appendix cross-references because the
fuzzy-filename-match fallback returned a basename missing its `.md` extension.

See "Phase 13" below for the prior public-beta cleanup pass (Threads/Corpus Paths rebuilt from the
owner's new corpus map documents, several real UI bugs fixed), "Phase 12" for the Corpus Lattice
cross-reference verification, and "Phase 11" for the full account of the corpus rebuild from
`records-2/` and the site's promotion to public-facing Beta 2.0.

**Final QA (post-Phase-14) and live deployment both confirmed clean:**
- Automated data validation: 456 records / 3,079 edges / 7 threads / 5 corpus paths, zero duplicate
  ids/hrefs/edges, zero missing href files, zero bad edge/thread/path references, zero self-loops,
  zero isolated records, chronological order contiguous 1–456, every edge has a valid `jointType`,
  every `doctrinalSpine.recordId` reference resolves, zero stray markdown-link syntax left in any
  display field, zero external Corpus Paths steps.
- Browser end-to-end verification (fresh dev server, fresh browser page): a record page with a full
  Doctrinal Spine (Seed/Growth/Tablet, each linking to its real target) plus joint-type badges in
  Reviewed Thread Connections plus Lexicon Joints and Expanded Chiastic Mirror displays, all confirmed
  rendering; the Threads page's new joint-type filter confirmed correctly narrowing the constellation
  to only Doctrinal Spine connections when selected (and honestly reporting "no connection of this
  type" rather than hiding records that lack one); Mystery Mode's "surrender" doorway confirmed
  reporting a real, non-zero pool count; the landing page's Encounter Index "Doctrinal theme" filter
  confirmed returning the exact expected count (6) for "The Ordered Affections."
- Byte-level UTF-8 roundtrip check clean across every edited file plus a 40-file record-page sample
  (no mojibake introduced). Zero browser console errors observed across every page visited.

All session todos are now `done` except 6 legitimately non-actionable ones carried forward: 5 were the
abandoned in-place body-patch approach, explicitly superseded by the `records-2/` full rebuild; 1
(`integrate-audio-player`) remains genuinely blocked on the owner supplying real audio source material.

## Deferred (explicitly out of scope for Phase 13, per owner decision)

- Threads 11–13 from the new corpus map (Kingdom-Business Arc, Marketplace as Priestly Altar,
  Consecration of AI) — described only by example anchors, not a full membership list; expanding them
  algorithmically risked repeating the earlier hallucinated-cross-reference mistake.
- The new corpus map's 36-term lexicon, "persons as nodes," and "the corpus's own horizons" sections.
- Scripture Map and Tablet Map (still landing-page placeholders, now honestly labeled "Coming soon").
- Rewiring the carry-a-question feature (archived instead, per owner's explicit credit-conservation
  decision) — a real ID-mismatch bug (`carry-save-btn`/`carry-status`/`carry-clear-btn` referenced in
  JS but never emitted by the template) made it silently non-functional; removed rather than fixed.



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

### Phase 5 (2026-09-01) — full local mirror: no reader ever needs the author's private drive
The user flagged the core problem directly: every meditation the author uploads into `records/` should open inside this app, and links to the author's private Genspark AI Drive can't be opened by any other reader on any other IP/browser. Investigation found the actual scope was narrower than feared (only `assets/corpus-paths-data.js` had real external links — 32 of 48 curated path steps) but the underlying fix (mirror every uploaded meditation locally) was still the right, larger move.

**Built `scripts/build-mirror-records.mjs`.** An additive generator (splices into `JC_RECORDS` without disturbing `JC_EDGES`/`JC_THREADS`/the encounter tagger's work, same technique as `tag-encounter-dimensions.mjs`) that reads every raw `records/*.md` file, skips the ones already published as reviewed records (matched by real, content-derived title — not filename), skips the ones that don't look like an actual meditation (no "Opening Observation" section), and generates a local page for everything else. Result: **256 new "mirrored" record pages**, bringing the total to **394 local records** (138 reviewed + 256 mirrored) out of 410 raw files present in the repository. Mirrored pages use the exact same template and interactive movements as reviewed pages — Discern/Carry/Return, audio-player hook, doorway chips, Encounter Index tags — the only difference is the page says "Not Yet Reviewed" in its caption and its Source Status callout, and it carries no thread edges (correctly, since none have been verified for it).

**Two-tier `JC_RECORDS`, one array.** Added a `reviewed` boolean per record rather than a second data file, so every existing consumer (Related Records, Mystery Mode pools, Encounter Index, prev/next chronology) keeps working against a single source of truth. `threads.html`'s "reviewed constellation" list now explicitly filters to `reviewed !== false` — the design doc's "introduce the corpus in reviewed layers" governance is preserved for the *interpretive* thread graph, while the *raw text* is available for every uploaded record. Caught and fixed a real honesty gap in the process: `mystery-v2-logic.js`'s doorway keyword pools were pulling from the newly-enlarged `JC_RECORDS` without filtering, which would have silently included mirrored (unreviewed) records under guidance text that explicitly says "drawn from a reviewed pool" — added the same `reviewed !== false` filter there.

**Turned `archive.html` from count-only into a real browsable index.** Month-by-month `<details>` accordions listing every one of the 394 local records (title, date, a "reviewed"/"mirrored" badge, direct link), plus a live text search across all months. This was "count only" specifically because full text wasn't locally available; now that it is, a title+date+link directory isn't an interpretive claim, just a map of what's here.

**Attempted to relink `corpus-paths-data.js`'s 32 external steps — carefully, and learned something important in the process.** A first-draft relinker (resolve the step's memoPath basename to a local file by filename, then trust that file's content) surfaced a serious, previously-underestimated corpus data-quality problem: the raw file literally named "...Resting in the Finished Work of Christ and Covenant Identity.md" contains a completely different meditation ("My Grace Is Sufficient..."). Filename-based resolution would have silently linked the wrong content. Rewrote the relinker to instead search every already-published record's real, content-derived title for a match recorded on the **exact same day** as the step (catching cases like two different "Kenosis"-titled meditations on different dates) with strong word coverage of the step's own label — and only relink when both agree. Result: **21 of 48 steps are now local** (up from 16), each individually verified in the diff to be a correct match; the remaining **27 stay external**, each with a specific, printed reason (no same-day match, or a same-day candidate whose title doesn't actually match) rather than a blind guess. This is a real, disclosed data-quality limitation in the underlying export, not a bug in this repository's linking — documented in `corpus-paths-data.js`'s header and `paths.html`'s callout for whoever investigates next.

**Fixed the "Imported from AI Drive Markdown source" wording** across all 138 previously-generated reviewed pages and the generator template — it read as an ongoing dependency on the author's drive, which is no longer (and, for the reviewed pages, was never actually) true. Now reads "Mirrored locally."

**What's still open:** the ~41 meditations Corpus Map documents but which were never uploaded to this repository (451 documented vs. 410 present) remain genuinely absent — no amount of local processing can mirror a file that isn't here. The 27 still-external Corpus Paths steps need a human to either locate the real content by hand (search the author's own drive for the meditation, since the local mirror's filename for that date doesn't contain it) or confirm it was never uploaded. Encounter/doorway tagging was re-run across the full 394-record set.

### Phase 6 (2026-09-02) — Pass 7/8 Cross-References integrated into the reviewed layer
Pass 7 and Pass 8 (70 more Cross-Reference entries, archive coverage 171→241) had been received but not yet integrated as of Phase 5. This phase closes that gap.

**Built `scripts/integrate-passes-7-8.mjs`.** An additive script, same splicing technique as `tag-encounter-dimensions.mjs`/`build-mirror-records.mjs` (never overwrites the whole file, only patches `JC_RECORDS`/`JC_EDGES` in place): for each Pass 7/8 entry, it resolves the referenced meditation to its existing `JC_RECORDS` entry (by content-derived title, same rule as always) and does one of three things depending on that record's current state — leaves an already-reviewed record untouched (it still contributes to new edges), **promotes** an already-mirrored record by flipping `reviewed` to `true` and regenerating its page in place with the reviewed-copy template (same `id`/`href`, so nothing that already links to it breaks), or (if the file was never mirrored at all) generates a brand-new reviewed page. Same-cluster edges are built from each pass's own numbered groups and appended, exactly as `build-corpus-records.mjs` does for Passes 1–6.

**Result:** 63 mirrored records promoted to reviewed (0 brand-new pages needed — every Pass 7/8 reference had already been mirrored in Phase 5), 53 new same-cluster edges, 7 entries left unresolved (logged, not fatal — mostly the same kind of filename/content mismatch Phase 5 already flagged as a known corpus data-quality issue). Totals moved from 138 reviewed / 256 mirrored / 142 edges to **201 reviewed / 193 mirrored / 195 edges**, out of 394 total local records (unchanged) and across the same 4 named threads (Pass 7/8 add cross-reference edges, not new thread assignments).

**Verified data integrity** with a disposable Node check (no browser needed for this layer): record/edge/thread counts match the script's own reported totals, zero duplicate ids or hrefs, `order` is contiguous 1..N across the merged set, and every thread/edge reference resolves to a real record. Re-ran `scripts/tag-encounter-dimensions.mjs` (idempotent) so all 63 newly-promoted records also carry `encounter`/`doorwayThemes`. Spot-checked several promoted pages directly (e.g. `03-19-meditation-spiritual-liberation-from-v2.html`) to confirm they render the reviewed-copy template, not the "Not Yet Reviewed" mirrored placeholder, and confirmed a sampled promoted record carries a real outgoing edge.

**Updated stale hardcoded copy** that still quoted the old 138/256/six-pass totals on `index.html` ("Three ways into the reviewed ... constellation"), `threads.html` (its reviewed-constellation intro paragraph), and `paths.html` (its corpus-map intro) — these were static text, not computed from `JC_RECORDS`, so they didn't move automatically when the data did. `archive.html`'s total/reviewed figures and Mystery Mode's doorway pools are both computed live from `JC_RECORDS.filter(r => r.reviewed !== false)` at runtime, so neither needed a code change — only a stale explanatory comment in `mystery-v2-logic.js` was corrected.

**What's still open:** ~193 meditations remain mirrored but not yet cross-referenced; the 7 unresolved Pass 7/8 references need the same manual filename-resolution Phase 5 already flagged as a corpus data-quality issue, not an engineering gap. The author is actively deepening cross-reference work for a future Pass 9+ (doctrinal-spine thread joints and quoted-phrase pairs, lexicon joints with earliest sibling, an expanded chiastic mirror, and a tablet anchor with verifiable phrase) — `integrate-passes-7-8.mjs`'s pattern (resolve → promote-or-create → build same-cluster edges) generalizes directly to a Pass 9 integration once filed.

### Phase 7 (2026-09-02) — Pass 9–13 "Encounter Edition" integrated; 269 records now reviewed
Passes 9 through 13 arrived the same day as Phase 6 shipped — a five-wave "Encounter Edition" run (doctrinal-spine Seed→Growth→Tablet joints with a verifiable phrase per stage, verbatim-quoted thread joints from both sides, lexicon joints with earliest sibling, an expanded chiastic mirror walking each file's own A-B-C-B'-A', and a tablet anchor) that took archive coverage from 241→328 of the corpus's own working count (450, later 459 once two new Sep 1 files were logged in Pass 13).

**Built `scripts/integrate-passes-9-13.mjs`** — a direct copy of `integrate-passes-7-8.mjs` with only `PASS_FILES` changed (Pass 9–13 instead of 7–8); the parsing, promotion, and edge-building logic needed zero modification because Pass 9–13 use the identical `### group header` + numbered `[title](memo:path) — annotation` structure. This confirms the design note left in Phase 6: the resolve → promote-or-create → build-edges pattern really does generalize to new passes with no code changes beyond the file list.

**Result:** 107 entries parsed across the five passes; 68 mirrored records promoted to reviewed, 0 brand-new pages needed, 57 new same-cluster edges, 2 resolved files rejected as not-a-meditation (same content-sanity check as always), and 29 entries left unresolved — mostly genuine not-yet-uploaded files, most notably **8 "fresh imports" Pass 13 itself names** (Aug 31 and Sep 1, 2026 meditations, including the corpus's first-ever September folder) that are referenced in the pass doc but have not actually been uploaded to this repository's `records/` yet; the rest of the unresolved list is a mix of genuinely-missing files and a few "Pass N candidates" planning bullets from the pass docs' own tail sections that happened to also be numbered lists (harmless — they carry no `memo:` link, so they were logged and skipped, never mistaken for a real record). Totals moved from 201 reviewed / 193 mirrored / 195 edges to **269 reviewed / 125 mirrored / 252 edges**, out of the same 394 total local records and the same 4 named threads.

**Verified the same way as Phase 6**: a disposable Node integrity check confirmed record/edge/thread counts, zero duplicate ids or hrefs, contiguous `order` 1..N, and zero bad edge/thread references; diffed the record set before/after to confirm exactly 68 ids flipped `reviewed: false → true` (no more, no less); re-ran `tag-encounter-dimensions.mjs` (0 records missing an `encounter` object afterward); live-fetched a sampled promoted page from the dev server and confirmed it renders the reviewed template, not "Not Yet Reviewed."

**Refreshed the same three stale-copy locations again** — `index.html`, `threads.html`, `paths.html` — updating 201/193/eight-passes to 269/125/thirteen-passes, plus the `mystery-v2-logic.js` comment. This is now the second time this exact category of drift has appeared; a future pass-integration script could compute these figures directly from `JC_RECORDS` at build time rather than hand-editing copy each time, but that is a larger refactor than any single pass-integration deserves on its own.

**What's still open:** ~125 meditations remain mirrored but not yet cross-referenced; the 29 unresolved Pass 9–13 references need the same manual/human resolution as before (mostly not-yet-uploaded files — notably the 8 Aug 31/Sep 1 fresh imports Pass 13 itself flagged, which is new-upload work for the author, not an engineering gap). A `Pass-9-Cross-References.md`...`Pass-13-Cross-References.md` reading of "Pass 14 candidates" in Pass 13's own tail section suggests more passes are likely; `integrate-passes-9-13.mjs` (or a still-more-generalized version accepting a pass-number range as an argument) is ready to extend again.

### Phase 8 (2026-09-02) — Pass 14–16 integrated (346 reviewed, 91.3%); audited all pass docs for un-integrated thread claims
Pass 14 arrived first without clickable `memo:` links (plain date/title text only, so nothing in it could be resolved to a local file); the owner then re-uploaded a corrected Pass 14 with links restored, plus new Pass 15 and Pass 16 waves, and asked explicitly that any thread updates across *all* pass documents — not just the newest ones — that hadn't yet been integrated get folded into the interwoven thread system.

**Built `scripts/integrate-passes-14-16.mjs`** — the same generalization as Phase 7 (only `PASS_FILES` changed, pointed at the corrected `Pass-14-Cross-References.md` plus the new `Pass-15-Cross-References.md` and `Pass-16-Cross-References.md`). **Result:** 105 entries parsed across the three passes; 77 mirrored records promoted to reviewed, 0 brand-new pages, 73 new same-cluster edges, 1 resolved file rejected as not-a-meditation, 19 entries left unresolved (mostly genuinely not-yet-uploaded files, plus the same harmless numbered-planning-bullet artifact noted in Phase 7). Totals moved from 269 reviewed / 125 mirrored / 252 edges to **346 reviewed / 48 mirrored / 325 edges** (91.3% of the corpus's own 459-file working count), out of the same 394 total records and 4 threads. Verified identically to Phases 6–7: integrity check (zero dup ids/hrefs, contiguous order, zero bad refs), before/after diff confirming exactly 77 promotions, re-ran `tag-encounter-dimensions.mjs` (0 missing), live-fetched a promoted page to confirm the reviewed template renders. Refreshed the same three stale-copy locations (`index.html`/`threads.html`/`paths.html`) and the `mystery-v2-logic.js` comment again, to 346/48/sixteen-passes.

**Audited every pass doc (7 through 16) for named-thread claims that hadn't become edges yet**, per the owner's explicit request. Two categories surfaced:
1. **Direct thread tags** ("Samuel Loop's ... document," "Zech 3 courtroom first named") on individual entries — 4 found (Pass 9, 10, 11, 14).
2. **Explicit multi-file narrative chains** named in "Milestones this pass" prose with inline `memo:` links connecting files across *different* clusters/passes (the same-cluster edge builder only ever links entries within one pass's own numbered group, so these chains were never captured) — 5 found: the father-cancer arc and secret-place lineage (Pass 5), the corpus-self-awareness lineage (Pass 8), the Jer 20:9 fire-in-bones spine (Pass 14), and the Jonah-arc (Pass 15).

**Verified each candidate the same way the main integration scripts do — by the resolved file's own real title/body, never its filename — before adding anything as an edge.** Every single one of the 6 fully-resolvable candidates (2 direct tags + the father-cancer arc's 5 files + the secret-place lineage's 4 files + the Jonah-arc's 4 files) resolved to a real local file whose **actual body content did not match** what the pass doc's annotation claimed it would be (e.g., the file literally named "...Truth-Telling, Wilderness Formation, and the Language of Ascent-Summary.md" contains a different meditation, "Sermon Reflection: Kingdom Authority, Holy Standards..."). This is the same filename/content-mismatch corpus data-quality issue Phase 5 first flagged as affecting "at least one" file — this audit confirms it recurs specifically wherever a pass doc's milestone prose names a multi-file narrative arc, across five separate passes spanning the corpus's earliest (Pass 5) to newest (Pass 15) waves.

**Declined to fabricate these 6 specific edges.** Per this project's own governing standard ("not speculation, but verified joints" — the pass docs' own stated contract), an edge whose citation doesn't match the record it points to is worse than no edge at all. All 8 affected records already carry other, independently-verified same-cluster edges from the reliable pipeline, so none of them are orphaned in the thread graph — they're simply not connected via *this particular* unverifiable narrative claim. This is disclosed as an open item below rather than silently guessed at or silently dropped.

**What's still open:** ~48 meditations remain mirrored but not yet cross-referenced (Pass 15 itself projected "full completion in Pass 16," and Pass 16 in turn projects Pass 17 closing the remaining ~40 files — the corpus is close to fully reviewed). 19 unresolved Pass 14–16 references need manual resolution (mostly not-yet-uploaded files). The 6 milestone-named cross-pass narrative chains found during the thread audit need the author's own hands-on verification against their private drive (not this repository's mirror) before they can be safely added as edges — a manual, not automated, task. Given how consistently this recurred across every pass checked, a broader spot-check of the *existing* same-cluster edges' own citations against their resolved records' real content would be a reasonable trust-verification exercise for a future session, though every sample checked so far (both in this audit and in Phases 6–7's promotion spot-checks) shows the *displayed* record itself is always internally consistent (title matches its own body) — the risk is specifically in a *third-party editorial claim about which file is which*, not in what the site actually shows a reader.

### Phase 9 (2026-09-02) — Pass 17: corpus complete (381 reviewed); Six Doctrinal Spines infographic + Timeline embedded
Pass 17 is the author's own declared final wave: "CORPUS COMPLETE: 458 / 458 real Markdown meditations (100%)" — every real meditation file in the source corpus now carries a completed Cross-Reference appendix in the author's own private drive. Alongside it, the owner supplied three new reference artifacts: `PLAUD-Meditations-Master-Index.md` (the full 458-file index, grouped by governing "Tablet" doctrine, with a per-file memo-link density count — 4,617 total cross-references corpus-wide, mean 10.1/file), `PLAUD-Meditations-Tracker.csv` (the same data in flat spreadsheet form), and two self-contained HTML infographics — `PLAUD-Meditations-Six-Doctrinal-Spines-Infographic.html` and `PLAUD-Meditations-Timeline-of-Six-Spines.html` — visualizing the six governing "Tablets" (I, II, V, VI, VII, VIII) that organize the whole lattice.

**Integrated Pass 17** with `scripts/integrate-pass-17.mjs` (the same established generalization — only `PASS_FILES` changed). **Result:** 39 entries parsed; 35 mirrored records promoted to reviewed, 0 brand-new pages, 32 new same-cluster edges, 4 entries left unresolved (not-yet-uploaded files). Totals moved from 346 reviewed / 48 mirrored / 325 edges to **381 reviewed / 13 mirrored / 357 edges** — only 13 of 394 local records remain mirrored-not-reviewed. Verified identically to prior phases: integrity check, before/after diff confirming exactly 35 promotions, re-tagged encounter dimensions, live-fetched a promoted page. Refreshed the same three stale-copy locations (`index.html`/`threads.html`/`paths.html`) and the `mystery-v2-logic.js` comment again, to 381/13/seventeen-passes.

**Important scope note:** the Master Index and Tracker CSV give per-file *counts* of cross-references (e.g. "10 links") and Tablet groupings, but not the actual link *targets* — the real edge data (which file links to which) only exists in the Pass-N-Cross-References.md documents' own numbered entries, which is what `integrate-pass-17.mjs` (like every integration script before it) actually parses. Spot-checking confirmed the raw `.md` files mirrored into this repository's `records/` folder do **not** carry the bottom-of-file Cross-Reference appendices the pass docs describe — those exist in the author's own private Genspark/Drive copies, not in this repository's mirror. The corpus's stated "4,617 cross-references, 100% coverage" describes that private, fuller corpus; what this repository can verifiably build from is the subset actually captured in the uploaded Pass-N documents (357 edges after Pass 17) plus each record's own real body content.

**Embedded the two infographics as new site pages.** Copied both HTML files into the repository root as `six-doctrinal-spines.html` and `spines-timeline.html`, stripped a stray `path:`/`content:` prefix artifact left over from how they were uploaded, wrapped each with the site's standard chrome (INTERIOR BETA banner, `site-header` nav, closing `site-footer` with a cross-link to the other infographic and back to Archive) while leaving every bit of their own self-contained visual design (a light parchment palette, deliberately distinct from the site's dark theme, as a standalone "exhibit" rather than forcing it into the record-page template) and JavaScript untouched. Linked both from `archive.html` (a new "See the shape of the lattice" callout) and `index.html` (a new "Six Doctrinal Spines" card in the "Explore the corpus" section) — verified live that both pages load, render their original hero content, and carry the site banner/nav.

**What's still open:** ~13 meditations remain mirrored but not yet cross-referenced (all of them either not resolvable to a matching-content local file, or referenced by an entry whose annotation doesn't match any local file's real title — the same corpus data-quality pattern as the Phase 8 audit). The 458-file / 4,617-edge / 100%-coverage figures describe the author's private corpus; this repository's own edge count (357) reflects only what the uploaded Pass documents make independently verifiable. No new milestone-named cross-pass chains were found in Pass 17 requiring the same audit as Phase 8. `PLAUD-Meditations-Master-Index.md` and `PLAUD-Meditations-Tracker.csv` remain as reference documents in the repository (not rendered into the site) since they describe aggregate structure, not resolvable per-record link targets.

### Phase 10 (2026-09-02) — TRUTH CORRECTION: the entire cross-reference layer rebuilt from the source the owner actually hand-verified
The owner discovered that the whole cross-reference infrastructure built in Phases 6–9 — parsed from the Pass-7 through Pass-17 **summary ledger documents** — was partly hallucinated: it named Tablet labels that were inferred doctrinal categories, not the real Stone Tablet volumes, and some of the link targets it claimed did not survive a check against the actual files. The owner then hand-verified every meditation's Cross-Reference Appendix against the eight real Stone Tablet volumes themselves, correcting mislabeled tablet anchors, removing wrong links, adding missing ones, and supplied the corrected result as a complete bundle: `verified-source-docs/PLAUD-Meditations-Corpus_2026-09-02/` — all 458 real meditation files (each now carrying its own embedded, corrected Cross-Reference Appendix baked directly into the file, not a separate summary document), the 9 Stone Tablet volumes (each also newly appendixed), and 18 corrected Pass Ledgers.

**The critical scope distinction this phase establishes:** earlier phases' edges came from parsing short numbered lists in Pass-N summary documents — a **second-hand, compressed description** of the cross-references, easy to get subtly wrong. This phase discards that entire approach and instead parses **each meditation's own embedded appendix directly** — the actual place the owner checked phrase-by-phrase against the Stone Tablets. This is the same category of correction as Phase 5's "match by real content, never by filename" rule: trust the primary source, not a summary of it.

**Built `scripts/rebuild-cross-references-verified.mjs`** — a new, larger script (not a small generalization of the prior ones, since the extraction logic is fundamentally different):
1. Parses all 458 verified meditation files' embedded appendices: for each, extracts the corrected **Tablet Anchor** (the true Stone Tablet volume + date window the file belongs to, e.g. *"Stone Tablet V · Come Out of Her, My Children — May 26 – Aug 16"*) and every `memo:` cross-reference link inside the appendix, tagged by which subsection it appeared under (Doctrinal Spine, Thread Joints, Lexicon Joints, Chiastic Mirror — the corpus's own "Chiratic Mirror" typo included — or a generic fallback).
2. Matches the verified bundle's files to this repository's existing `records/*.md` raw files. This required solving a real filename problem: the verified bundle's on-disk filenames are shortened (its own README documents "309 filenames shortened for archive"), while both this repository's raw files *and* the appendices' own `memo:` links use the original long filenames — and this repository's raw filenames additionally carry **pre-existing incidental truncation** (a Windows path-length artifact from an earlier upload, unrelated to this correction, discovered mid-script — e.g. one file literally ends in `...PLAUD Note .md`, missing the word "Prompt"). Naive suffix-stripping or exact-match both failed on this combination. The working solution: match on the **longest true common character-prefix** between a verified filename and a repo filename, with a length-difference tiebreaker — verified against zero ambiguous ties across all 411 repo files before being trusted for the real run.
3. Resolves every appendix link's target the same way, against the verified corpus's own file list, then maps that back to a local record id.
4. Rebuilds `JC_RECORDS`: adds a new `tabletAnchor` field (the corrected Stone Tablet label + window) to every record with a verified match; promotes any mirrored record whose file now has a verified appendix; **mirrors 15 brand-new records** for verified files that had no local record at all (closing part of the historical "not yet uploaded" gap — of the 59 verified files with no matching repo file, 44 turned out to already exist locally under a differently-matched raw filename, resolved by title; 15 were genuinely new).
5. **Wholesale-replaces `JC_EDGES`** — every one of the previous 357 (hallucinated-source) edges is discarded; all edges are rebuilt from the verified appendices' real links.

**Result:** 409 total local records (394 + 15 newly mirrored), **404 reviewed / 5 mirrored** (up from 381/13) — 400 records now carry a corrected `tabletAnchor`. 4,488 appendix links were scanned corpus-wide; 3,270 resolved to real meditation-to-meditation edges (the rest either pointed at Stone Tablets/non-meditation reference docs, correctly excluded from `JC_EDGES`, or referenced a file genuinely absent from both this repository and the verified bundle). **JC_EDGES grew from 357 to 3,270** — a roughly 9× increase, reflecting the verified corpus's own stated density (~10 links/file × 458 files) versus how thin the old summary-doc-derived edge set actually was.

**Verified the same way as every prior phase, plus one new check**: the standard integrity check (zero duplicate ids/hrefs, contiguous `order`, zero bad edge/thread refs, zero self-loop edges — a new check added given the much higher edge volume), a before/after diff, a re-run of `tag-encounter-dimensions.mjs`, and live-fetches of both a newly-mirrored record and an existing promoted record confirming correct rendering. **Found and fixed one pre-existing, isolated data-quality bug while validating tabletAnchor coverage**: one record (`04-09-glimpse-into-daily-rhythm`) had a 22,870-character `title` field — a raw source file whose own `**Title:**` metadata line was missing its line break and had absorbed the entire rest of the document, a corruption that predates this phase (confirmed present in `records-data.js.bak` before this script ran) and is unrelated to the current rebuild. Patched the title and added its correct tabletAnchor directly; the raw file's own body-rendering quirk (a single huge paragraph rather than proper Markdown structure) is left as a disclosed, out-of-scope pre-existing issue.

**Replaced the site's Six Doctrinal Spines infographic and Timeline pages with the corrected versions.** The bundle's own HTML files now say "Eight Stone Tablets" (matching the real, corrected structure) rather than the earlier "Six Doctrinal Spines" mislabeling embedded in Phase 9's version. Copied the corrected files over `six-doctrinal-spines.html` and `spines-timeline.html`, re-applied the same site-chrome wrapper (INTERIOR BETA banner, nav, footer cross-links) established in Phase 9, updated the cross-link labels to say "Eight Stone Tablets"/"Timeline of the Eight Stone Tablets," and verified both pages still load correctly with the corrected content.

**Refreshed every stale-copy location again** (`index.html`, `threads.html`, `paths.html`, `archive.html`, `mystery-v2-logic.js`'s comment) — this time rewriting the language itself, not just the numbers, since the *nature* of the claim changed (from "N Cross-Reference passes" to "each meditation's own verified Cross-Reference Appendix"). `archive.html`'s "Where this came from" callout now explicitly discloses the earlier hallucination and this correction, rather than silently updating the count as if nothing had gone wrong — consistent with this project's standing "not speculation, only verified joints" governance.

**Moved every superseded corpus-tagging document to `Superseded-Docs/`** (matching the owner's own already-begun cleanup, which had used a `superceded-docs/` folder name — renamed to match their stated intent): all 17 old `Pass-N-Cross-References.md` files (Pass 1-3's differently-named originals plus Pass 4-17), the old `PLAUD-Meditations-Master-Index.md`, `PLAUD-Meditations-Tracker.csv`, both old infographic HTML files, and the old `PLAUD Meditations Corpus Map.md`. Also found and moved the older, still-7-tablet (not 8) `Corpus Map.md` in the repository root — a document from the project's very first day (2026-08-31) that predates and is now superseded by this correction, since it still names the pre-correction "seven Stone Tablets" and the four named threads' original justification.

**Deliberately left untouched:** the four named `JC_THREADS` (Zechariah 3, Samuel Loop, Murmuration, Descent) — these are an orthogonal classification (thematic arcs a reader can follow) from the Tablet-window correction this phase addresses, and the verified bundle does not supply a corrected replacement for the thread-defining Corpus Map (now itself superseded, with no replacement provided). Whether the four threads' own step sequences need a similar verification pass is disclosed below as an open question, not silently assumed to be fine.

**What's still open:**
- **5 records remain mirrored** (not yet reviewed) — genuinely no verified match found for them in the bundle.
- **9 records have no `tabletAnchor`** — a mix of: (a) the 5 still-mirrored records above, (b) a handful of pre-existing content/filename-mismatch cases (the same corpus data-quality pattern flagged since Phase 5 — e.g. one record's raw file content and its recorded title genuinely don't match any verified file, confirmed by direct inspection, not a matching-script bug), and (c) 12 repo raw files (duplicates of already-matched long-named files, plus non-meditation artifacts like a stray `Pass 4.md`) that intentionally weren't matched since they aren't part of the verified 458.
- **The four named `JC_THREADS`' own step sequences were not re-verified this phase** — they were built from the now-superseded Corpus Map, and no corrected replacement was supplied in the verified bundle. A future pass should either get a corrected thread-defining source from the owner or explicitly re-derive the four threads' membership from the newly-verified `tabletAnchor`/edge data.
- **The 9 Stone Tablet volumes themselves were not ingested as site records** — they're large synthesis documents distinct from the meditation corpus; the site currently treats them as reference-only (named in `tabletAnchor` labels, not yet browsable pages of their own). A future phase could build dedicated Stone Tablet pages.
- **`PLAUD-Meditations-Master-Index.md`/`Tracker.csv`/`.xlsx` (verified versions) remain reference documents** in `verified-source-docs/`, not rendered into the site — same reasoning as Phase 9 (they describe aggregate structure, not resolvable per-record link targets the site's data model needs).

### Blocked
- **Audio, per-record integration:** the player component exists (Phase 3), but zero audio/video files exist anywhere in the repository for any record — the meditations here are text-only (PLAUD/Speakly-generated summaries). `integrate-audio-player` stays blocked until the author provides actual audio source files or linkable audio URLs.
- **~41 meditations documented but not uploaded:** the Corpus Map's own working record counts 451 meditations; only 411 raw files are present in `records/`. These cannot be mirrored locally until the author uploads them — not an engineering gap.
- **1 newly-uploaded raw file not yet mirrored:** a fuller version of the "Apr 11–14 MERGED" fourfold meditation landed in `records/` alongside Pass 9–13 but wasn't referenced by any Pass 9–13 entry, so `integrate-passes-7-8.mjs`/`integrate-passes-9-13.mjs` correctly left it untouched. Running `build-mirror-records.mjs` again would give it a local page; not done yet since that's outside this round's scope.

### Pending human decision (not an engineering task)
- **final-qa:** requires the actual stakeholder (project owner) to review and approve — this can't be done on their behalf.
- **deploy-public:** every page currently carries an explicit "INTERIOR BETA · Private workspace · Not for public distribution" banner. Flipping this to a genuine public GitHub Pages deployment is a real, semi-irreversible decision (domain, indexing, monitoring) that needs the owner's explicit go-ahead.
- **The 27 remaining external Corpus Paths steps:** need the author's own knowledge of the corpus to resolve by hand — see Phase 5 above.

---

## Technical Architecture

### Data Structure
- **records-data.js:** `JC_RECORDS` array (**409 records** — 404 reviewed [7 original curated seeds + 397 verified via corrected Cross-Reference appendices, Phases 2/6/7/8/9/10] + **5 mirrored** + `tabletAnchor` field on 400 records [the corrected Stone Tablet volume + window, Phase 10] — `href` pointing at `-v2.html` pages, plus `encounter{}`/`doorwayThemes[]`/`reviewed` per record), `JC_EDGES` array (**3,270** labeled thread connections, entirely rebuilt in Phase 10 from each meditation's own verified appendix — reviewed records only), `JC_THREADS` array (the four named threads with their step sequences, reviewed records only — **not** re-verified in Phase 10; see its own notes). The generated portion is rebuilt by `scripts/build-corpus-records.mjs`; mirrored records are added by `scripts/build-mirror-records.mjs`; `scripts/rebuild-cross-references-verified.mjs` (Phase 10) is now the authoritative rebuilder for `JC_EDGES` and `tabletAnchor` — it should be re-run (not the older `integrate-passes-*.mjs`/`integrate-pass-17.mjs` scripts, which parsed the now-known-hallucinated Pass-doc summaries and are kept only as historical artifacts) any time the verified-source-docs bundle is updated with a new correction pass. The `encounter`/`doorwayThemes`/`reviewed` fields are computed/set by `scripts/tag-encounter-dimensions.mjs` and `build-mirror-records.mjs`. All of this should be re-applied/re-run in the right order after `build-corpus-records.mjs` regenerates the file (it overwrites `records-data.js` completely — see the generator's own header warning for the exact recovery order).
- **corpus-paths-data.js:** `JC_CORPUS_PATHS` array (9 reading paths, 48 total steps; 21 link to a local page, 27 still link externally — see its own header comment for exactly why each remaining one couldn't be safely confirmed)
- **design-v2-logic.js:** page initialization, Markdown rendering, related records, prev/next chronology (`#graph-nav-mount`), reviewed thread connections (`#threads-mount`), human-doorway theme chips (`#doorway-themes-mount`), audio player init (`#audio-player-mount`, only mounts if `record.audioUrl` is set), last-record tracking for the returning-reader panel, and the `?mode=original` no-interpretation handling
- **mystery-v2-logic.js:** doorway pooling (keyword-matched against `JC_RECORDS`, filtered to `reviewed !== false` so the "reviewed pool" guidance text stays accurate now that mirrored records share the same array), guidance text, routing, and no-interpretation link targeting
- **audio-player.js / audio-player.css:** standalone accessible audio player component (play/pause, seek, timestamp, speed, volume, captions track support), exposed as `window.JordanCrossingAudio.mountAudioPlayer()`; renders nothing until a record supplies an `audioUrl`
- **scripts/build-corpus-records.mjs:** the corpus-embedding generator (see living-archive section above) — run via `node scripts/build-corpus-records.mjs` from the repo root any time the pass documents are updated or a new pass is added. Re-running it will regenerate `JC_RECORDS` and the same-cluster edges but does **not** touch the hand-authored `JC_THREADS`/`"echoes"` edges, the `encounter`/`doorwayThemes`/`reviewed` fields, or the mirrored records — see its own header comment for the exact recovery steps. Its page template already includes the audio-player and human-doorways mounts/scripts for any newly generated page.
- **scripts/build-mirror-records.mjs (Phase 5):** additive generator — reads every raw `records/*.md`, skips ones already reviewed (matched by real title, not filename) and ones that aren't actual meditations, generates a local "mirrored" page for everything else, and splices new entries into `JC_RECORDS` with `reviewed: false`. Safe to re-run any time new raw files are uploaded; run `tag-encounter-dimensions.mjs` afterward.
- **scripts/tag-encounter-dimensions.mjs:** computes the Encounter Index (§9) dimensions and human-doorway themes (§7) onto every `JC_RECORDS` entry — idempotent, safe to re-run any time after the record set changes. `length`/`season` are objective (word count percentile within this corpus; recorded date against the Stone Tablet windows); the rest are keyword-derived and explicitly labeled as an approximation in the UI, never a diagnosis.
- **scripts/relink-corpus-paths.mjs (Phase 5):** re-links `corpus-paths-data.js` steps to a local page only when a same-day record's real, content-derived title strongly covers the step's own label — never by filename (see its header for why). Safe to re-run after more records are mirrored or reviewed; it will re-flag anything it can't confirm rather than guess.
- **scripts/integrate-passes-7-8.mjs (Phase 6):** additive — resolves each Pass 7/8 Cross-Reference entry to its existing `JC_RECORDS` entry, promotes an already-mirrored match to `reviewed: true` (regenerating its page in place, same id/href), creates a brand-new reviewed page for any match that was never mirrored, and appends new same-cluster edges. Never overwrites the file wholesale. Safe to re-run once further passes are filed; see its own header comment for the exact promote/create/edge logic.
- **scripts/integrate-passes-9-13.mjs (Phase 7):** identical logic to `integrate-passes-7-8.mjs` (only `PASS_FILES` differs) — confirms the pattern generalizes cleanly to new pass waves with zero code changes beyond the file list.
- **scripts/integrate-passes-14-16.mjs (Phase 8):** identical logic again (only `PASS_FILES` differs) — Pass 14, 15, and 16.
- **scripts/integrate-pass-17.mjs (Phase 9):** identical logic again — Pass 17, the corpus's own declared final wave. **Superseded by Phase 10** — its source data (the Pass-doc summaries) was found to be partly hallucinated; kept only as a historical artifact, do not re-run.
- **scripts/rebuild-cross-references-verified.mjs (Phase 10):** parses each of the 458 verified meditation files' own embedded Cross-Reference Appendix directly (not a summary document) for its corrected Tablet Anchor and typed cross-reference links; matches verified files to repo raw files via longest-common-prefix scoring (robust to both the verified bundle's shortened filenames and this repo's own pre-existing filename truncation); wholesale-replaces `JC_EDGES` and adds `tabletAnchor` to every matched record; mirrors any verified file with no existing local record. **Superseded by Phase 11** — it only fixed cross-reference metadata, never the displayed article bodies themselves (which remained stale); kept as a historical artifact, do not re-run.

### Phase 11 (2026-09-03) — Public Beta 2.0: full corpus rebuild from `records-2/`

A second layer of corruption was found after Phase 10: `records/*.md` — the raw files actually
displayed as article bodies on every record page — were still the OLD, pre-verification content
(e.g. one file displayed an unrelated "Prophetic Word" transcript instead of its own titled
meditation). A patch script (`scripts/replace-bodies-with-verified.mjs`) was written against
`verified-source-docs/` to fix this in place, but before it ran, **the owner overrode the approach
entirely**: rather than patch file-by-file, the owner copied a freshly hand-verified corpus
directly into a new folder, **`records-2/`** — 456 verified meditation files (Feb 15 – Sep 1, 2026),
the 8 Stone Tablet volumes, a Tablet VII audit doc, and 5 newly updated reference documents (Master
Index, Tracker CSV, three infographic pages) — and directed a **full rebuild** of the site from
that source, alongside promoting the site from "Interior Beta" to a public-facing **Beta 2.0**.

**`records-2/` is now the one canonical raw-source folder; `records/` is now pure generated
output.** The abandoned patch script was deleted.

**Built `scripts/build-records2-corpus.mjs`** — the new authoritative generator. For each of the
456 real meditation files in `records-2/`: parses title/date/classification metadata (with a
bounded, stop-at-next-field capture regex — an earlier unbounded version let one severely
under-punctuated source file swallow thousands of characters into the title field, since that file
had only 24 newlines across 25KB); splits the visible article body from its own embedded
Cross-Reference Appendix; parses that appendix into typed edges + a `tabletAnchor` (reusing
Phase 10's proven classification logic); assigns a deterministic id; and regenerates every
`records/*-v2.html` page plus `JC_RECORDS`/`JC_EDGES` in `assets/records-data.js` wholesale.
`JC_THREADS` is remapped by title+date match against the prior data (not assumed stable — ids
shift when a title is corrected), while `EDGE_LABELS`, `STATUS_LABELS`, and every helper function
are left untouched.

**Data-quality bugs found and fixed during the rebuild (verification, not just generation):**
- **One genuinely corrupted source file.** `04-11 to 04-14 MERGED — The Road, the River, the
  Robbery, and the Recording.md` was raw docx/zip binary content saved with a `.md` extension —
  its first bytes were literally a zip-file signature. Detected via a zip-signature/control-byte
  heuristic and excluded. A properly-converted sibling file with the same content under a
  slightly different name *is* included — no real content was lost. This is exactly the gap
  between 457 candidate files and 456 published (matching the owner's own stated count).
- **A date-parsing bug.** A loose-prose date fallback for non-ISO `**Recorded:**` lines initially
  scanned the *whole* document rather than just the `**Recorded:**` field, risking mistaking an
  unrelated date mentioned in a meditation's own body for its recording date (one record briefly
  resolved to a nonsensical "Dec 1, 2025 · 22:28," a mash-up of two separate mentions). Fixed by
  scoping the fallback to the `**Recorded:**` text only.
- **A merged-range title bug.** "04-11 to 04-14 — ..." (a date range, not a single date) only had
  its first date stripped by the cleanup regex, leaving "to 04-14 — ..." displayed. Fixed to
  handle "MM-DD to MM-DD" range prefixes, and a leftover wrapping single-asterisk italics artifact.
- **A broken Mystery Mode doorway-routing table.** All 7 of `assets/mystery-v2-logic.js`'s
  hardcoded `DOORWAY_ROUTING` anchor ids/hrefs (from the original hand-curated 7 Tablet VIII seeds)
  referenced the pre-rebuild id scheme and were 100% invalid after the rebuild — a real, silent
  1-in-10-ish chance per doorway of routing to a dead page. The `jordan-crossing` doorway also
  hardcoded a route to the retired, never-public `jordan-crossing-interior.html`. Re-resolved 5 of
  7 seed anchors by title+date match; one ("When Wisdom Ushers Power," Aug 30 · 23:58) could not be
  found under any title in the verified corpus — disclosed as a genuine gap. Converted
  `jordan-crossing` into a properly keyword-pooled doorway (secret place/quiet/stillness/rest)
  instead of a single hardcoded destination.
- **`archive.html`'s month browser silently hid September** — a hardcoded `MONTH_ORDER` array
  stopped at `Aug`; all 6 September records computed correctly but never rendered. Fixed.

**Verification performed:** dup ids/hrefs (0), contiguous chronological order (1..456), every
href resolves to a real file (456/456), bad edge/thread refs (0), self-loops (0), tabletAnchor
coverage (456/456), out-of-range dates (0, all Feb 15–Sep 1 2026), short/empty titles or summaries
(0), markdown-leakage in titles (0). Cross-checked all 456 records against
`PLAUD-Meditations-Tracker.csv` (458 rows) by recorded date: 456/458 matched, and both "gaps" are
explained (one tracker row has no date of its own but the record is present and correctly dated via
a loose-date-in-body fallback; the other references a stale/superseded filename whose corrected,
properly-named sibling *is* included) — no real data loss. `tabletAnchor` distribution
(96/70/244/26/15 across Tablets I/II/V/VII/VIII) closely matches the Master Index's own stated
counts (96/70/246/26/15). Live-verified in-browser: the previously-broken "Joseph, Paul, and Severe
Mercy" record now shows its real Genesis 50:20 content; Mystery Mode doorways correctly pool across
the full 456-record set and route to real pages; `stone-tablets.html` and `corpus-architecture.html`
render correctly.

**Also built:**
- **`scripts/build-stone-tablet-pages.mjs`** (new) — generates 8 full Stone Tablet reader pages
  plus the Tablet VII audit page, and a new `stone-tablets.html` index page.
- **`scripts/rebuild-reference-pages.mjs`** (new) — unwraps the 3 newly-uploaded infographic HTML
  files (each carried a 2-line upload-mechanism wrapper plus a trailing metadata footer, both
  stripped via an `unwrap()` helper) and republishes them as `six-doctrinal-spines.html`,
  `spines-timeline.html`, and a new `corpus-architecture.html`, re-skinned with Public Beta 2.0
  branding.
- Re-ran `scripts/tag-encounter-dimensions.mjs` (word counts changed with the new bodies) and
  `scripts/relink-corpus-paths.mjs` (improved from 21/48 to 35/48 local Corpus Paths steps).

**Public Beta 2.0 de-branding:** replaced the "INTERIOR BETA · Private workspace · Not for public
distribution" banner with "PUBLIC BETA 2.0 · Reader discretion advised" across every page (7
shared top-level pages plus the generator template, covering all 465 record/tablet pages); dropped
every "— Interior Beta" title suffix; retired `record.html` entirely (its sole purpose was the
never-public `jordan-crossing-interior.html` concept) and every reference to it; bumped all
cache-busting version strings to `?v=20260903BETA2`. `.gitignore` updated: `verified-source-docs/`
and `Superseded-Docs/` now fully local-only; internal AI-dev artifacts
(`COPILOT_HANDOFF_PROMPT.md`, `COPILOT_CHAT_PROMPT.txt`, `COPILOT_USAGE.md`, `memory-bank/`)
untracked. `records-2/` itself remains tracked/public (unredacted, per the owner's standing
direction to publish as-is and redact pre-public-launch only if needed).

**Landing page & site-wide stats refreshed** to 456 meditations, Feb 14–Sep 1 2026, corrected
tablet chip counts, a "Sep" Chronological Map button, links to the two new pages, and 4 corrected
"Notable Hinges" hrefs whose ids shifted in the rebuild.

**What's left for a future pass:** the 13 still-unresolved Corpus Paths steps; the one missing
original seed record ("Wisdom Ushers Power"); the four named `JC_THREADS` have not been
independently re-verified against the new corpus (only remapped by id); audio remains unwired
(component ready, no source material yet); final QA and stakeholder sign-off before any actual
public announcement/indexing decision.

### Phase 12 (2026-09-03) — Corpus Lattice cross-reference verification, template cleanup

The owner noticed two things browsing the live site: (1) some Samuel Loop records (e.g. "The
Weight of Calling, the Narrowness of the Gate...") appeared to be missing their carry-a-question
section, and a visibly blank gap sat below it; (2) they wanted the entire `JC_EDGES` graph
independently cross-checked against a new authoritative dataset — "Corpus Lattice" (`Corpus
Lattice.json` / `Corpus Lattice.csv`) — every node resolved to a stable id (`MED-NNNN`/`TAB-X`)
with an explicit `status: "ok"/"external"/"unresolved"` flag on every cross-reference.

**The visual bug was CSS, not missing markup.** `.related-records` carried `margin-top:4rem +
padding-top:2rem` with no divider before it; `.reviewed-threads` (`#threads-mount`) carried the
same margin/padding/border-top even when `initThreadConnections()` correctly left it empty for a
record with zero edges — with no `:empty` rule, that produced a large blank gap plus a stray
border line with nothing under it. A first Corpus-Lattice pass (schema v1.1, see below) made this
far more visible: 307 of 456 records had zero verified edges under that pass's (flawed) matching,
so most record pages showed the bug. Fixed: reduced `.related-records` spacing; added `:empty`
rules to `.reviewed-threads` and `.graph-nav` (matching the existing `#doorway-themes-mount:empty`
pattern). Also found and fixed a genuine **double-spacing bug**: the JS-injected thread-connections
HTML wrapped itself in a second nested `<div class="reviewed-threads">`, duplicating the same
class's margin/padding/border whenever threads *did* render — removed the redundant inner wrapper.
Also reordered the shared record-page template so Related Records → doorway themes → Record
Sequence → Reviewed Thread Connections all render **before** the "you have reached the end of this
encounter" panel, which had previously sat mid-page with more content still following it.

**Corpus Lattice verification — two passes.** The first pass (schema v1.1) matched a local
`records-2/` filename to its Corpus Lattice node by exact `path.basename()` string equality. This
only resolved ~150/456 files: the Lattice's own `path`/`target_path` fields preserve each file's
*original, un-truncated* vault filename, while `records-2/`'s actual filenames were independently
shortened at export time (309 of 458 meditations differ — the corpus's own long-documented "309
filenames shortened for archive" issue, the same class of problem Phase 10 solved for
`verified-source-docs/`). That first pass therefore produced only 764 verified edges with 307/456
records isolated — a real undercount, not a true sparsity in the underlying data, and the resulting
edges' `note` field also carried a raw, unfixed underscore-for-colon export artifact
(`target_title`, e.g. "Personal Meditation_ Kenosis...") redundant with the already-clean link text
right above it. Rather than fix this with fuzzy longest-common-prefix matching (workable, but a
heuristic), the owner deleted the v1.1 files and supplied a corrected **schema v1.2** dataset: every
node and every cross-reference target now carries a paired `archive_filename`/`archive_path` (or
`target_archive_filename`/`target_archive_path`) field — the filename exactly as shortened inside
the same zip bundle `records-2/` was extracted from. `scripts/rebuild-edges-from-lattice.mjs` was
rewritten to match purely on `archive_filename` exact string equality (with a `schema_version >=
1.2` guard that refuses to run against the older schema) — **456/456 local records matched their
own Lattice node (100%)**, and the verified edge count grew to **3,079 edges with zero isolated
records** (every one of the 456 records now has at least one Corpus-Lattice-verified connection).
Only 2 of the prior 1,997 appendix-parsed edges lack any Corpus Lattice backing now (down from
1,150 under the first, fuzzy-matched pass) — strong confirmation the undercount really was a
matching-methodology gap, not genuine corpus sparsity. The `note` field was dropped entirely from
Corpus-Lattice-sourced edges (Corpus Lattice gives no direction-independent descriptive text beyond
the target's own title, which the link already shows — an earlier attempt at reusing `target_title`
here was both redundant for outgoing edges and a real direction bug for incoming ones);
`design-v2-logic.js`'s `initThreadConnections()` now simply omits the note paragraph when absent.

**Safety-first script design.** `scripts/rebuild-edges-from-lattice.mjs` re-derives the
`records-2/` filename → `JC_RECORDS` id mapping using the *exact same* deterministic parsing
(`parseRawRecord`/`makeId`, imported from `build-records2-corpus.mjs`, not re-implemented) that
produced the currently-committed `records-data.js`, then hard-fails if that re-derivation doesn't
match the committed id set exactly — refusing to build edges against a stale mapping rather than
silently proceeding. `JC_RECORDS` and `tabletAnchor` are left completely untouched (already
independently verified in Phase 11 from each file's own appendix). `JC_THREADS` is also left
untouched — an initial attempt to filter thread membership by requiring a direct Corpus-Lattice
edge between same-thread steps was reverted after it *emptied* the "murmuration" thread to 0 steps
and gutted the others (25→10 total steps across all 4 threads), which is real evidence that test is
wrong for a hand-curated cross-corpus narrative thread, not evidence the members are stale. The
script now only *reports* per-thread edge coverage as an informational number (e.g. under the final
v1.2 pass: samuel-loop 8/10, murmuration 4/5, descent 4/5, zech3 3/5 steps have a direct verified
connection to another same-thread step) — a starting point for a future, more careful thread-
specific verification pass, not something this script silently discards.

**Verification performed:** full pipeline re-run in order (`build-records2-corpus.mjs` →
`rebuild-edges-from-lattice.mjs` → `build-stone-tablet-pages.mjs` → `tag-encounter-dimensions.mjs`
→ `rebuild-reference-pages.mjs` → `relink-corpus-paths.mjs`). Integrity check: 456 records / 3,079
edges / 4 threads, zero duplicate ids/hrefs/edges, zero missing href files, zero bad edge/thread
references, zero self-loops, chronological order contiguous, zero missing `encounter` fields, zero
isolated records. Repo-wide byte-level sweep (UTF-8 roundtrip + literal mojibake-byte-sequence
search + BOM check) across every `.html`/`.js`/`.css` file in the live site: clean. Live-verified
in-browser, with a **freshly restarted dev server and a brand-new browser page** (per owner
request, to rule out any stale-cache artifact): the originally-reported record
("05-23-weight-calling-narrowness-gate") now correctly shows both Related Records and Reviewed
Thread Connections with no blank gap; `threads.html`'s Samuel Loop thread still renders its full
sequence (JC_THREADS untouched, confirmed); the Encounter Index widget and Archive search box both
still return correct, real results; September's 6 records remain correctly browsable.

**A real self-inflicted bug found and fixed mid-task:** a PowerShell version-bump step (`Get-Content
-Raw` piped through `-replace`) mis-decoded 6 UTF-8 files without a byte-order mark
(`archive.html`, `index.html`, `mystery.html`, `mystery-v2.html`, `paths.html`, `threads.html`) as a
legacy codepage, silently baking real mojibake into them — caught via byte-precise Node
verification (a genuine corruption, unlike the session's several earlier false-positive
PowerShell-console-display "mojibake" scares). Restored all 6 from clean git `HEAD` content and
re-applied the version bump safely via Node's UTF-8-aware string handling instead.

### Phase 13 (2026-09-03) — Public beta cleanup pass

Following live browsing feedback, a scoped cleanup pass targeting real bugs and stale pre-`records-2`
artifacts, explicitly bounded to conserve credits ahead of a small-group public release.

**New corpus maps ingested (Threads 1–10 scope only).** The owner supplied two new hand-authored
documents — `Corpus Map — How These Documents Read Each Other.md` and `PLAUD Meditations Corpus Map —
How the Meditations Read Each Other.md` — naming 13 threads and ~10 reading paths (up from the 4
threads / 6 paths the site had carried since before the `records-2` cutover). Per owner decision,
adopted only Threads 1–10 (each has an explicit tablet-section anchor and named hinge meditations);
Threads 11–13 (Kingdom-Business Arc, Marketplace as Priestly Altar, Consecration of AI) are large
density-pattern threads described only by example anchors, not a full membership list — deferred
rather than algorithmically expanded, to avoid repeating the earlier hallucinated-cross-reference
mistake. Of the 10, only 7 ended up with ≥2 explicitly-linked members (Threads 3, 5, 6 named only one
concrete meditation each, or none, alongside Tablet-internal citations with no linked file) and were
built; the other 3 were dropped and reported, not guessed at.

**New script: `scripts/rebuild-threads-and-paths.mjs`.** Every thread/path member is a `memoBasename`
transcribed verbatim from that member's own `memo:` link in the corpus map text — never a paraphrase
or a date-only guess. Resolution chain: `memoBasename` → Corpus Lattice node (matched by exact
basename of the node's own `path` field, which Phase 12 already confirmed preserves each meditation's
*original* un-truncated vault filename — the same format the corpus map's own memo links use) → the
node's `archive_filename` → the `records-2/` filename → id mapping (re-derived via the same imported,
hard-safety-checked logic `rebuild-edges-from-lattice.mjs` uses). Two "read one day" paths (Mar 28
sermon sextet, Jul 10 exousia cascade) are resolved by date-filtering `JC_RECORDS` wholesale, since the
corpus map names these as "the whole day" via a folder link, not an itemized file list. Any member that
fails to resolve is reported and dropped, never guessed — caught and fixed two real corpus-map/
records-2 filename drifts this way (e.g. the corpus map's own link named "...The Sacrament of Small
Things **in Everyday Marriage**-Public Spoken Word...", but the real file is "...The Sacrament of
Small Things-Public Spoken Word..." — verified against both `records-2/` and Corpus Lattice before
correcting). Result: **7 threads, 5 reading paths, 100% resolved, zero external links, zero guessing.**

**Bugs found and fixed:**
- `threads.html` had its own separate, out-of-sync copy of the edge-rendering logic that still
  referenced the `e.note` field Phase 12 removed from every edge — rendering literal `"undefined"`
  next to almost every connection on the page (the user's reported bug). Made conditional, matching
  the fix already applied to `design-v2-logic.js` last session.
- The carry-a-question feature was **archived, not fixed**, per explicit owner decision (credit
  conservation ahead of the public release). Root cause confirmed before removal: the live JS
  (`design-v2-logic.js`) looked for `carry-save-btn`/`carry-cancel-btn`/`carry-status`/`carry-clear-btn`
  elements the record-page template never actually emitted (`save-question-btn`/`cancel-question-btn`
  and no status/clear elements at all) — a genuine ID mismatch that silently broke the feature.
  Removed the entire section from the record-page template, all its JS
  (`initCarryQuestion`/`getCarryState`/`saveCarryState`/`clearCarryState`), the orphaned "you left a
  question open" line from the landing page's "Welcome back" panel, and a second, completely unused
  legacy implementation of the same feature in `assets/beta.js` (confirmed zero HTML files referenced
  it) — deleted `assets/beta.js`/`assets/beta.css` outright.
- Mystery Mode's doorway "reviewed pool" sizes were artifacts of the old 4-thread set (the "full
  chronology" doorway reported ~23 records) and an arbitrary `MAX_POOL_SIZE = 10` cap on every other
  doorway, undercounting real keyword matches by 2–9× against the full 456-record corpus. Removed the
  cap entirely (doorways now report honest counts, e.g. 44 for "waiting") and changed "full chronology"
  to pool from the *entire* reviewed corpus rather than a themed thread subset — its own guidance text
  ("the entire chronology") demanded breadth, not a curated slice; now correctly reports 456.
- **A genuine pre-existing `jcStepHref is not defined` ReferenceError** was silently breaking all of
  Corpus Paths' rendering (the function was called but never defined anywhere in any loaded script) —
  found while removing the now-unnecessary external/local branching logic. Fixed by using the
  already-shared `jcHrefFor(id)` helper from `records-data.js`.
- Removed the entire "author-confirmed / editorial connection / open" 3-tier edge-status system
  site-wide (Threads page legend, per-edge colored badges on both Threads and every record page) now
  that every edge is Corpus-Lattice-verified — a single "verified" label replaces it.

**Site-wide disclaimer sweep.** Removed or reworded every public-facing reference to phase numbers,
CHANGELOG/GitHub links, schema versions, "Second Brain," "corpus-wide truth correction," "hallucinated,"
"superseded," and "Stage N" placeholder language across `index.html`, `archive.html`, `threads.html`,
and `paths.html`, replacing with a consistent framing: connections are verified and hand-checked by the
author against the source recordings. The landing page's "first drafts, begun not finished" line and
its "planned features [STAGE 2 — ...]" bracketed placeholder language were reworded to read as
clearly-labeled upcoming features ("Coming soon") without implying anything currently live is broken.

**Verification:** full pipeline re-run (`build-records2-corpus.mjs` → `rebuild-edges-from-lattice.mjs`
→ `rebuild-threads-and-paths.mjs` → `build-stone-tablet-pages.mjs` → `tag-encounter-dimensions.mjs`);
automated integrity sweep (0 dup ids/edges, 0 missing files, 0 bad edge/thread/path refs, 0 self-loops,
0 isolated records, contiguous order, 0 external Corpus Paths steps); byte-level UTF-8 roundtrip clean
across every edited file; fresh dev server + fresh browser page confirmed live: landing page copy,
Threads (7 threads, no "undefined", no editorial disclaimer), Mystery Mode (honest pool counts, 456 for
full chronology), Corpus Paths (all 5 paths fully local, `jcStepHref` fix confirmed), and the originally
-reported Samuel Loop record pages (no carry-question section; encounter/related/tags/sequence intact,
return panel genuinely last).

### Phase 14 (2026-09-03) — Cross-Reference Appendix richness: Doctrinal Spine, Lexicon Joints, Chiastic Mirror

The owner pointed out that every meditation's own Cross-Reference Appendix carries far more structure
than the site was using: a Doctrinal Spine (Seed → Growth → Tablet), Thread Joints (verbatim ↔
verbatim), Lexicon Joints, an Expanded Chiastic Mirror, and a Tablet Anchor — but every cross-reference
edge on the site had been flattened to one generic "continues" label, and the incoming-direction label
had a real grammar bug ("is continues by" instead of "is continued by").

**Two real appendix formats, surveyed exhaustively.** The corpus carries two Cross-Reference Appendix
formats roughly 50/50 (236 rigid-only, 220 loose-only, 20 files carry both — a loose block followed
later by a rigid block): the RIGID format (`## Cross-Reference Appendix (Pass N · Encounter Edition)`,
fixed H3 sub-headings) and the LOOSE format (`## Cross-References — How This Meditation Reads Others`,
bold inline labels like `**Thread role** —` instead of headings, plus free-named groupings like
`**Mantle arc (...):**`). Verified the appendix is ALWAYS the final section of every file (0 exceptions
across all 458 source files) — this let the parser safely treat everything from the first
`## Cross-Reference` heading to end-of-file as appendix content, also fixing a smaller pre-existing bug
where content after `### Tablet Anchor` (an "Additional Thread Joints" section, 8 files) was silently
discarded.

**New parser (`scripts/build-records2-corpus.mjs`'s rewritten `parseAppendixLinks()`/`parseTabletAnchor()`)**
extracts, per record: `doctrinalSpine` (seed/growth/tablet, each with a label, gloss, and — where
resolvable — a `recordId`), `lexiconJoints` (term + gloss pairs), `chiasticMirror` (position + label +
gloss), and `doctrinalThemesCarried` (a single free-text line). Every memo-link found anywhere in the
appendix is also classified into a real `jointType` (`doctrinal-spine-seed/-growth/-tablet`,
`thread-joint`, `lexicon-joint`, `chiastic-mirror`, or the generic `cross-reference` fallback) instead
of the old flat `continues`.

**Three real bugs found and fixed while building this:**
1. **A malformed-match bug in `parseTabletAnchor`.** The loose format sometimes writes the tablet name
   INSIDE a markdown link (`[**Stone Tablet VII · Volume IV**](memo:...)`) rather than around one — a
   naive regex captured the trailing `](memo:/Personal%20Space/...)` as part of the "window" text,
   corrupting `tabletAnchor.window` for 2 records (and, more seriously, breaking every downstream
   script's naive bracket-counting `findArrayBounds()` helper, since a literal `]` inside a JSON string
   value defeats that technique). Fixed by preferring the rigid `### Tablet Anchor` H3 (present in
   456/458 files) and rejecting any match immediately followed by `]`.
2. **A label-matching regex with a silent 80-character cap.** Some real loose-format section labels
   run longer (e.g. `**Lexicon joints (Rom 8:26 + Ps 126:5-6 · Spirit intercedes through groans ·
   sowing in tears):**` is ~93 characters) — the old bound silently failed to match these, leaving
   `currentType` stuck on whichever section preceded it and mis-classifying every link underneath as
   the wrong joint type. Raised the cap to 200.
3. **A significant pre-existing bug in `resolveTarget()` (present since Phase 11, independent of
   anything built this phase).** Its fuzzy-filename-match fallback (`bestMatch()`, needed whenever an
   appendix's stated link filename differs from `records-2/`'s own independently-shortened filename —
   the same well-documented corpus export quirk Corpus Lattice's `archive_filename` fields solve for
   the authoritative edge rebuild) returned a basename WITHOUT the `.md` extension, but the lookup map
   it was checked against (`nameToId`) is always keyed WITH `.md`. Every fuzzy-matched link silently
   failed resolution and was miscounted as "skipped (non-meditation target)." Fixing this alone raised
   resolved appendix links from 2,136 to 3,747 (+1,611) and appendix-derived joint-type hints from
   1,734 to 3,134 (+1,400) — nearly doubling the richness available to reconcile onto the verified
   edge set.

**Reconciliation, not replacement.** `scripts/rebuild-edges-from-lattice.mjs` remains the sole
authoritative source of *which* edges exist (Corpus-Lattice-verified, unchanged: 3,079 edges, 0
isolated records). It now additionally loads `assets/appendix-joints.json` (a `from->to` → `{jointType,
note}` lookup written by the parser above) and, for each Lattice-verified edge, looks up whether the
appendix independently named a specific joint type for that exact pair — if so, the edge is enriched
with it; if not, it keeps the generic `cross-reference` fallback. An appendix-only hint with no
matching Lattice-verified edge is never trusted or surfaced. Result: 3,075 of 3,079 edges (99.8%) now
carry a real, specific joint type (breakdown: 1,509 thread-joint, 833 lexicon-joint, 230
doctrinal-spine-seed, 224 doctrinal-spine-growth, 167 doctrinal-spine-tablet, 112 chiastic-mirror, 4
generic cross-reference).

**UI built on top of the richer data:**
- Record pages: a new "Doctrinal Spine" widget (`#doctrinal-spine-mount`, rendered only when a
  record's own appendix carries one — absent for the ~48% of the corpus without this section, never
  fabricated); "Reviewed thread connections" now shows a real joint-type badge (color-coded: gold for
  Doctrinal Spine, blue for Lexicon Joint, purple for Chiastic Mirror, green for the rest) instead of
  one flat "verified" label; new small "Lexicon Joints" and "Expanded Chiastic Mirror" displays
  (`#lexicon-chiastic-mount`).
- `threads.html`: a new joint-type filter (All / Doctrinal Spine / Thread Joint / Lexicon Joint /
  Chiastic Mirror / Cross-Reference) that narrows the constellation's connection list per record,
  honestly reporting "No connection of this type for this record" rather than hiding records.
- Mystery Mode (`assets/mystery-v2-logic.js`): doorway keyword-matching now also searches each
  record's own `doctrinalThemesCarried` and `lexiconJoints` term/gloss text alongside title/summary —
  widening the real matching signal without inventing any new doorway↔theme mapping (only 5 distinct
  doctrinal themes exist across the corpus, too narrow and unevenly distributed — 6 to 97 records each
  — to safely build a whole new taxonomy on top of, so the existing, already-verified keyword regexes
  were kept and simply given more of each record's own real text to test against).
- Landing page Encounter Index: a new "Doctrinal theme" filter (Any / the 5 real values found in the
  corpus), verified live to return the exact expected count for the narrowest theme ("The Ordered
  Affections," 6 records).

**Also fixed the reported grammar bug directly:** a new `EDGE_LABELS_INCOMING` map in
`assets/records-data.js` gives the correct past-participle form for every edge type shown in the
"incoming" direction (continues → "is continued by", answers → "is answered by", etc.) — string
concatenation (`'is ' + EDGE_LABELS[type] + ' by'`) doesn't work for irregular verbs and was rendering
literal "is continues by" on every record page. Committed and pushed as a standalone fix ahead of the
rest of this phase's work.

**Verification:** full pipeline re-run; a new automated integrity sweep specific to this phase (0
invalid `jointType` values, all `doctrinalSpine.recordId` references resolve, 0 stray markdown-link
syntax left in any display field, plus all the standard Phase 11-13 checks — still 0 dup/missing/bad
refs, 0 isolated records); byte-level UTF-8 roundtrip check across every edited file plus a 40-file
record-page sample; fresh dev server + fresh browser page confirmed live: the Doctrinal Spine widget,
joint-type badges, Lexicon Joints/Chiastic Mirror displays, the Threads page joint-type filter (tested
interactively — clicking "Doctrinal Spine" correctly narrows the connection list per record), Mystery
Mode's widened pools, and the Encounter Index's doctrinal-theme filter (tested interactively — returned
exactly 6 records for "The Ordered Affections," matching the raw data count). Zero browser console
errors observed.

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

**Phase 14 current state (September 3, 2026):** `assets/records-data.js` still holds 456 records and
3,079 edges (both unchanged in count), but now: (a) each record may carry new optional fields
`doctrinalSpine` (236/456), `lexiconJoints` (297/456), `chiasticMirror` (344/456), and
`doctrinalThemesCarried` (234/456), extracted from its own Cross-Reference Appendix; (b) each edge now
carries a real `jointType` (3,075/3,079 non-generic) instead of the old flat `continues` label; (c) a
new `JOINT_TYPE_LABELS` map and `EDGE_LABELS_INCOMING` map (fixing the "is continues by" grammar bug)
sit alongside `EDGE_LABELS`/`STATUS_LABELS`. New top-level data file: `assets/appendix-joints.json` (a
`from->to` → `{jointType, note}` lookup, regenerated by `build-records2-corpus.mjs`, consumed by
`rebuild-edges-from-lattice.mjs`). New record-page mounts: `#doctrinal-spine-mount`,
`#lexicon-chiastic-mount`. Threads page gained a joint-type filter; Mystery Mode's keyword pools and
the landing page's Encounter Index both gained new appendix-sourced matching/filtering.

**Phase 13 current state (September 3, 2026):** `assets/records-data.js` now holds 456 records
(unchanged), 3,079 Corpus-Lattice-verified edges (unchanged from Phase 12, only the `source` field
text was cleaned of internal-project language), and **7 threads** (replacing Phase 11's 4 stale
pre-`records-2` threads, transcribed from the owner's new corpus map documents). New top-level data
file: `assets/corpus-paths-data.js` fully rewritten (5 fully-local paths, replacing 6 stale paths with
external `genspark.ai` links). New script: `scripts/rebuild-threads-and-paths.mjs`. Deleted:
`assets/beta.js`, `assets/beta.css` (confirmed dead code, referenced by zero HTML files). The
carry-a-question section is removed from all 456 record pages and the landing page's "Welcome back"
panel.

**Phase 12 current state (September 3, 2026):** `assets/records-data.js` now holds 456 records
(unchanged from Phase 11), **3,079 Corpus-Lattice-verified edges** (replacing Phase 11's 1,997
appendix-parsed edges), and 4 threads (untouched — see Phase 12 above for why; superseded by Phase 13's
7 threads, see above). New top-level data files: `Corpus Lattice.json` / `Corpus Lattice.csv` (schema
v1.2, gitignored-adjacent — actually tracked/committed as the new ground-truth source, see
`.gitignore`). New script: `scripts/rebuild-edges-from-lattice.mjs`.

**Phase 11 current state (September 3, 2026):** `records-2/` is the canonical raw-source folder
(456 verified meditations + 8 Stone Tablets + audit doc + 5 reference docs); `records/` holds 456
regenerated meditation pages + 9 Stone Tablet/audit pages (465 total `-v2.html` files), pure
generated output with no raw `.md` siblings anymore. New top-level pages: `stone-tablets.html`,
`corpus-architecture.html`. `record.html` is deleted. The historical bullets below (Phases 1–10)
describe the site's evolution up to that point; see "Phase 11"/"Phase 12" above for the full
account of what superseded them.

- `index.html`, `mystery.html`, `threads.html`, `paths.html`, `archive.html` — all v2, all cross-linked in nav; `archive.html` rebuilt in Phase 5 into a real browsable, searchable index, now describing 409 local records (Phase 10)
- `mystery-v2.html`, `record.html` — legacy pages kept only for redirect/reference; not linked from anywhere live except `record.html?mode=original` from the landing page's third invitation card (intentional — refers to the preserved v11 interior record, a different concept from a curated meditation's no-interpretation view)
- `records/*-v2.html` (**409 files**, up from 394 in Phase 10) — every local record page: 404 reviewed (7 curated seeds + 131 from `build-corpus-records.mjs` + 63/68/77/35 promoted across Phases 6–9's now-superseded scripts + 8 further promoted and 15 newly-mirrored by Phase 10's `rebuild-cross-references-verified.mjs`) + 5 mirrored; every page carries the audio-player and human-doorways mounts/hooks
- `six-doctrinal-spines.html`, `spines-timeline.html` — two self-contained infographic pages (own light-parchment visual design, deliberately distinct from the site's dark theme) wrapped with the standard site banner/nav/footer, linked from `archive.html` and `index.html`. **Replaced in Phase 10** with the corrected "Eight Stone Tablets" versions from `verified-source-docs/` (Phase 9's versions still said "Six Doctrinal Spines," the same mislabeling this phase corrected everywhere else).
- `records/*.html` (7 files, no `-v2` suffix) — superseded by the `-v2` versions; no longer linked anywhere in the site after the routing fix, kept only as historical artifacts
- `assets/favicon.svg` — new, linked from every page
- `assets/audio-player.js`, `assets/audio-player.css` — the Phase 3 audio player component, built ahead of source material
- `scripts/build-corpus-records.mjs` — the generator that produced the 131 reviewed record pages and rebuilt `assets/records-data.js`; safe to re-run if the pass documents are extended (see its own header for what must be re-applied afterward)
- `scripts/build-mirror-records.mjs` — the Phase 5 generator that produced the mirrored record pages
- `scripts/tag-encounter-dimensions.mjs` — the Phase 4 tagger that computes `encounter`/`doorwayThemes` for every record
- `scripts/relink-corpus-paths.mjs` — the Phase 5 script that safely re-links Corpus Paths steps to local pages, 35 of 48 as of Phase 11. **Superseded by Phase 13's `rebuild-threads-and-paths.mjs`**, which rebuilds `corpus-paths-data.js` wholesale from the owner's new corpus map documents via Corpus Lattice matching. Kept as a historical artifact; do not re-run against the current `corpus-paths-data.js` schema.
- `scripts/integrate-passes-7-8.mjs`, `scripts/integrate-passes-9-13.mjs`, `scripts/integrate-passes-14-16.mjs`, `scripts/integrate-pass-17.mjs` (Phases 6–9) — **superseded by Phase 10.** Each promoted mirrored records and built edges by parsing Pass-N-Cross-References.md *summary* documents; that data was found to be partly hallucinated. Kept in the repository as historical artifacts documenting the project's evolution; do not re-run them.
- `scripts/rebuild-cross-references-verified.mjs` (Phase 10) — parses each of the 458 verified meditation files' own embedded Cross-Reference Appendix, rebuilds `JC_EDGES` wholesale, adds `tabletAnchor`, mirrors any missing files. **Superseded by Phase 11** (records-2/ cutover) then again by **Phase 12** for edges specifically (Corpus Lattice verification). Kept as a historical artifact; `tabletAnchor` generation logic remains referenced by `build-records2-corpus.mjs`.
- `scripts/build-records2-corpus.mjs` (Phase 11, current authoritative record-page/JC_RECORDS generator; **Phase 14** rewrote its appendix parser) — parses every `records-2/` meditation file's own metadata + embedded Cross-Reference Appendix (now extracting the full Doctrinal Spine / Lexicon Joints / Chiastic Mirror / Doctrinal Themes Carried structure, not just typed links), regenerates every record page and `JC_RECORDS`/`tabletAnchor` wholesale, and writes `assets/appendix-joints.json`. Re-run whenever `records-2/` is updated; must be followed by `rebuild-edges-from-lattice.mjs` (Phase 12/14) to regenerate `JC_EDGES` afterward (this script's own JC_EDGES output is immediately superseded).
- `scripts/build-stone-tablet-pages.mjs`, `scripts/rebuild-reference-pages.mjs` (Phase 11) — Stone Tablet reader pages and the 3 infographic pages, both sourced from `records-2/`.
- `scripts/rebuild-edges-from-lattice.mjs` (**Phase 12, current authoritative `JC_EDGES` rebuilder; Phase 14** added joint-type reconciliation) — re-derives the `records-2/` filename→id mapping (imported from `build-records2-corpus.mjs`, with a hard safety check against the committed `JC_RECORDS`), matches every local record to its Corpus Lattice node via exact `archive_filename` string equality, and wholesale-replaces `JC_EDGES` with only `status: "ok"` meditation-to-meditation cross-references — each now enriched with a real `jointType`/`note` from `assets/appendix-joints.json` when the appendix independently named one for that exact verified pair. Reports (does not modify) `JC_THREADS` coverage. Re-run whenever `Corpus Lattice.json` is updated — requires schema v1.2 or later (the `archive_filename` fields); refuses to run against older schemas.
- `records/*.md` — **removed as of Phase 11**; `records/` is now pure generated `-v2.html` output. Raw source lives exclusively in `records-2/`.
- `verified-source-docs/PLAUD-Meditations-Corpus_2026-09-02/` (Phase 10) — **superseded by `records-2/` in Phase 11**; gitignored/local-only as of Phase 11's `.gitignore` update. Kept locally for historical audit trail, not part of the public repo.
- `Superseded-Docs/` (Phase 10, expanded Phase 11) — every document earlier phases superseded, including a full pre-Phase-11 snapshot of the old `records/` folder (`records-pre-records2-cutover-2026-09-03/`). Gitignored/local-only as of Phase 11.
- `Corpus Lattice.json`, `Corpus Lattice.csv` (Phase 12) — the owner's schema-versioned ground-truth cross-reference dataset (v1.2 as of this writing: every node/cross-reference-target carries paired original/`archive_filename` fields). Committed to the repository as the current source of truth for `JC_EDGES`; re-run `rebuild-edges-from-lattice.mjs` whenever these are updated.
- `scripts/rebuild-threads-and-paths.mjs` (**Phase 13, current authoritative `JC_THREADS`/`corpus-paths-data.js` rebuilder**) — transcribes thread/path members verbatim from the owner's corpus map documents' own `memo:` links (never a paraphrase or a date-only guess), resolves each to a local record via `memoBasename` → Corpus Lattice node (matched on `path` basename) → `archive_filename` → `records-2/` id (re-derived via the same imported, hard-safety-checked logic `rebuild-edges-from-lattice.mjs` uses). Wholesale-replaces `JC_THREADS` and rewrites `assets/corpus-paths-data.js`. Re-run whenever the corpus map documents or Corpus Lattice are updated; always run after `rebuild-edges-from-lattice.mjs`.
- `Corpus Map — How These Documents Read Each Other.md`, `PLAUD Meditations Corpus Map — How the Meditations Read Each Other.md` (Phase 13) — the owner's new hand-authored corpus map documents (13 threads, ~10 reading paths, 36-term lexicon, persons-as-nodes, horizons — only Threads 1–10/7-built and 5 reading paths adopted this phase; the rest explicitly deferred, see "Deferred" above). Source input to `rebuild-threads-and-paths.mjs`; not committed to the public repo (kept locally as source reference only, consistent with the other corpus-map source documents' handling).
- `assets/appendix-joints.json` (**Phase 14**) — a `from->to` → `{jointType, note}` lookup built by `build-records2-corpus.mjs` from every meditation's own Cross-Reference Appendix and consumed by `rebuild-edges-from-lattice.mjs` to enrich Corpus-Lattice-verified edges with their real structural classification. Committed to the repository; regenerated on every `build-records2-corpus.mjs` run.
- `assets/beta.js`, `assets/beta.css` — **deleted in Phase 13** (confirmed dead code: an earlier, unused implementation of the carry-a-question feature, referenced by zero HTML files).

---

## Success Criteria

- ✓ **Phase 14 (appendix richness):** every meditation's own Cross-Reference Appendix (Doctrinal Spine,
  Thread Joints, Lexicon Joints, Expanded Chiastic Mirror, Tablet Anchor) now feeds real structured
  data onto the site instead of a flat "continues" label — 3,075/3,079 Corpus-Lattice-verified edges
  (99.8%) carry a real, specific `jointType`; a Doctrinal Spine widget, joint-type badges, and Lexicon
  Joints/Chiastic Mirror displays render on record pages; a joint-type filter on Threads; widened
  Mystery Mode matching; a Doctrinal-theme filter on the landing page's Encounter Index. Found and
  fixed three real bugs along the way, including a significant pre-existing one (present since Phase
  11) that had silently dropped ~1,600 genuinely-resolvable appendix cross-references; see "Phase 14"
  above for the full account
- ✓ **Phase 13 (public beta cleanup pass):** `JC_THREADS` rebuilt from 4 stale pre-`records-2`
  threads to 7 threads transcribed directly from the owner's new corpus map documents, resolved via
  Corpus Lattice path-matching with zero guessing; `assets/corpus-paths-data.js` rebuilt from 6 stale
  paths (with external links) to 5 fully-local paths (zero external links); a real "undefined"
  rendering bug on the Threads page, a real ID-mismatch bug silently breaking the carry-a-question
  feature (archived per owner decision), a real `MAX_POOL_SIZE=10` cap undercounting Mystery Mode's
  doorway pools, and a real pre-existing `jcStepHref is not defined` bug silently breaking all of
  Corpus Paths' rendering were all found and fixed; the "editorial connection" 3-tier status system
  removed site-wide now that every edge is Corpus-Lattice-verified; every public-facing page swept for
  internal-project language (phase numbers, CHANGELOG/GitHub links, schema versions); see "Phase 13"
  above for the full account
- ✓ **Phase 12 (Corpus Lattice verification):** `JC_EDGES` rebuilt wholesale from the owner's
  schema-versioned Corpus Lattice dataset — 456 records, 3,079 verified edges (up from 1,997
  appendix-parsed), zero isolated records (every record has at least one verified connection);
  matching resolved with zero heuristics once schema v1.2's `archive_filename` fields arrived
  (100% of local records matched their own Lattice node exactly); a real CSS blank-gap/double-
  spacing bug and a template-ordering issue (return panel not actually last) found and fixed; see
  "Phase 12" above for the full account, including a self-inflicted mojibake bug found and fixed
  mid-task
- ✓ **Phase 11 (Public Beta 2.0):** full corpus rebuilt from `records-2/` — 456 records (all
  reviewed, all with `tabletAnchor`), 1,997 edges, 4 threads remapped; the previously-broken
  article-body bug (stale pre-verification content displayed as record text) is fully resolved by
  regenerating every page directly from the newly-verified source; site promoted to a public
  "PUBLIC BETA 2.0" banner site-wide; `record.html` and the never-public interior-v11 concept
  retired; Mystery Mode's broken doorway-routing table and `archive.html`'s missing-September bug
  found and fixed; see "Phase 11" above for the full account
- ✓ All five top-level pages match v2 design and are cross-navigable
- ✓ Related records / threads / paths all route to the correct, formatted pages
- ✓ Accessibility audit clean; Lighthouse 99–100 across the board
- ✓ Mystery Mode fully canonicalized with a working no-interpretation route
- ✓ Living archive: 404 of 458 verified meditations reviewed (via the corpus-wide truth-corrected Cross-Reference appendices, Phase 10) and fully published as record pages, embedded as-is per owner direction
- ✓ Seven named threads (Zechariah 3 Loop, Samuel Loop, Mantle Sequence, Murmuration, Exousia/Dunamis, Sacred Ordinary, Descent Into Hiddenness) resolved and navigable from Threads and the landing page
- ✓ Mystery Mode doorways pool across the full reviewed set, not just the original 7 (and correctly excludes mirrored records so the "reviewed pool" claim stays honest)
- ✓ Reviewed thread connections and chronology visible directly on every record page (fixed a dead-code regression that had silently hidden them)
- ✓ Audio player component built and wired into every record page, verified working; dormant until real audio source material is provided
- ✓ A real Encounter Index (design doc §9) lets a reader choose an encounter by temperature/length/movement/posture/voice/season and receive a matching record, verified with real and empty-match cases
- ✓ Every record page offers "human doorways" theme chips (§7) alongside its reviewed edges
- ✓ A local-only "Welcome back" panel surfaces the last record read and any carried question, verified showing/hiding correctly
- ✓ **Every meditation uploaded into this repository (409 of 426 raw files) now has a local page — no reader needs the author's private AI Drive to read one.** 15 more raw files were mirrored directly from the verified-source-docs bundle in Phase 10, closing part of the historical "not yet uploaded" gap. The remaining raw-file surplus is non-meditation artifacts (supporting documents, duplicates already resolved to an existing record by title) or files genuinely absent from both this repository and the verified bundle — see Phase 10 above for specifics.
- ✓ 21 of 48 Corpus Paths steps relinked to local pages with individually-verified confidence; the remaining 27 are disclosed, not silently broken or silently guessed
- ✓ Pass 7 and Pass 8 Cross-References (70 more entries, archive coverage 171→241) integrated into the reviewed layer: 63 mirrored records promoted to reviewed, 53 new same-cluster edges added (Phase 6) — **superseded by Phase 10; see below**
- ✓ Pass 9–13 "Encounter Edition" Cross-References (107 more entries, archive coverage 241→328) integrated into the reviewed layer: 68 mirrored records promoted to reviewed, 57 new same-cluster edges added (Phase 7) — **superseded by Phase 10; see below**
- ✓ Pass 14–16 "Encounter Edition" Cross-References (105 more entries, archive coverage 328→419, 91.3%) integrated into the reviewed layer: 77 mirrored records promoted to reviewed, 73 new same-cluster edges added (Phase 8) — **superseded by Phase 10; see below**
- ✓ Pass 17 (the corpus's own declared final wave, "458/458 real Markdown files, 100%") integrated into the reviewed layer: 35 mirrored records promoted to reviewed, 32 new same-cluster edges added (Phase 9) — **superseded by Phase 10; see below**
- ✓ Six Doctrinal Spines infographic and Timeline of Six Spines embedded as new site pages (`six-doctrinal-spines.html`, `spines-timeline.html`), wrapped with standard site chrome and linked from `archive.html`/`index.html` (Phase 9) — **content replaced in Phase 10 with the corrected "Eight Stone Tablets" versions**
- ✓ Audited all 10 Encounter-Edition pass docs (7–16) for named-thread claims not yet captured as edges; found 6 candidate cross-pass narrative chains, verified each against its resolved file's real body content (not filename), and correctly declined to fabricate edges once verification showed content mismatches — documented as an open item rather than guessed at (Phase 8; Pass 17 introduced no new such chains)
- ✓ **TRUTH CORRECTION (Phase 10):** discovered the entire Phase 6–9 cross-reference layer was built from Pass-N summary documents that were partly hallucinated (inferred Tablet labels, some non-existent link claims); rebuilt `JC_EDGES` wholesale (357 → **3,270** edges) by parsing each of the 458 verified meditations' own embedded, hand-checked Cross-Reference Appendix directly; added a corrected `tabletAnchor` field (the true Stone Tablet volume + window) to 400 of 409 records; promoted 8 more mirrored records and mirrored 15 brand-new ones from the verified bundle — **404 reviewed / 5 mirrored**, out of 409 total local records
- ✓ Replaced both infographic pages with the bundle's corrected "Eight Stone Tablets" versions (Phase 9's had inherited the same six-vs-eight mislabeling this phase corrected everywhere else)
- ✓ Moved every superseded corpus-tagging document (17 old Pass-N ledgers, old Master Index/Tracker/infographics, old Corpus Map docs including the original project-root one still naming "seven" Stone Tablets) to `Superseded-Docs/` (Phase 10)
- ○ Landing page's Chronological/Thematic/Encounter maps are first drafts pending owner verification; Scripture Map and Tablet Map remain placeholders
- ○ 5 meditations remain mirrored but not yet cross-referenced; 9 records have no `tabletAnchor` (a mix of those 5, known pre-existing content/filename-mismatch cases, and intentionally-excluded duplicate/non-meditation raw files) — this is the practical floor of what this repository's own verified-bundle match can confirm
- ○ The four named `JC_THREADS` (Zechariah 3, Samuel Loop, Murmuration, Descent) were **not** re-verified in Phase 10 — they depend on the now-superseded Corpus Map, and no corrected replacement was supplied; whether their own step sequences need re-verification is an open question, not assumed fine
- ○ The 9 Stone Tablet volumes are referenced (via `tabletAnchor` labels) but not yet ingested as their own browsable site records — a disclosed future-phase scope, not a silent gap
- ○ 6 milestone-named cross-pass narrative chains (father-cancer arc, secret-place lineage, corpus-self-awareness lineage, Jer 20:9 fire-in-bones spine, Jonah-arc) from the Phase 8 audit remain unresolved — that audit predates and is now superseded in spirit by Phase 10's full rebuild, but these specific claims were narrative prose (not appendix-embedded links) and so weren't re-examined by Phase 10's parser; still need the author's own hands-on verification against their private drive
- ○ Audio: per-record integration blocked pending source material (component itself is done)
- ○ Public launch: pending stakeholder sign-off and an explicit decision to lift the "not for public distribution" status
- ○ 27 Corpus Paths steps and ~41 undocumented-but-missing meditations need the author's own hands-on knowledge of the corpus to fully resolve

---

## References
- `.github/workflows/deploy.yml` — Auto-deployment workflow
- `DESIGN_V2_COMPLETE.md`, `JORDAN_CROSSING_MYSTERY_MODE_AND_PUBLIC_WITNESS_DESIGN.md` — design specifications
- Session checkpoints: `~/.copilot/session-state/730c7681-900a-499d-8904-10ffbdd0089d/checkpoints/`
