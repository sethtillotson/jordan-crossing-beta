# Jordan Crossing Beta — Quick Reference Card

Print this or keep it open in a VS Code tab while developing.

---

## Color System

```
Background:     #0f1419    (Deep charcoal)
Text:           #e8dcc8    (Parchment)
Text dim:       #bfb5a5    (Dim parchment)
Interactive:    #c9a227    (Gold)

Gold transparent:
  rgba(201, 162, 39, 0.08)    ← Card background (light)
  rgba(201, 162, 39, 0.15)    ← Card background (hover)
  rgba(201, 162, 39, 0.2)     ← Border
```

## Copy-Paste CSS Variables

```css
:root {
  --background: #0f1419;
  --parchment: #e8dcc8;
  --parchment-dim: #bfb5a5;
  --gold: #c9a227;
  
  --font-serif: "Cambria", "Georgia", serif;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  
  --text-lg: 1.125rem;
  --text-base: 1rem;
  --text-sm: 0.875rem;
  
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  
  --radius-md: 0.5rem;
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Common Patterns

### Card (clickable)
```html
<button class="card" type="button">
  <h3 class="card-title">Title</h3>
  <p>Description text</p>
</button>
```

```css
.card {
  padding: var(--space-6);
  background: rgba(201, 162, 39, 0.08);
  border: 2px solid rgba(201, 162, 39, 0.2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}

.card:hover {
  background: rgba(201, 162, 39, 0.15);
  border-color: var(--gold);
  transform: translateY(-4px);
}

.card[aria-pressed="true"] {
  border-color: var(--gold);
  box-shadow: inset 0 0 20px rgba(201, 162, 39, 0.1);
}
```

### Response Panel (hidden by default, slides in)
```html
<div class="response-panel" style="display: none;">
  <p>Response text</p>
</div>
```

```css
.response-panel {
  padding: var(--space-6);
  background: rgba(201, 162, 39, 0.08);
  border-left: 4px solid var(--gold);
  border-radius: var(--radius-md);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Responsive Grid
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

---

## File Paths

| File | Purpose |
|------|---------|
| `assets/design-v2.css` | Main stylesheet |
| `assets/design-v2-logic.js` | Four-movement logic |
| `assets/mystery-v2-logic.js` | Doorway routing |
| `records/08-30-compass-v2.html` | Template for all records |
| `mystery-v2.html` | Mystery Mode entry |
| `index.html` | Landing page |
| `threads.html` | Timeline view |
| `paths.html` | Reading paths |

---

## Common Git Commands

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Clear description of what changed"

# Push to GitHub (triggers auto-deploy)
git push origin master

# View recent commits
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# View what changed in a file
git diff <filename>
```

---

## Workflow Checklist

- [ ] Make changes in VS Code
- [ ] Test in browser (F12 for console, Device Toolbar for mobile)
- [ ] Check console for JS errors
- [ ] Test all interactive elements (buttons, responses, navigation)
- [ ] If changed CSS/JS: increment `?v=` version string
- [ ] Commit with clear message
- [ ] Push to master
- [ ] Wait 30 seconds
- [ ] Check https://sethtillotson.github.io/jordan-crossing-beta/

---

## Version Query String

When editing CSS or JS:

**OLD**:
```html
<link rel="stylesheet" href="./assets/design-v2.css?v=20260831V3">
```

**NEW**:
```html
<link rel="stylesheet" href="./assets/design-v2.css?v=20260831V4">
```

This forces Cloudflare to refresh the cache.

---

## Testing Checklist

Before pushing:

- [ ] Discern: All 7 choices toggle, responses appear
- [ ] Carry: Question saves to localStorage, clear button works
- [ ] Return: All 5 choices navigate or perform action
- [ ] Navigation: Prev/next links work
- [ ] Mobile: Cards stack to 1 column on phone width
- [ ] Console: No JS errors (F12)
- [ ] Links: All external links work (test 1-2 per page)

---

## Design Philosophy Reminders

✓ Clear — Every choice visible and distinct  
✓ Gentle — No manipulation, no pressure  
✓ Honest — Reflects that this is a threshold, not a transaction  
✓ Warm — Gold on dark like a candle  
✓ Inviting — Responsive to what the reader brings  

**Not**: Modern, flashy, trendy, over-engineered, pushy  
**But**: Pastoral, plain, exact, patient, trustworthy

---

## Resources

- **Main README**: `README.md`
- **Design Spec**: `DESIGN_V2_COMPLETE.md`
- **Handoff Prompt**: `COPILOT_HANDOFF_PROMPT.md`
- **Usage Guide**: `COPILOT_USAGE.md`
- **Deployment Guide**: `GITHUB_DEPLOYMENT_HANDOFF.md`

---

**Status**: Ready to work · Auto-deploy active · All systems live

Soli Deo Gloria
