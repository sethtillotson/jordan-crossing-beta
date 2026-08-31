# Jordan Crossing — Build Progress & Next Steps

## Current Status (August 31, 2026)

### Completed ✓
- **Phase 1:** Landing page (index.html), Threads (threads.html), Paths (paths.html) — all redesigned with v2 styling
- **Phase 2.1:** Related Records feature complete — all 7 records display 2-3 thematically connected records
- **Phase 2.2:** Thread edges/corpus paths defined — reading paths structured in corpus-paths-data.js

### In Progress
- **Phase 2.3:** Validate navigation graph (check for orphaned records, verify all edges)
- **Phase 2.4:** Add topic tags to paths (for faceted filtering in Phase 4)

### To Do
- **Phase 3:** Audio Implementation (audit audio, build audio player component)
- **Phase 4:** Search & Discoverability (implement full-text search, faceted filters)
- **Phase 5:** Public Launch (remove noindex, create docs, accessibility audit, deployment)

---

## Immediate Next Steps (Priority Order)

### 1. Validate Navigation Graph
**Task:** validate-graph  
**Description:** Ensure all localId references in corpus-paths-data.js exist in JC_RECORDS; check for orphaned records; verify no broken edges  
**Files:** assets/records-data.js, assets/corpus-paths-data.js  
**Acceptance:** All records linked; no orphans; all edge references valid

### 2. Add Topic Tags to Reading Paths
**Task:** add-tags  
**Description:** Add tags[] array to each path in corpus-paths-data.js; categorize by theme/difficulty/length  
**Files:** assets/corpus-paths-data.js, paths.html (render tag pills)  
**Acceptance:** All paths tagged; tags render as clickable pills on paths.html

### 3. Implement Full-Text Search (Phase 4)
**Task:** implement-search  
**Description:** Create search-index.js; add search input to threads.html; filter timeline by content  
**Files:** assets/search-index.js, threads.html  
**Acceptance:** Search returns results within 200ms; highlighting works

### 4. Audit Audio Availability (Phase 3 prep)
**Task:** audit-audio  
**Description:** Determine which of the 7 records have audio files; document format, duration, source  
**Files:** assets/records-data.js (add audioUrl property if audio exists)  
**Acceptance:** All records audited; decision made on Phase 3 scope

### 5. Public Launch Prep (Phase 5)
**Tasks:** remove-noindex, create-docs, link-validation, perf-audit, final-qa  
**Description:** Remove private flags, create documentation, run audits, prepare for public deployment  
**Files:** All HTML files, README.md, CHANGELOG.md, DEPLOYMENT.md, robots.txt, sitemap.xml  
**Acceptance:** All noindex removed; accessibility ≥90; performance ≥80; links all valid

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
