# Jordan Crossing — Build Progress & Next Steps

## Current Status (August 31, 2026)

### Completed ✓
- **Phase 1:** Landing page (index.html), Mystery Mode (mystery.html), Threads (threads.html), Paths (paths.html) — all redesigned with v2 styling
- **Phase 2.1:** Related Records feature complete — all curated records display 2-3 thematically connected records
- **Phase 2.2:** Thread edges/corpus paths defined — reading paths structured in corpus-paths-data.js
- **Record presentation:** Markdown embedded in all redesigned record pages renders as semantic, readable HTML
- **Phase 4:** Full-text search (search-index.js), faceted filters, tagged reading paths
- **Phase 5 (partial):** noindex removed, public docs created (CHANGELOG, DEPLOYMENT, README), sitemap/robots, link validation
- **Mystery Mode canonicalization:** `mystery.html` is now the single public route carrying the full v2 doorway grid (11 doorways), guidance text, focus-visible states, and correct routing to all destination records. `mystery-v2.html` is retired — it now meta-redirects to `mystery.html` and is marked `noindex` so it can never drift from the canonical experience again.
- **Accessibility audit:** Verified keyboard navigation, focus-visible outlines, heading hierarchy, alt text/labels, and console cleanliness across all public pages. Found and fixed a real contrast bug on `threads.html` — the `thread-status` badges (author-confirmed / editorial connection / open) used dark, low-contrast text colors left over from a light-theme mockup; replaced with light accent colors that pass WCAG AA (4.5:1+) against the dark v2 background.

### In Progress / Next Decision
- **The living archive (Stage 6):** The full raw meditation corpus (~424 files), a Corpus Map, and three cross-reference passes have been added to `records/`. These describe the private "Personal Space" source corpus (~451 meditations across the Stone Tablets). Per the design document's own guardrails (§1, §2.1, §26 — "private people and protected internal arcs remain private," "introduce the broader corpus in reviewed layers"), these should NOT be bulk-published as public record pages without editorial review — some file names and contents reference private individuals. Recommended path: use the cross-reference passes to strengthen thread connections between the already-published curated records, and build the archive index as a metadata-only, reviewed-layer feature rather than an automatic bulk conversion. See conversation history for the specific question posed to the project owner.

### To Do
- **Phase 3:** Audio Implementation (audit audio, build audio player component, integrate into records)
- **Phase 5 (remaining):** Final QA, performance audit, deploy to public GitHub Pages

---

## Immediate Next Steps (Priority Order)

### 1. ✓ Validate Mystery Mode — DONE
Canonical `mystery.html` verified in-browser: doorway selection, aria-pressed state, guidance text, focus-visible (gold outline, 2px/3px offset), continue-button routing to all 11 destination records, and no console errors. `mystery-v2.html` now redirects to it.

### 2. ✓ Complete Accessibility and Public QA — DONE
Automated contrast audit (WCAG AA, alpha-composited against real backgrounds) across index, mystery, threads, paths, and all record pages found and fixed one real regression (thread-status badges on threads.html). Heading hierarchy, alt text, button/link labels, and console errors all clean.

### 3. Decide scope for the newly added full corpus (Stage 6 — "the living archive")
**Files:** records/*.md (424 raw meditation files), `Corpus Map.md`, `Pass 1/2/3 *-References.md`
**Open question:** these files are the raw private source layer (per the Corpus Map, part of a ~451-meditation private corpus). The design document explicitly guards against bulk-publishing private/unreviewed material. Needs an explicit decision from the project owner on: (a) build a metadata-only archive index (title/date/month counts) without exposing raw text publicly yet, (b) use the cross-reference passes only to strengthen thread edges between already-published curated records, or (c) select and hand-build a small next batch of full record pages from specific meditations named in Pass 1's doctrinal spine.

### 4. Audit Audio Availability (Phase 3 prep)
**Task:** audit-audio
**Description:** Determine which curated records have audio files; document format, duration, source
**Files:** assets/records-data.js (add audioUrl property if audio exists)
**Acceptance:** All records audited; decision made on Phase 3 scope

### 5. Public Launch Prep (Phase 5 remaining)
**Tasks:** perf-audit, final-qa, deploy-public
**Description:** Run Lighthouse, get stakeholder sign-off, deploy to production
**Acceptance:** Accessibility ≥90; performance ≥80; SEO ≥85; stable for 24h post-deploy

---

## Technical Architecture

### Data Structure
- **records-data.js:** JC_RECORDS array (7 records), JC_EDGES array (thread connections)
- **corpus-paths-data.js:** JC_CORPUS_PATHS array (6 reading paths with steps)
- **design-v2-logic.js:** Page initialization, related records rendering
- **mystery-v2-logic.js:** Interactive mystery mode (Discern/Carry/Return/Navigate)

### Key Functions
- `jcGetRelatedRecords(recordId, count)` — Returns connected records from edges
- `jcShortId(id)` — Normalizes full IDs to short IDs (e.g., '08-29-signpost' → 'signpost')
- `initRelatedRecords()` — Runs on page load to populate related-records-mount div

### Deployment Pipeline
- All changes committed to master → GitHub Actions auto-deploys to GitHub Pages
- Cache-busting via version query string (?v=YYYYMMDDVN)
- Browser cache can lag; multiple reloads may be needed to verify fresh code

---

## File Manifest

### Phase 1 Complete ✓
- `index.html` — v2 redesign complete
- `threads.html` — v2 redesign complete
- `paths.html` — v2 redesign complete
- `assets/design-v2.css` — Full v2 design system
- `mystery-v2.html` — Mystery mode interactive experience

### Phase 2 In Progress
- `assets/corpus-paths-data.js` — Paths defined; tags needed
- `assets/records-data.js` — Related records working; graph validation pending
- `records/*-v2.html` (7 files) — All showing related records ✓

### Phase 3 To Do
- `assets/audio-player.js` — Create if audio available
- `assets/audio-player.css` — Create if audio available
- Update records-data.js with audioUrl property

### Phase 4 To Do
- `assets/search-index.js` — Full-text search
- Update threads.html with search UI
- Update paths.html with tag filtering

### Phase 5 To Do
- Remove `<meta name="robots" content="noindex,nofollow">` from all HTML
- Create `CHANGELOG.md`, `DEPLOYMENT.md`
- Update `README.md` for public audience
- Create `robots.txt` and `sitemap.xml`

---

## Success Criteria

✓ **Phase 1:** Landing, threads, paths pages match v2 design  
✓ **Phase 2.1:** Related records visible on all 7 pages  
○ **Phase 2.3:** Navigation graph validated (in progress)  
○ **Phase 2.4:** All paths tagged for filtering  
○ **Phase 4:** Search & facets working; no performance regression  
○ **Phase 5:** Site public-ready; passes accessibility audit  

---

## References
- `.github/workflows/deploy.yml` — Auto-deployment workflow
- `DESIGN_V2_COMPLETE.md` — Design specification
- Session checkpoints: `~/.copilot/session-state/730c7681-900a-499d-8904-10ffbdd0089d/checkpoints/`

---

**Next Execution:** Start with validate-graph task
