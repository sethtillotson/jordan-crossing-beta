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

### The living archive (Stage 6) — deliberately paused pending owner review
On 2026-08-31 the full raw meditation corpus (~407 `.md` files after excluding supporting documents), a Corpus Map, and four dated Cross-Reference passes were added under `records/`. These are the private "Personal Space" source layer (the corpus's own working record puts the full count at 451 as of Aug 30, 2026). Several file names and contents reference private individuals by name.

Per the design document's own guardrails (§1 vessel-vs-witness, §2.1 "private people and protected internal arcs remain private," §26 "introduce the broader corpus in reviewed layers"), **these were intentionally not bulk-published as public record pages.** What was done instead:
- Built `archive.html` — a direct-count-only view (by month, no titles/content) consistent with Stage 6's own description ("direct-count metadata").
- Checked the cross-reference passes for overlap with the 7 already-published records — only one overlap exists (Aug 30 Filthy Garments), and it was already fully connected in `JC_EDGES`, so no new thread edges were added.
- Left the raw `.md` files, Corpus Map, and Cross-Reference passes **uncommitted** (present in the working tree for reference, not part of any commit) so they don't get pushed to a public deploy by accident.

**Next decision needed from the project owner:** which meditations (if any) from the wider corpus should be reviewed and promoted to full `-v2.html` record pages next, following the same process used for the original 7 (Markdown formatting, Related Records, thread edges, Mystery Mode doorway if applicable).

### Blocked
- **Audio (Phase 3):** audited — zero audio/video files exist anywhere in the repository for any record. The meditations here are text-only (PLAUD/Speakly-generated summaries). `build-audio-player` and `integrate-audio-player` are blocked until the author provides actual audio source files or linkable audio URLs.

### Pending human decision (not an engineering task)
- **final-qa:** requires the actual stakeholder (project owner) to review and approve — this can't be done on their behalf.
- **deploy-public:** every page currently carries an explicit "INTERIOR BETA · Private workspace · Not for public distribution" banner. Flipping this to a genuine public GitHub Pages deployment is a real, semi-irreversible decision (domain, indexing, monitoring) that needs the owner's explicit go-ahead, especially since the living-archive question above is still open.

---

## Technical Architecture

### Data Structure
- **records-data.js:** `JC_RECORDS` array (7 curated records, `href` now correctly pointing at `-v2.html` pages), `JC_EDGES` array (9 labeled thread connections, each with a `source` citation)
- **corpus-paths-data.js:** `JC_CORPUS_PATHS` array (6 reading paths with steps)
- **design-v2-logic.js:** page initialization, Markdown rendering, related records, thread rendering, and the `?mode=original` no-interpretation handling
- **mystery-v2-logic.js:** doorway selection, guidance text, routing, and no-interpretation link targeting

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
- `records/*-v2.html` (7 files) — the only fully published, reviewed meditation records
- `records/*.html` (7 files, no `-v2` suffix) — superseded by the `-v2` versions; no longer linked anywhere in the site after the routing fix, kept only as historical artifacts
- `assets/favicon.svg` — new, linked from every page
- `records/*.md` (~407 files), `Corpus Map.md`, `Pass 1–4 *.md` — the raw corpus mirror described above; present but **not committed**

---

## Success Criteria

- ✓ All five top-level pages match v2 design and are cross-navigable
- ✓ Related records / threads / paths all route to the correct, formatted pages
- ✓ Accessibility audit clean; Lighthouse 99–100 across the board
- ✓ Mystery Mode fully canonicalized with a working no-interpretation route
- ○ Living archive: paused pending owner review of what to publish next
- ○ Audio: blocked pending source material
- ○ Public launch: pending stakeholder sign-off and an explicit decision to lift the "not for public distribution" status

---

## References
- `.github/workflows/deploy.yml` — Auto-deployment workflow
- `DESIGN_V2_COMPLETE.md`, `JORDAN_CROSSING_MYSTERY_MODE_AND_PUBLIC_WITNESS_DESIGN.md` — design specifications
- Session checkpoints: `~/.copilot/session-state/730c7681-900a-499d-8904-10ffbdd0089d/checkpoints/`
