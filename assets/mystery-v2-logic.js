/* ═══════════════════════════════════════════════════════════════════
   Mystery Mode v2 Logic — Phase 2: pooled across the reviewed corpus
   ═════════════════════════════════════════════════════════════════════

   Each doorway used to route to exactly one hardcoded record out of the
   original 7 Tablet VIII seeds. Following a corpus-wide truth correction,
   the reviewed corpus now holds 404 records — each cross-referenced by
   real, hand-verified links pulled from the meditation's own Cross-
   Reference Appendix (not summary pass documents, whose parsed links were
   found to be partly hallucinated) — and each doorway draws from a *pool*
   — every record whose title or summary matches that doorway's theme
   keywords — and offers one at random. The single curated "anchor" record
   (the original destination) always stays in the pool so behavior never
   regresses to nothing.

   This is a plain keyword match over already-reviewed record metadata
   (title + summary from JC_RECORDS), not a claim about doctrine. It only
   ever pools from records already reviewed (`reviewed !== false`), so the
   pool grows automatically as more records are promoted — no hardcoded
   count here to keep in sync.
   ═════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // Static guidance text + fallback single-record anchor, kept from the
  // original 7-record routing so the page still works even if
  // records-data.js hasn't loaded for some reason.
  const DOORWAY_ROUTING = {
    'beginning-again': { record: '08-29-signpost-secret-place-cup-v2.html', anchorId: '08-29-signpost-secret-place-cup', prompt: 'You entered through beginning again. This record explores the repeated question of whether we can begin again when we have failed before.' },
    'trapped-identity': { record: '08-30-man-flesh-held-me-v2.html', anchorId: '08-30-man-flesh-held-me', prompt: 'You entered through the weight of an old identity. This record names the patterns we repeat and the way the flesh holds us.' },
    'waiting': { record: '08-30-man-mirror-christ-who-v2.html', anchorId: '08-30-man-mirror-christ-who', prompt: 'You entered through waiting. This record approaches what happens when we do not yet know what God is doing.' },
    'cannot-see': { record: '08-30-man-mirror-christ-who-v2.html', anchorId: '08-30-man-mirror-christ-who', prompt: 'You entered through uncertainty about God\'s work. This record teaches what happens when the mirror shifts and we begin to see Him instead of ourselves.' },
    'cost-of-obedience': { record: '08-30-faced-image-filthy-garments-v2.html', anchorId: '08-30-faced-image-filthy-garments', prompt: 'You entered through the fear of what obedience costs. This record holds that fear without minimizing it.' },
    'surrender': { record: '08-30-compass-locked-room-v2.html', anchorId: '08-30-compass-locked-room', prompt: 'You entered through the question of surrender. This record approaches surrender through the loss of self-command.' },
    'searching-jesus': { record: '08-30-man-mirror-christ-who-v2.html', anchorId: '08-30-man-mirror-christ-who', prompt: 'You entered through searching for Jesus. This record teaches that He is the one who searches us first.' },
    'examine-carefully': { record: '08-29-signpost-secret-place-cup-v2.html', anchorId: '08-29-signpost-secret-place-cup', prompt: 'You entered to examine carefully. The records are primary; everything else is secondary. Read without hurrying.' },
    'signpost': { record: '08-29-signpost-secret-place-cup-v2.html', anchorId: '08-29-signpost-secret-place-cup', prompt: 'You chose the full chronology. The records unfold in the order they were recorded; follow the thread connections.' },
    'jordan-crossing': { record: '08-29-signpost-secret-place-cup-v2.html', anchorId: '08-29-signpost-secret-place-cup', prompt: 'You chose a quiet place. Let the record itself, and the secret place it names, work on you.' },
    'compass': { record: '08-30-compass-locked-room-v2.html', anchorId: '08-30-compass-locked-room', prompt: 'You are here, and that is enough. This record is offered for the moment you are in.' }
  };

  // Keyword pools: every record whose title+summary matches one of these
  // regexes becomes a candidate for that doorway, in addition to the
  // anchor above. 'signpost' (full chronology) pools from the ENTIRE
  // reviewed corpus rather than keywords or a thread subset — its whole
  // point (per its own guidance text, "the entire chronology") is breadth
  // across the whole timeline, not a themed or curated slice.
  //
  // Note (Phase 11): the original 7 curated seed records this table once
  // pointed to by their old hand-authored short ids (`signpost`,
  // `man-of-flesh`, `mirror`, `mirror-gospel`, `filthy-garments`,
  // `compass`, `wisdom`) were superseded when the full corpus was rebuilt
  // from `records-2/` — those short ids no longer exist in `JC_RECORDS`
  // (every id is now date-prefix + slugified-title). Anchors above were
  // re-resolved by matching each seed's known title/date against the
  // rebuilt set; one seed ("When Wisdom Ushers Power," Aug 30 · 23:58)
  // could not be found under any title in the verified corpus and is
  // disclosed as a genuine gap (see CHANGELOG.md) — its doorways
  // ('searching-jesus') now anchor to a different, still-thematically-
  // fitting record instead of a dead link.
  const DOORWAY_KEYWORDS = {
    'beginning-again': /\bbegin(ning)?\b|\bagain\b|\bwinnowing\b|\brenewed?\b|\brestart\b|\brest(ore|oration)\b|\breturn(s|ed|ing)?\b/i,
    'trapped-identity': /\bidentity\b|\bflesh\b|\began\b|\bego\b|\bcaptiv\w*|\bbondage\b|\bhostage\b|\bmirror\b|\bold (man|face)/i,
    'waiting': /\bwait(ing|s)?\b|\bfourth watch\b|\brampart\b|\bpatien\w*|\bqavah\b|\bstill\b|\bdelay\b/i,
    'cannot-see': /\bcannot see\b|\bblind\b|\bdark(ness)?\b|\bmystery\b|\bhidden\b|\bveil(ed)?\b|\bfog\b|\bconfusion\b/i,
    'cost-of-obedience': /\bobedien\w*|\bcost\b|\bfellowship\b|\bkoinonia\b|\bsacrifice\b|\bdebt\b|\bprice\b|\bweight\b/i,
    'surrender': /\bsurrender(s|ed)?\b|\bkenosis\b|\bemptied\b|\byield(s|ed|ing)?\b|\bbreaking point\b|\bself-sufficien\w*/i,
    'searching-jesus': /\bjesus\b|\bchrist\b|\bgospel\b|\bteacher\b|\bsavior\b|\bredee?m\w*|\bwisdom\b/i,
    'examine-carefully': /\bexamine\b|\bdiscern\w*|\bscripture\b|\bdoctrine\b|\btest(s|ed|ing)?\b|\bcareful\w*/i,
    'jordan-crossing': /\bsecret place\b|\bquiet(ness)?\b|\bstill(ness)?\b|\bsilence\b|\brest\b|\bsabbath\b/i,
    'compass': /\bcompass\b|\bcarrying\b|\blocked room\b|\bwitness\b|\bhere\b/i,
  };

  // No artificial cap: pool sizes should honestly report the real number of
  // reviewed records matching a doorway's theme. An earlier version capped
  // every pool at 10 regardless of true match count — that made the
  // "drawn from a reviewed pool of N records" guidance text misleading once
  // the corpus grew past a few hundred verified records (real counts run
  // 20-90+ per doorway; see plan.md Phase 13).

  function buildKeywordPool(doorwayId, anchorId) {
    if (typeof JC_RECORDS === 'undefined') return anchorId ? [anchorId] : [];
    const re = DOORWAY_KEYWORDS[doorwayId];
    const pool = [];
    if (re) {
      // Only pool from reviewed/threaded records — the guidance text below
      // says "drawn from a reviewed pool," and that claim must stay true
      // now that JC_RECORDS also contains mirrored-but-unreviewed records
      // (see assets/records-data.js's header, Phase 5).
      JC_RECORDS.forEach(rec => {
        if (rec.reviewed === false) return;
        // Phase 14: widen the matching haystack with the record's own
        // appendix-derived doctrinal theme + lexicon terms/glosses, so a
        // record whose title/summary don't literally use a doorway's
        // keywords (but whose own author-named doctrinal theme or lexicon
        // joint genuinely does) is still found. This does NOT invent any
        // new doorway<->theme mapping — the same already-verified keyword
        // regexes below are simply given more of the record's own real
        // text to test against.
        const lexiconText = (rec.lexiconJoints || []).map(l => `${l.term} ${l.gloss || ''}`).join(' ');
        const haystack = `${rec.title} ${rec.summary || ''} ${rec.doctrinalThemesCarried || ''} ${lexiconText}`;
        if (re.test(haystack)) pool.push(rec.id);
      });
    }
    if (anchorId && !pool.includes(anchorId)) pool.unshift(anchorId);
    return pool;
  }

  // "Full chronology" pools from every reviewed record in the corpus, not a
  // themed keyword subset or a curated thread subset — it is explicitly the
  // "walk the whole timeline" doorway (see its own prompt text below).
  function buildFullCorpusPool() {
    if (typeof JC_RECORDS === 'undefined') return [];
    return JC_RECORDS.filter(rec => rec.reviewed !== false).map(rec => rec.id);
  }

  // Build every doorway's candidate pool once, at load time.
  const DOORWAY_POOLS = {};
  Object.keys(DOORWAY_ROUTING).forEach(doorwayId => {
    if (doorwayId === 'signpost') {
      const pool = buildFullCorpusPool();
      DOORWAY_POOLS[doorwayId] = pool.length ? pool : [DOORWAY_ROUTING[doorwayId].anchorId];
    } else {
      DOORWAY_POOLS[doorwayId] = buildKeywordPool(doorwayId, DOORWAY_ROUTING[doorwayId].anchorId);
    }
  });

  function hrefForRecordId(id) {
    if (typeof jcGetRecord === 'function') {
      const rec = jcGetRecord(id);
      if (rec) return rec.href; // already 'records/<file>.html'
    }
    return null;
  }

  function pickFromPool(doorwayId) {
    const routing = DOORWAY_ROUTING[doorwayId];
    if (!routing) return null;
    const pool = DOORWAY_POOLS[doorwayId];
    if (!pool || !pool.length) {
      return { record: routing.record, poolSize: 1 };
    }
    const chosenId = pool[Math.floor(Math.random() * pool.length)];
    const href = hrefForRecordId(chosenId);
    return { record: href ? href.replace(/^records\//, '') : routing.record, poolSize: pool.length };
  }

  function initDoorways() {
    const btns = document.querySelectorAll('.doorway-btn');
    const continueBtn = document.getElementById('mystery-continue');
    const noInterpLink = document.getElementById('mystery-no-interpretation');
    const guidanceDiv = document.getElementById('selected-doorway');
    let selectedDoorway = null;
    let selectedRecord = null;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Deselect all
        btns.forEach(b => b.setAttribute('aria-pressed', 'false'));
        guidanceDiv.classList.remove('active');

        // Select this one
        btn.setAttribute('aria-pressed', 'true');
        selectedDoorway = btn.dataset.doorway;

        // Draw one record from this doorway's reviewed pool.
        const picked = pickFromPool(selectedDoorway);
        selectedRecord = picked ? picked.record : null;

        // Show guidance
        const routing = DOORWAY_ROUTING[selectedDoorway];
        if (routing) {
          const poolNote = picked && picked.poolSize > 1
            ? ` <span class="pool-note">(drawn from a reviewed pool of ${picked.poolSize} records on this theme)</span>`
            : '';
          guidanceDiv.innerHTML = `<p class="guidance-text">${routing.prompt}${poolNote}</p>`;
          guidanceDiv.classList.add('active');
          guidanceDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Enable continue button
        continueBtn.disabled = false;
        continueBtn.setAttribute('aria-disabled', 'false');

        // Point the no-interpretation route at the same record this doorway
        // leads to, so it shows the original of the record actually chosen —
        // not an unrelated placeholder.
        if (noInterpLink && selectedRecord) {
          noInterpLink.href = `records/${selectedRecord}?mode=original`;
          noInterpLink.removeAttribute('aria-disabled');
        }
      });
    });

    continueBtn.addEventListener('click', () => {
      if (selectedDoorway && selectedRecord) {
        window.location.href = `records/${selectedRecord}`;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initDoorways);
})();
