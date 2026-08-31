# Jordan Crossing — Design v2 Complete Overhaul

## Overview

The entire user interface and information architecture has been redesigned from a basic linear HTML structure into a **visually coherent, navigational system** that makes choice and flow explicit at every point. The design communicates the site's four movements (Discern, Carry, Return, Navigate) through spatial hierarchy, visual language, and interactive affordances.

---

## Design Principles

### 1. Visual Language is Structural
- **Color**: Gold (#c9a227) signals interactive elements and primary choices
- **Borders**: 2-4px gold borders frame cards and chosen states
- **Icons**: Each choice has a unique symbol, making patterns visible
- **Spacing**: Generous margins create breathing room and reduce cognitive load
- **Typography**: Serif for warmth, sans-serif for navigation and utility text

### 2. Choice is Always Visible
- At every page, the reader sees their options laid out as distinct, clickable cards
- Selected states are visually affirmed (gold border, inner glow)
- Response panels and guidance appear smoothly below selections
- No hidden navigation; all pathways are explicit

### 3. Flow is Navigable
- **Mystery Mode**: 11 doorways → each leads to a record + contextual guidance
- **Record Pages**: Four movements (Discern → Carry → Return → Navigate) unfold visually
- **Return Panel**: Five release choices frame the end of an encounter
- **Graph Navigation**: Prev/next links position each record in the sequence

### 4. The Interface Itself Invites
- Cards lift on hover; borders glow on focus
- Response panels slide in smoothly with animation
- Button text is pastoral and clear, not corporate
- Every interaction confirms the reader's choice without judgment

---

## New Design Components

### Header & Navigation
- Sticky header with site title (gold) and nav links
- Consistent across all pages
- Beta banner at top indicates interior workspace

### Record Header
- Left-aligned gold border
- Title, date, source status clearly separated
- Callout box with source information
- Visual hierarchy established before article

### The Four Movements

#### Movement 1: DISCERN — "What did you actually encounter?"
- **Seven choice buttons** in a responsive grid
- Each has icon + text
- **Selected state**: Gold border, inner glow, expanded icon
- **Response panel**: Appears below with contextual guidance
- Examples: "I recognized something" → affirming response; "I disagree" → honest response; "I did not understand" → supportive response
- **All responses are non-judgmental**

#### Movement 2: CARRY — "Carry a question forward"
- **Heading + description** explaining local-only storage
- **Two buttons**: "Carry this question forward" + "Write my own question"
- **On carry**: Shows preview of saved question + clear button
- **On write my own**: Textarea expands with save/cancel buttons
- localStorage-only; no transmission; no account needed

#### Movement 3: RETURN — "You have reached the end of this encounter"
- **Five depth cards** in a responsive grid
- Each card has:
  - **Title** (gold, uppercase, letter-spaced)
  - **Description** (dim parchment, 2-3 lines)
  - Subtle gradient background + gold border
- **Cards**:
  1. **Remain here** → scroll to top (button)
  2. **Follow the thread** → threads.html (link)
  3. **Read the paths** → paths.html (link)
  4. **Enter again** → mystery.html (link)
  5. **Leave and return later** → close/navigate (button)
- Hover state: lift + glow
- **No pressure**, just options

#### Movement 4: GRAPH NAV — Record sequence
- **Previous/Next links** showing title + date
- Positioned above Return panel
- Uses consistent card styling
- Shows chronological position

### Reviewed Thread Connections
- Below graph nav
- List of edges: "continues", "answers", "opens", etc.
- Each edge has source label + note
- Visual distinction between author-confirmed and editorial

### Movement Dividers
- Horizontal line with small centered dot
- Separates the four movements visually
- Subtle: not intrusive but clear

---

## Mystery Mode (New)

### Layout
- Large heading: "Enter through an honest question"
- Introductory text explaining the threshold
- **Grid of 11 doorways** (3-4 columns, responsive)

### Doorway Buttons
- Each button has icon + text
- Icons are symbolic: ◌ (beginning), ⊗ (trapped), ⏳ (waiting), etc.
- **Selected state**: Gold border + icon enlarges + changes color
- **Guidance panel**: Appears below with prompt specific to that doorway
- **Continue button**: Disabled until doorway selected, then enables with gold styling

### Doorway Routing
- Each doorway maps to one entry record:
  - "beginning again" → 08-29-signpost
  - "trapped-identity" → 08-30-man-of-flesh
  - "waiting" → 08-30-mirror
  - "cannot-see" → 08-30-mirror-gospel
  - "cost-of-obedience" → 08-30-filthy-garments
  - "surrender" → 08-30-compass
  - "searching-jesus" → 08-30-wisdom
  - ... and more

---

## Record Pages (Complete v2 Set)

All 7 record pages now use the new design:
- `08-29-signpost-v2.html`
- `08-30-man-of-flesh-v2.html`
- `08-30-mirror-v2.html`
- `08-30-mirror-gospel-v2.html`
- `08-30-filthy-garments-v2.html`
- `08-30-compass-v2.html`
- `08-30-wisdom-v2.html`

Each includes:
- Full original article text preserved
- All four movements
- Interactive discern responses
- Carry-question localStorage persistence
- Return panel with five choices
- Graph navigation (prev/next)
- Thread connections (if data available)

---

## Technical Stack

### CSS (`design-v2.css`)
- 17KB organized stylesheet
- CSS variables for colors, spacing, typography
- Responsive grid system (auto-fit, minmax)
- Smooth transitions and hover states
- Mobile-friendly (media queries for <768px)
- No external dependencies

### JavaScript (`design-v2-logic.js`)
- **discern choices**: Toggle response panels
- **carry question**: localStorage read/write, UI state management
- **return choices**: Navigation logic
- **graph nav**: Render from RECORDS_DATA if available
- **thread connections**: Render from THREAD_CONNECTIONS if available

### Mystery Mode Logic (`mystery-v2-logic.js`)
- Doorway selection → guidance display
- Continue button state management
- Routing to specific entry records

---

## Color Palette

| Use | Color | Hex |
|-----|-------|-----|
| Background | Deep charcoal | #0f1419 |
| Primary text | Parchment | #e8dcc8 |
| Secondary text | Dim parchment | #bfb5a5 |
| Accent/interactive | Gold | #c9a227 |
| Cards (light) | Gold 8% opacity | rgba(201, 162, 39, 0.08) |
| Cards (hover) | Gold 15% opacity | rgba(201, 162, 39, 0.15) |
| Borders | Gold 20% opacity | rgba(201, 162, 39, 0.2) |

---

## Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Site title | Serif | 1.5rem | Normal | Gold |
| Page heading | Serif | 2rem | Normal | Parchment |
| Section heading | Serif | 1.125rem | Normal | Parchment |
| Card title | Serif | 1rem | Normal | Gold |
| Body text | Serif | 1rem | Normal | Parchment |
| Label/caption | Sans | 0.75rem | Normal | Gold |
| Navigation | Sans | 0.875rem | Normal | Parchment dim |

---

## Spacing & Layout

- `--max-width: 56rem` (896px) for main content
- `--space-12: 3rem` padding on main
- `--space-8: 2rem` gap between sections
- `--space-4: 1rem` gap between cards
- `--space-6: 1.5rem` padding within cards
- Movement dividers: `var(--space-16)` margin (4rem)

---

## Responsive Behavior

- **Desktop**: Full grid layout, 3-4 columns for cards
- **Tablet (< 1024px)**: Auto-fit responsive columns
- **Mobile (< 768px)**:
  - Header stacks vertically
  - Navigation wraps
  - Card grids collapse to 1 column
  - Generous touch targets maintained

---

## Interactions & Animations

### Hover States
- Cards lift: `transform: translateY(-4px)`
- Border and background lighten
- Smooth transition: 0.2s cubic-bezier

### Click States
- Selection: Gold border + inner glow
- `aria-pressed="true"` for accessibility
- Button active: `scale(0.98)` on press

### Animations
- Response panels: `slideDown` 0.3s ease-out
- Guidance appears: Same animation
- No autoplay, no surprises

---

## Accessibility Features

- Semantic HTML (`<section>`, `<article>`, `<nav>`)
- ARIA labels on all interactive regions
- `aria-pressed` for toggle buttons
- Skip link present and functional
- Color not sole information carrier (icons + text)
- Sufficient contrast ratios (gold on dark, parchment on dark)
- Keyboard navigable

---

## Files Modified/Created

### New Files
- `/assets/design-v2.css` — Complete redesigned stylesheet
- `/assets/design-v2-logic.js` — Movement logic
- `/assets/mystery-v2-logic.js` — Mystery Mode interaction
- `mystery-v2.html` — Redesigned Mystery Mode entry
- `records/*-v2.html` — All 7 redesigned record pages

### Version Tracking
- Current CSS version: `?v=20260831V3`
- Current JS versions: `?v=20260831V3`
- Future edits: Increment version string to bust Cloudflare cache

---

## Testing Completed

✅ All discern choices display + responses appear  
✅ Carry-question saves to localStorage + displays status  
✅ Return choices all present and clickable  
✅ Navigation between pages works  
✅ Mystery Mode doorways select + guidance displays  
✅ Continue button enables/disables correctly  
✅ All pages serve 200 OK  
✅ CSS and JS syntax validated  
✅ Mobile-responsive layout confirmed  

---

## Next Steps (Optional)

1. **Threads/Paths redesign** — Apply same visual language to threads.html and paths.html
2. **Landing page redesign** — Create index-v2.html with stage-map placeholder cards
3. **Add audio player** — If needed for record pages
4. **Graph data** — Generate RECORDS_DATA and THREAD_CONNECTIONS files
5. **Search** — Add full-text search to threads page
6. **Archive** — Create versioned releases (Edition 1.0, etc.)

---

## Design Philosophy Summary

The redesigned Jordan Crossing is **not trying to be modern or flashy**. It is trying to be **clear, gentle, and honest about choice**. 

Every card is a choice. Every movement invites the reader to decide their next step. The visual language says: *You are not being manipulated. You are being offered options. The site trusts you to know what you need.*

The gold-on-dark palette evokes a candle in a dark room — not blinding, but sufficient for reading. The serif fonts are warm and patient. The spacing is generous because the work requires contemplation, not scrolling.

This is a threshold, not a sales funnel. The design reflects that.

---

**Status**: Phase 2 design complete and verified (Aug 31, 2026, ~14:00 CDT)  
**Live at**: https://eogvatdm.gensparkclaw.com/jordan-crossing-beta/mystery-v2.html  
**Records**: 7 record pages all updated to v2 design
