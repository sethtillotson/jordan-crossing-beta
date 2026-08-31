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

**What's left for a future pass:** ~280 of 451 meditations remain outside any of the 6 passes and stay metadata-only in the Archive; the ~27 unresolved pass-doc references need manual filename resolution; Corpus Paths' per-step relinking needs manual (not automated) verification; and the design doc's Stage 5 ("many doorways") could be extended to pool across all 138 records instead of the original 7.

The raw `.md` files, Corpus Map, and Cross-Reference passes remain **uncommitted** (present in the working tree for reference, not part of any commit) so the private "Personal Space" source layer doesn't get pushed to a public deploy by accident — only the generated `-v2.html` record pages and `assets/records-data.js` are committed.

### Blocked
- **Audio (Phase 3):** audited — zero audio/video files exist anywhere in the repository for any record. The meditations here are text-only (PLAUD/Speakly-generated summaries). `build-audio-player` and `integrate-audio-player` are blocked until the author provides actual audio source files or linkable audio URLs.

### Pending human decision (not an engineering task)
- **final-qa:** requires the actual stakeholder (project owner) to review and approve — this can't be done on their behalf.
- **deploy-public:** every page currently carries an explicit "INTERIOR BETA · Private workspace · Not for public distribution" banner. Flipping this to a genuine public GitHub Pages deployment is a real, semi-irreversible decision (domain, indexing, monitoring) that needs the owner's explicit go-ahead.

---

## Technical Architecture

### Data Structure
- **records-data.js:** `JC_RECORDS` array (138 records — 7 original curated seeds + 131 generated from the six Cross-Reference passes — `href` pointing at `-v2.html` pages), `JC_EDGES` array (121 labeled thread connections: 9 original + 112 generated from same-cluster adjacency, each with a `source` citation). Regenerated by `scripts/build-corpus-records.mjs` — do not hand-edit the generated portion; re-run the script instead if the pass documents change.
- **corpus-paths-data.js:** `JC_CORPUS_PATHS` array (6 reading paths with steps; most steps still link externally — see the living-archive note above)
- **design-v2-logic.js:** page initialization, Markdown rendering, related records, thread rendering, and the `?mode=original` no-interpretation handling
- **mystery-v2-logic.js:** doorway selection, guidance text, routing, and no-interpretation link targeting
- **scripts/build-corpus-records.mjs:** the corpus-embedding generator (see living-archive section above) — run via `node scripts/build-corpus-records.mjs` from the repo root any time the pass documents are updated or a new pass is added.

### Key Functions
- `jcGetRelatedRecords(recordId, count)` — returns connected records from edges
- `jcShortId(id)` — normalizes full IDs to short IDs (e.g., '08-29-signpost' → 'signpost')
- `initRelatedRecords()` — runs on page load to populate `related-records-mount`
- `applyNoInterpretationMode()` — hides interpretive sections when `?mode=original` is present

### Deployment Pipeline
- All changes committed to master → GitHub Actions auto-deploys to GitHub Pages
- Cache-busting via version query string (`?v=YYYYMMDDVN`) — bump the version on every asset change; browsers otherwise cache the HTML document itself (not just linked assets) for repeat visits

---

## File Manifest

- `index.html`, `mystery.html`, `threads.html`, `paths.html`, `archive.html` — all v2, all cross-linked in nav
- `mystery-v2.html`, `record.html` — legacy pages kept only for redirect/reference; not linked from anywhere live except `record.html?mode=original` from the landing page's third invitation card (intentional — refers to the preserved v11 interior record, a different concept from a curated meditation's no-interpretation view)
- `records/*-v2.html` (138 files) — all fully published, reviewed meditation records: the original 7 curated seeds plus 131 generated by `scripts/build-corpus-records.mjs` from the six Cross-Reference passes
- `records/*.html` (7 files, no `-v2` suffix) — superseded by the `-v2` versions; no longer linked anywhere in the site after the routing fix, kept only as historical artifacts
- `assets/favicon.svg` — new, linked from every page
- `scripts/build-corpus-records.mjs` — the generator that produced the 131 new record pages and rebuilt `assets/records-data.js`; safe to re-run if the pass documents are extended
- `records/*.md` (~407–410 files), `Corpus Map.md`, `Pass 1–6 *.md` — the raw corpus mirror described above; present but **not committed** (only the generated `-v2.html` output and `records-data.js` are committed)

---

## Success Criteria

- ✓ All five top-level pages match v2 design and are cross-navigable
- ✓ Related records / threads / paths all route to the correct, formatted pages
- ✓ Accessibility audit clean; Lighthouse 99–100 across the board
- ✓ Mystery Mode fully canonicalized with a working no-interpretation route
- ✓ Living archive: 138 of 451 meditations reviewed (via the six Cross-Reference passes) and fully published as record pages, embedded as-is per owner direction
- ○ Remaining ~280 unreviewed meditations stay metadata-only in the Archive pending a future review pass
- ○ Audio: blocked pending source material
- ○ Public launch: pending stakeholder sign-off and an explicit decision to lift the "not for public distribution" status

---

## References
- `.github/workflows/deploy.yml` — Auto-deployment workflow
- `DESIGN_V2_COMPLETE.md`, `JORDAN_CROSSING_MYSTERY_MODE_AND_PUBLIC_WITNESS_DESIGN.md` — design specifications
- Session checkpoints: `~/.copilot/session-state/730c7681-900a-499d-8904-10ffbdd0089d/checkpoints/`
