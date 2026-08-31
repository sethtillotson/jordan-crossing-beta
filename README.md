# Jordan Crossing — Private Beta

## Interior Record for the Living Topology Corpus

**Status:** Private beta · Not for public distribution  
**Built:** August 31, 2026  
**Interior version:** Beta 1.0  
**Corpus version:** v11 (jordan-crossing-interior.html preserved untouched)

---

## What this is

The Jordan Crossing is an interactive, text-based encounter with seven meditations recorded by Seth Tillotson on August 29–30, 2026. Each meditation is a first-person witness account of a spiritual movement—discernment, questioning, transformation, recognition.

This repository holds the **design, interactive logic, and complete beta site** for the interior experience.

---

## Quick Start

### Live URLs

| URL | Purpose |
|-----|---------|
| https://sethtillotson.github.io/jordan-crossing-beta/ | GitHub Pages (auto-deployed) |
| https://eogvatdm.gensparkclaw.com/jordan-crossing-beta/ | VM-hosted (private, noindex) |

### Structure

```
.
├── assets/
│   ├── design-v2.css              # Complete redesigned stylesheet (17KB)
│   ├── design-v2-logic.js         # Four-movement interactive logic
│   ├── mystery-v2-logic.js        # Doorway selection & routing
│   ├── beta.js                    # Legacy logic (compatibility)
│   └── *.js, *.css                # Supporting files
├── records/
│   ├── *-v2.html                  # 7 redesigned record pages
│   ├── *.html / *.md              # Original records (archive)
│   └── tablet-viii-seed-register.md
├── mystery-v2.html                # Redesigned mystery mode entry
├── threads.html                   # Timeline view
├── paths.html                     # Reading paths
└── index.html                     # Landing page
```

### The Four Movements (on each record)

1. **Discern** — "What did you actually encounter?" (7 response choices)
2. **Carry** — Save a question locally for reflection (localStorage-only)
3. **Return** — Release choices (5 paths forward)
4. **Navigate** — Chronological links + thread connections

---

## Design System

### Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Background | Deep charcoal | #0f1419 |
| Text | Parchment | #e8dcc8 |
| Text (dim) | Dim parchment | #bfb5a5 |
| Interactive | Gold | #c9a227 |

### Typography

- **Serif (Cambria, Georgia, serif)**: Content, titles, warmth
- **Sans-serif (system)**: Navigation, UI, utility

### Components

- **Card**: 2px gold border, subtle gradient, lift on hover
- **Selected state**: Gold border + inner glow
- **Movement dividers**: Horizontal line + centered dot
- **Response panels**: Slide in smoothly with animation

---

## The Mystery Mode Doorways

Users enter through one of 11 questions/states:

| Doorway | Routes to | Icon |
|---------|-----------|------|
| I am beginning again | 08-29-signpost | ◌ |
| Trapped in old identity | 08-30-man-of-flesh | ⊗ |
| Waiting for change | 08-30-mirror | ⏳ |
| Cannot see what God is doing | 08-30-mirror-gospel | ◈ |
| Afraid of what obedience costs | 08-30-filthy-garments | △ |
| Need to understand surrender | 08-30-compass | ◇ |
| Searching for Jesus | 08-30-wisdom | ✦ |
| Examine the record carefully | 08-29-signpost | ◆ |
| Follow entire chronology | 08-29-signpost | → |
| Quiet place to begin | jordan-crossing-interior | 🕯 |
| I only know I am here | 08-30-compass | ⟳ |

---

## Deployment

### GitHub Pages (Auto)

Every push to `master` triggers a GitHub Actions workflow that:
1. Builds the static site
2. Uploads to Pages artifact
3. Deploys to `https://sethtillotson.github.io/jordan-crossing-beta/`

See `.github/workflows/deploy.yml`.

### Local VM (Manual)

```bash
cd /home/work/.openclaw/workspace/jordan-crossing-beta
python3 -m http.server 8787 &
# Served at https://eogvatdm.gensparkclaw.com/jordan-crossing-beta/
```

---

## Development

### To Edit

1. Clone or pull this repo
2. Edit `.html`, `.css`, `.js` files locally
3. Test in a browser
4. Commit & push to `master`
5. GitHub Pages auto-deploys ~30 seconds later

### Version Management

- CSS/JS are versioned with `?v=YYYYMMDDVN` query strings to bust Cloudflare cache
- When editing CSS/JS, increment the version: `?v=20260831V4`, etc.
- HTML doesn't need versioning (no 304 caching)

### File Exclusions

- `jordan-crossing-interior.html` — Too large (136MB) for GitHub; hosted separately
- `.gitignore` — Excludes large files

---

## Records Included

1. **08-29-Signpost** — "The Signpost, the Secret Place, and the Cup of the Father's Will"
2. **08-30-Man-of-Flesh** — "The Man of the Flesh Held Me Hostage"
3. **08-30-Mirror** — "The Man in the Mirror and the Christ Who Stands Between"
4. **08-30-Mirror-Gospel** — "The Mirror-Gospel and Christ the Teacher Within"
5. **08-30-Filthy-Garments** — "The Faced Image, the Filthy Garments, and the Finished Work"
6. **08-30-Compass** — "The Compass in the Locked Room"
7. **08-30-Wisdom** — "When Wisdom Ushers Power: The Loved Heir, the Renewed Mind, and the Word That Gives Witness to Itself"

---

## Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Complete redesign with responsive grid
- **Vanilla JavaScript** — No frameworks; localStorage for persistence
- **GitHub Pages** — Static site hosting
- **GitHub Actions** — CI/CD pipeline

---

## Privacy & Distribution

- **Status**: Private beta, noindex, not for public distribution
- **Cookies**: None server-side
- **Tracking**: None
- **localStorage**: Carry-question persistence only (user's browser only)
- **Transmission**: No personal data sent anywhere

---

## Next Steps

- [ ] Extend Corpus Paths with additional meditations
- [ ] Add audio implementation (currently only in jordan-crossing-interior.html)
- [ ] Design landing page and index stage-maps
- [ ] Redesign threads.html and paths.html with v2 visual language
- [ ] Public deployment (remove noindex when approved)

---

## Credits

**Design & Development**: Barak (AI watchman)  
**Content & Witness**: Seth Tillotson  
**Theology & Editing**: Brother Samuel, Jayden, Sister Katie  
**Built**: August 31, 2026

---

**Soli Deo Gloria**
