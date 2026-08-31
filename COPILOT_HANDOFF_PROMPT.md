# Jordan Crossing Beta — VS Code Copilot Handoff Prompt

You are assisting with the Jordan Crossing Interior Beta website — a private, interactive experience built around seven spiritual meditations recorded August 29-30, 2026.

## Project Context

**What this is**: An interactive web interface for reading and reflecting on meditations. Each page guides the reader through four movements:
1. **Discern** — Choose from 7 responses to "What did you actually encounter?"
2. **Carry** — Save a personal question locally for reflection
3. **Return** — Choose one of 5 paths forward (remain, follow thread, read paths, enter again, leave)
4. **Navigate** — Move chronologically through records or follow thread connections

**Design philosophy**: Gold-on-dark, card-based, responsive. Not modern or flashy—gentle, clear, honest. Every interaction affirms the reader's choice without manipulation.

**Status**: Design v2 complete and live. All 7 records redesigned. Now ready for feature completion and refinement.

## Repository

**GitHub**: https://github.com/sethtillotson/jordan-crossing-beta  
**Live (GitHub Pages)**: https://sethtillotson.github.io/jordan-crossing-beta/  
**Live (VM backup)**: https://eogvatdm.gensparkclaw.com/jordan-crossing-beta/

Auto-deployment: Every push to `master` → GitHub Actions builds → Pages deployed in ~30 seconds.

## File Structure

```
assets/
  ├── design-v2.css                # Main stylesheet (17KB, responsive, no framework)
  ├── design-v2-logic.js           # Four-movement interactive logic
  ├── mystery-v2-logic.js          # Doorway selection & routing
  ├── beta.js                      # Legacy compatibility
  └── records-data.js, corpus-paths-data.js, beta.css

records/
  ├── 08-29-signpost-v2.html       # 7 redesigned record pages
  ├── 08-30-man-of-flesh-v2.html   #   (all follow same template)
  ├── 08-30-mirror-v2.html
  ├── 08-30-mirror-gospel-v2.html
  ├── 08-30-filthy-garments-v2.html
  ├── 08-30-compass-v2.html
  ├── 08-30-wisdom-v2.html
  └── [originals & source files for reference]

index.html                         # Landing page (basic, needs redesign)
mystery-v2.html                    # Mystery Mode entry (11 doorways)
threads.html                       # Timeline view (needs redesign with v2 style)
paths.html                         # Reading paths (needs redesign with v2 style)
jordan-crossing-interior.html      # Full interior (136MB, not in GitHub, separate)

.github/workflows/deploy.yml       # GitHub Actions CI/CD
.gitignore                         # Excludes large files
README.md                          # Project documentation
```

## Design System

### Colors
```css
--background: #0f1419;             /* Deep charcoal */
--parchment: #e8dcc8;              /* Primary text */
--parchment-dim: #bfb5a5;          /* Secondary text */
--gold: #c9a227;                   /* Interactive elements */
```

### Typography
- **Serif** (Cambria, Georgia, serif): Content, titles, warmth
- **Sans-serif** (system): Navigation, UI, utility text

### Component Patterns
- **Cards**: `2px solid rgba(201, 162, 39, 0.2)` border, subtle gradient, lift on hover
- **Selected state**: Gold border + `box-shadow: inset 0 0 20px rgba(201, 162, 39, 0.1)`
- **Hover**: `transform: translateY(-4px)` + lighter border
- **Animations**: 0.3s ease-out for response panels

### Responsive
- Max-width: 56rem (896px)
- Grid auto-fit with minmax: `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`
- Mobile (< 768px): Cards stack to 1 column

## The Four Movements (Template)

### 1. DISCERN Section
- Heading: "What did you actually encounter?"
- 7 buttons in responsive grid, each with icon + text
- On click: Button gets gold border + icon enlarges; response panel slides in below
- Response panels contain contextual text + optional links
- All non-judgmental

### 2. CARRY Section
- Heading: "Carry a question forward"
- Default question pre-filled
- Button group: "Carry this question" | "Write my own"
- On carry: Shows saved status + clear button
- On write my own: Textarea expands
- Uses `localStorage` only (no server transmission)

### 3. RETURN Section
- Heading: "You have reached the end of this encounter"
- 5 depth cards in responsive grid
- Cards:
  1. **Remain here** — scroll to top (button)
  2. **Follow the thread** — navigate to threads.html (link)
  3. **Read the paths** — navigate to paths.html (link)
  4. **Enter again** — navigate to mystery.html (link)
  5. **Leave and return later** — close or navigate out (button)

### 4. NAVIGATE Section
- Previous/next record links (chronological)
- Reviewed thread connections (if data available)
- Each edge shows: source | edge type | destination

