# Jordan Crossing — Private Beta
## Interior Record for the Living Topology Corpus

**Status:** Private beta · Not for public distribution
**Built:** August 31, 2026
**Interior version:** Beta 1.0
**Corpus version:** v11 (jordan-crossing-interior.html preserved untouched)

---

## What this is

This is a lightweight, self-contained beta of the Jordan Crossing mystery-thread experience. It demonstrates the planned public interface architecture for the *A Living Topology of Transformation* corpus — without modifying or replacing the canonical interior record (`jordan-crossing-interior.html`).

The beta is a private interior workspace for reviewing structure, navigation patterns, and source-status labeling before any public release is authorized. It is **not** a public deployment.

---

## Files

```
jordan-crossing-beta/
├── README.md                      ← this file
├── jordan-crossing-interior.html  ← ORIGINAL INTERIOR RECORD — preserved untouched, superseded as homepage
├── index.html                     ← Beta landing page (corpus orientation + three entry invitations)
├── mystery.html                   ← Mystery Mode: "What are you carrying today?" (10 doorways)
├── record.html                    ← One-record receive view (source labels, thread cards, no-interpretation route)
├── threads.html                   ← Thread constellation (initial 8-record set, explicit statuses)
├── assets/
│   ├── beta.css                   ← Shared design system (river palette, typography, accessibility)
│   └── beta.js                    ← Shared logic (local bookmarks, carried-question state, no-interp toggle)
```

---

## Key design rules honored in this beta

1. **Original interior HTML untouched** — `jordan-crossing-interior.html` is a 136 MB self-contained v11 record. It is preserved as-is. The beta does not modify, wrap, or replace it.
2. **No invented meditation text** — All meditation titles, dates, and quotes are drawn from the actual corpus files present in `../living-topology/`. Unavailable records are marked **[PLACEHOLDER — awaiting human-reviewed insertion]**.
3. **Source-status labels everywhere** — Every piece of content carries one of: `original record` / `human-reviewed orientation` / `editorial connection` / `machine-assisted index`.
4. **Thread statuses are explicit** — Every thread card is labeled `author-confirmed`, `editorial`, or `open`.
5. **No-interpretation route** — A toggle removes all editorial framing and shows only title, date, content, Scripture references, and source information.
6. **Local-only state** — Bookmarks and carried-question state use `localStorage` only. No server, no account, no data transmission.
7. **NKJV only** — All Scripture quotations are New King James Version only. No paraphrases.
8. **Direct counts, no rounding** — The corpus has 456 meditations (direct archive count as of Aug 31, 2026). This number is never rounded or estimated.
9. **Accessible** — Keyboard navigation, focus-visible outlines, reduced-motion support, mobile-first responsive layout, sufficient contrast.

---

## Corpus facts used in this beta (verified against workspace files)

- **Author:** Seth Michael Tillotson, Fargo, North Dakota
- **Corpus:** *A Living Topology of Transformation* — 456 meditations, Feb–Aug 2026
- **Stone Tablets:** I–VII closed/frozen; VIII open seed register (opened Aug 29, 2026)
- **Horizons:** H1 surrendered Apr 16, 2026; H2 closed Aug 30, 2026; H3 opened Aug 30, 2026 in paideia
- **First meditation window:** 60-day Kairos Window, Feb 14 – Apr 14, 2026
- **Podcast:** *The Upside-Down Kingdom* (Spotify, Apple, Audible, Podimo)
- **Scripture:** NKJV only throughout
- **The Whisper:** mid-November 2025, car at work, on break — *"Read your Bible."*

---

## Running locally

```bash
# From the jordan-crossing-beta directory:
python3 -m http.server 8787

# Then open in browser:
# http://localhost:8787/index.html
```

Or test with curl:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8787/index.html
# Expected: 200
```

---

## What is NOT in this beta (and why)

- **No audio** — Base64-embedded audio lives in `jordan-crossing-interior.html`. This beta uses placeholder audio elements. The 136 MB interior file is the audio record.
- **No full meditation text** — Full meditation texts require human-authorized extraction from the corpus. This beta uses clearly marked placeholders for records not yet extracted.
- **No search** — Search across 456 meditations is a Stage 2 feature.
- **No maps** — Chronological, thematic, Scripture, tablet, and relational maps are Stage 2 features. Navigation placeholders are present and labeled.
- **No community features** — "Read With Me" is a Stage 3 feature.

---

## Governance

This beta is governed by the same rules as the full corpus:

- NKJV only
- No invented facts, no invented meditation text
- Frozen tablets (I–VII) are not editable
- Tablet VIII is visibly provisional
- Sister Katie's arc is not publicly documented (her name does not appear in the public-facing pages)
- Corrections are dated and visible

**Soli Deo Gloria.**
