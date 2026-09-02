/* ═══════════════════════════════════════════════════════════════════
   Mystery Mode v2 Logic — Phase 2: pooled across the reviewed corpus
   ═════════════════════════════════════════════════════════════════════

   Each doorway used to route to exactly one hardcoded record out of the
   original 7 Tablet VIII seeds. Now that the reviewed corpus holds 201
   records (grown across eight Cross-Reference passes), each doorway draws
   from a *pool* — every record whose title or summary matches that
   doorway's theme keywords — and offers one at random. The single curated
   "anchor" record (the original destination) always stays in the pool so
   behavior never regresses to nothing.

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
    'beginning-again': { record: '08-29-signpost-v2.html', anchorId: 'signpost', prompt: 'You entered through beginning again. This record explores the repeated question of whether we can begin again when we have failed before.' },
    'trapped-identity': { record: '08-30-man-of-flesh-v2.html', anchorId: 'man-of-flesh', prompt: 'You entered through the weight of an old identity. This record names the patterns we repeat and the way the flesh holds us.' },
    'waiting': { record: '08-30-mirror-v2.html', anchorId: 'mirror', prompt: 'You entered through waiting. This record approaches what happens when we do not yet know what God is doing.' },
    'cannot-see': { record: '08-30-mirror-gospel-v2.html', anchorId: 'mirror-gospel', prompt: 'You entered through uncertainty about God\'s work. This record teaches what happens when the mirror shifts and we begin to see Him instead of ourselves.' },
    'cost-of-obedience': { record: '08-30-filthy-garments-v2.html', anchorId: 'filthy-garments', prompt: 'You entered through the fear of what obedience costs. This record holds that fear without minimizing it.' },
    'surrender': { record: '08-30-compass-v2.html', anchorId: 'compass', prompt: 'You entered through the question of surrender. This record approaches surrender through the loss of self-command.' },
    'searching-jesus': { record: '08-30-wisdom-v2.html', anchorId: 'wisdom', prompt: 'You entered through searching for Jesus. This record teaches that He is the one who searches us first.' },
    'examine-carefully': { record: '08-29-signpost-v2.html', anchorId: 'signpost', prompt: 'You entered to examine carefully. The records are primary; everything else is secondary. Read without hurrying.' },
    'signpost': { record: '08-29-signpost-v2.html', anchorId: 'signpost', prompt: 'You chose the full chronology. The records unfold in the order they were recorded; follow the thread connections.' },
    'jordan-crossing': { record: 'jordan-crossing-interior.html', anchorId: null, prompt: 'You chose a quiet place. The full interior awaits—read, listen, let the silence work on you.' },
    'compass': { record: '08-30-compass-v2.html', anchorId: 'compass', prompt: 'You are here, and that is enough. This record is offered for the moment you are in.' }
  };

  // Keyword pools: every record whose title+summary matches one of these
  // regexes becomes a candidate for that doorway, in addition to the
  // anchor above. 'signpost' (full chronology) pools from the four named
  // threads instead of keywords, since its whole point is breadth across
  // the timeline rather than a single theme. 'jordan-crossing' is left
  // unpooled — it is a single preserved interior page, not a v2 record.
  const DOORWAY_KEYWORDS = {
    'beginning-again': /\bbegin(ning)?\b|\bagain\b|\bwinnowing\b|\brenewed?\b|\brestart\b|\brest(ore|oration)\b|\breturn(s|ed|ing)?\b/i,
    'trapped-identity': /\bidentity\b|\bflesh\b|\began\b|\bego\b|\bcaptiv\w*|\bbondage\b|\bhostage\b|\bmirror\b|\bold (man|face)/i,
    'waiting': /\bwait(ing|s)?\b|\bfourth watch\b|\brampart\b|\bpatien\w*|\bqavah\b|\bstill\b|\bdelay\b/i,
    'cannot-see': /\bcannot see\b|\bblind\b|\bdark(ness)?\b|\bmystery\b|\bhidden\b|\bveil(ed)?\b|\bfog\b|\bconfusion\b/i,
    'cost-of-obedience': /\bobedien\w*|\bcost\b|\bfellowship\b|\bkoinonia\b|\bsacrifice\b|\bdebt\b|\bprice\b|\bweight\b/i,
    'surrender': /\bsurrender(s|ed)?\b|\bkenosis\b|\bemptied\b|\byield(s|ed|ing)?\b|\bbreaking point\b|\bself-sufficien\w*/i,
    'searching-jesus': /\bjesus\b|\bchrist\b|\bgospel\b|\bteacher\b|\bsavior\b|\bredee?m\w*|\bwisdom\b/i,
    'examine-carefully': /\bexamine\b|\bdiscern\w*|\bscripture\b|\bdoctrine\b|\btest(s|ed|ing)?\b|\bcareful\w*/i,
    'compass': /\bcompass\b|\bcarrying\b|\blocked room\b|\bwitness\b|\bhere\b/i,
  };

  // Cap the size of any pool so unrelated keyword hits don't drown the
  // more thematically central records — the anchor is always included.
  const MAX_POOL_SIZE = 10;

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
        const haystack = `${rec.title} ${rec.summary || ''}`;
        if (re.test(haystack)) pool.push(rec.id);
      });
    }
    if (anchorId && !pool.includes(anchorId)) pool.unshift(anchorId);
    return pool.slice(0, MAX_POOL_SIZE);
  }

  function buildThreadPool() {
    if (typeof JC_THREADS === 'undefined') return [];
    const ids = new Set();
    JC_THREADS.forEach(t => t.sequence.forEach(id => ids.add(id)));
    return Array.from(ids);
  }

  // Build every doorway's candidate pool once, at load time.
  const DOORWAY_POOLS = {};
  Object.keys(DOORWAY_ROUTING).forEach(doorwayId => {
    if (doorwayId === 'jordan-crossing') {
      DOORWAY_POOLS[doorwayId] = null; // unpooled — single interior page
    } else if (doorwayId === 'signpost') {
      const pool = buildThreadPool();
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
    if (doorwayId === 'jordan-crossing') {
      return { record: routing.record, poolSize: 1 };
    }
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