## Mystery Mode (Entry Point)

11 doorway buttons (each with unique icon + text):
- Leads to 7 different entry records (some doorways → same record)
- On select: Gold border + guidance text appears
- Continue button enables only after selection
- Routes to: `records/[record-id]-v2.html`

Doorway → Record mapping:
```javascript
'beginning-again': '08-29-signpost-v2.html'
'trapped-identity': '08-30-man-of-flesh-v2.html'
'waiting': '08-30-mirror-v2.html'
'cannot-see': '08-30-mirror-gospel-v2.html'
'cost-of-obedience': '08-30-filthy-garments-v2.html'
'surrender': '08-30-compass-v2.html'
'searching-jesus': '08-30-wisdom-v2.html'
'examine-carefully': '08-29-signpost-v2.html'
'signpost': '08-29-signpost-v2.html'
'jordan-crossing': 'jordan-crossing-interior.html'
'compass': '08-30-compass-v2.html'
```

## Key Technical Decisions

1. **No framework** — Vanilla HTML/CSS/JS only
2. **localStorage-only carry-question** — No server transmission; no cookies
3. **Version query strings** — Use `?v=YYYYMMDDVN` to bust Cloudflare cache on CSS/JS changes
4. **Return navigation: mostly links** — `<a>` tags survive JS caching; buttons for in-page actions
5. **Responsive grid** — `auto-fit, minmax()` for mobile-first design
6. **Semantic HTML** — `<section>`, `<article>`, `<nav>` for accessibility
7. **ARIA labels** — All interactive regions have `aria-label` or `aria-pressed`

## Common Tasks

### Add a new discern response
1. Find the discern section in any record
2. Copy an existing response button + response panel
3. Edit icon, text, and response content
4. Test in browser (F12 to check console)

### Change styling
1. Edit `assets/design-v2.css`
2. Increment version: `?v=20260831V4` (example)
3. Update all HTML files referencing that CSS
4. Commit & push

### Test locally
1. Open the HTML file directly in browser (no server needed for static files)
2. OR: Use VS Code Live Server extension
3. Check console (F12) for JS errors
4. Test on mobile via device emulation (F12 → Device Toolbar)

### Deploy
```bash
git add .
git commit -m "Your change description"
git push origin master
# GitHub Actions auto-deploys ~30 seconds later
```

## Important Notes

### Large Files
- `jordan-crossing-interior.html` (136MB) is NOT in GitHub
- It's excluded via `.gitignore`
- Serves from VM only at: https://eogvatdm.gensparkclaw.com/jordan-crossing-beta/jordan-crossing-interior.html
- If you need to add it to GitHub Pages, use GitHub's release/download or serve separately

### Cloudflare Caching
- CSS/JS cached for 4 hours
- To force refresh: change the `?v=` query string
- HTML pages are not cached (200 OK, no 304)

### Accessibility
- Color not sole information carrier (icons + text)
- Contrast ratios: gold #c9a227 on #0f1419 meets WCAG AA
- Keyboard navigable (Tab, Enter, Space)
- Skip link present

### Browser Compatibility
- Modern browsers only (ES6+, CSS Grid, CSS Variables)
- No IE11 support (intentional)
- Tested on: Chrome, Firefox, Safari

## Next Steps (Suggested)

1. **Redesign landing page** (index.html) — Apply v2 visual language, add stage-map cards
2. **Redesign threads.html** — Apply v2 style, improve timeline layout
3. **Redesign paths.html** — Apply v2 style, show path relationships
4. **Extend Corpus Paths** — Import additional meditations from doctrinal spine
5. **Add audio** — Audio player UI for supported records
6. **Search** — Full-text search on threads page
7. **Public deployment** — Remove `noindex` when approved

## Documentation

- `README.md` — Project overview + quick start
- `DESIGN_V2_COMPLETE.md` — Complete design spec + colors/typography/components
- `GITHUB_DEPLOYMENT_HANDOFF.md` — Developer workflow guide
- GitHub repo issues — Use for feature tracking

## Contact & Questions

- All changes tracked in git history
- Rollback: `git revert <commit>` + push
- For major changes: commit early, push often, iterate

## Key Files to Understand First

1. **assets/design-v2.css** — Read this to understand the visual system
2. **records/08-30-compass-v2.html** — Template for all record pages
3. **mystery-v2.html** — Entry point; study the doorway button pattern
4. **assets/design-v2-logic.js** — Core interaction logic (discern, carry, return, navigate)

---

**Status**: Design v2 complete. Ready for feature completion and refinement.  
**Workflow**: Edit → Commit → Push → Auto-deploy  
**Philosophy**: Clear, gentle, honest. Every choice visible. No manipulation.

Soli Deo Gloria
