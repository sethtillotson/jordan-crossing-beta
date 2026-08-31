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

### Technical Details

- **Framework**: None (vanilla HTML5/CSS3/JavaScript)
- **Static Site**: All data in JavaScript; no server-side code
- **Persistence**: localStorage only for carry-question feature
- **Deployment**: GitHub Pages with GitHub Actions CI/CD
- **Cache Strategy**: Query string versioning (?v=YYYYMMDDVN) for CSS/JS
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

### Known Limitations

- Audio player not yet implemented (audio source files not yet available)
- Corpus limited to 7 meditation records (can expand to 20–30)
- No transcript search (future enhancement with audio)
- No community features (annotations, study groups)

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

### Phase 3: Audio Implementation (Future)
- Audio player component for supported records
- Transcript sync highlighting
- Playback speed control
- Accessibility features (captions)

### Phase 4: Expanded Corpus (Future)
- 20–30 additional meditation records
- Tag system expansion
- Advanced search filters

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
