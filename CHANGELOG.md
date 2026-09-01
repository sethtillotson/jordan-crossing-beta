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

### Phase 3: Audio Implementation
- ✓ Audio player component for supported records — see [1.3] above
- ✓ Playback speed control — see [1.3] above
- ✓ Accessibility features (captions) — native `<track kind="captions">` support, see [1.3] above
- Transcript sync highlighting — still future; requires per-word/per-line timing data alongside an actual audio file, neither of which exists yet
- Per-record audio integration — blocked pending the author providing real audio source files or linkable URLs (the component itself is ready; wiring one in is a one-line `audioUrl` data change)

### Phase 4: Expanded Corpus
- ✓ 131 additional meditation records reviewed and published (138 total) via six dated Cross-Reference passes — see the Living Archive section of `plan.md`
- ~280 of 451 direct-archive meditations remain outside any reviewed pass and stay metadata-only in the Archive, pending a future review pass
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
