/**
 * Jordan Crossing Beta — Record Metadata & Reviewed Thread Edges
 * Single source of truth for prev/next chronology and labeled bridges.
 * 
 * Last updated: 2026-08-31T16:30:00Z (Version 7 cache bust)
 *
 * IMPORTANT — governance:
 * - `order` is pure chronological fact (recorded date/time). Always safe to show.
 * - `edges` are labeled thread bridges. Every edge carries a `status`:
 *     'author-confirmed' — Seth's own stated words say the connection exists.
 *     'editorial'         — a human-reviewed (Barak, the keeper) synthesis,
 *                            dated, offered for consideration, not revelation.
 *     'open'              — a genuine open question, not yet settled.
 *   No edge here claims more confidence than its source documents support.
 *   Sources: living-topology/Stone Tablet VIII -- Seed Register.md,
 *            living-topology/LEDGER.md, memory/2026-08-31.md.
 * - Do not add an edge without updating the `source` field to point at the
 *   sentence that justifies it. If no sentence justifies it, do not add it.
 */

'use strict';

const JC_RECORDS = [
  {
    id: 'signpost',
    order: 1,
    title: "The Signpost, the Secret Place, and the Cup of the Father's Will",
    dateLabel: 'Aug 29, 2026 · 20:23',
    classification: 'Call Reflection',
    seed: 1,
    href: 'records/08-29-signpost.html',
    sourceStatus: 'original',
    summary: "The Samuel Loop answered — the repeated question given to Christ alone, then the secret place. Horizon 2's fruit verified.",
  },
  {
    id: 'man-of-flesh',
    order: 2,
    title: 'The Man of the Flesh Held Me Hostage',
    dateLabel: 'Aug 30, 2026 · 08:01',
    classification: 'Call Reflection',
    seed: 2,
    href: 'records/08-30-man-of-flesh.html',
    sourceStatus: 'original',
    summary: 'Samuel asks for "a proper Bible study." Identity in Christ; the confession of being hard on oneself in the wrong ways.',
  },
  {
    id: 'mirror',
    order: 3,
    title: 'The Man in the Mirror and the Christ Who Stands Between',
    dateLabel: 'Aug 30, 2026 · 08:38',
    classification: 'Call Reflection',
    seed: 3,
    href: 'records/08-30-mirror.html',
    sourceStatus: 'original',
    summary: 'The five weights named, the one root exposed. The study is arranged and set to be recorded.',
  },
  {
    id: 'mirror-gospel',
    order: 4,
    title: 'The Mirror-Gospel and Christ the Teacher Within',
    dateLabel: 'Aug 30, 2026 · 09:09',
    classification: 'Theological Meditation',
    seed: 4,
    href: 'records/08-30-mirror-gospel.html',
    sourceStatus: 'original',
    summary: 'The worship song given to open the coming study, discerned against Isaiah 30:20: the Teacher within is Christ, not the self.',
  },
  {
    id: 'filthy-garments',
    order: 5,
    title: 'The Faced Image, the Filthy Garments, and the Finished Work',
    dateLabel: 'Aug 30, 2026 · 13:39',
    classification: 'Call Reflection',
    seed: 5,
    href: 'records/08-30-filthy-garments.html',
    sourceStatus: 'original',
    summary: 'The first gathering of the circle: three brothers, three countries, planned 75–90 minutes, ran roughly 3.5 hours. Root first, symptoms last.',
  },
  {
    id: 'compass',
    order: 6,
    title: 'The Compass in the Locked Room',
    dateLabel: 'Aug 30, 2026 · 20:04',
    classification: 'Call Reflection',
    seed: 6,
    href: 'records/08-30-compass.html',
    sourceStatus: 'original',
    summary: "Within half an hour of the study's end, the gaze slides back to the storm. Christ, not the counselor, is the compass; the secret place and mutual sight in the Body address blind spots.",
  },
  {
    id: 'wisdom',
    order: 7,
    title: 'When Wisdom Ushers Power: The Loved Heir, the Renewed Mind, and the Word That Gives Witness to Itself',
    dateLabel: 'Aug 30, 2026 · 23:58',
    classification: 'Teaching Reflection',
    seed: 7,
    href: 'records/08-30-wisdom.html',
    sourceStatus: 'original',
    summary: 'Illumination rather than mere endurance; wisdom before power, love before receiving. Bartimaeus receives sight and follows Jesus in the way.',
  },
];

/**
 * Labeled thread edges. `from` and `to` are record ids from JC_RECORDS,
 * or the special id 'jordan-crossing' for the preserved interior record.
 */
const JC_EDGES = [
  {
    from: 'mirror',
    to: 'man-of-flesh',
    type: 'continues',
    status: 'editorial',
    note: 'Same Aug 30 morning call sequence. Record 3 follows directly from the Bible-study request named in record 2.',
    source: 'Stone Tablet VIII Seed Register, seeds 2–3.',
  },
  {
    from: 'mirror-gospel',
    to: 'mirror',
    type: 'continues',
    status: 'editorial',
    note: 'The worship song and Teacher-within discernment prepare the study that record 3 arranged.',
    source: 'Stone Tablet VIII Seed Register, seeds 3–4.',
  },
  {
    from: 'filthy-garments',
    to: 'mirror-gospel',
    type: 'continues',
    status: 'editorial',
    note: 'The study itself — the gathering that seeds 2–4 were preparing toward.',
    source: 'Stone Tablet VIII Seed Register, seeds 4–5.',
  },
  {
    from: 'compass',
    to: 'filthy-garments',
    type: 'continues',
    status: 'author-confirmed',
    note: 'Explicitly recorded as the first aftermath of the circle: within half an hour of the study, the gaze returns to the storm.',
    source: "Stone Tablet VIII Seed Register, seed 6: 'the first aftermath of the circle.'",
  },
  {
    from: 'compass',
    to: 'signpost',
    type: 'answers',
    status: 'editorial',
    note: 'The record completes the Aug 29 signpost by showing continuance under pressure, extending Horizon 3\'s paideia into ordinary, late-night obedience.',
    source: "memory/2026-08-31.md — keeper's daily log: 'It answers the Aug 29 signpost and extends Horizon 3's paideia into ordinary, late-night obedience.'",
  },
  {
    from: 'wisdom',
    to: 'compass',
    type: 'continues',
    status: 'editorial',
    note: "Widens Horizon 3 from mutual correction (Compass) into corporate maturity — the same evening's teaching deepens rather than closes the question.",
    source: "Stone Tablet VIII Seed Register, seed 7: 'widens Horizon 3 from mutual correction into corporate maturity.'",
  },
  {
    from: 'signpost',
    to: 'man-of-flesh',
    type: 'continues',
    status: 'editorial',
    note: 'The Samuel Loop\'s answer (Aug 29 evening) flows into the first light of understanding (Aug 30 morning). The secret place revealed leads to identity in Christ.',
    source: 'Stone Tablet VIII Seed Register, seeds 1–2: sequential arc of the crossing.',
  },
  {
    from: 'man-of-flesh',
    to: 'mirror-gospel',
    type: 'continues',
    status: 'editorial',
    note: 'The request for "a proper Bible study" (record 2) is met by the worship song and Teacher-within discernment that frame record 4.',
    source: 'Stone Tablet VIII Seed Register, seeds 2–4: the study preparation.',
  },
  {
    from: 'jordan-crossing',
    to: 'signpost',
    type: 'open',
    status: 'open',
    note: 'What does the crossing complete? The beta declines to force a conclusion before the corpus completes its own movement.',
    source: 'Editorial framing only — carried as an open question, not settled.',
  },
];

const EDGE_LABELS = {
  continues: 'continues',
  answers: 'answers',
  reopens: 'reopens',
  open: 'open question',
};

const STATUS_LABELS = {
  'author-confirmed': 'author-confirmed',
  'editorial': 'editorial connection',
  'open': 'open',
};

function jcGetRecord(id) {
  return JC_RECORDS.find(r => r.id === id) || null;
}

function jcGetPrevNext(id) {
  const rec = jcGetRecord(id);
  if (!rec) return { prev: null, next: null };
  const prev = JC_RECORDS.find(r => r.order === rec.order - 1) || null;
  const next = JC_RECORDS.find(r => r.order === rec.order + 1) || null;
  return { prev, next };
}

function jcGetEdgesFor(id) {
  const outgoing = JC_EDGES.filter(e => e.from === id);
  const incoming = JC_EDGES.filter(e => e.to === id);
  return { outgoing, incoming };
}

// Href for use from within a page at the beta root (index.html, mystery.html, threads.html).
function jcHrefFor(id) {
  if (id === 'jordan-crossing') return 'jordan-crossing-interior.html';
  const r = jcGetRecord(id);
  return r ? r.href : '#';
}

// Href for use from within a page inside records/ (i.e. another record page).
function jcHrefFromRecord(id) {
  if (id === 'jordan-crossing') return '../jordan-crossing-interior.html';
  const r = jcGetRecord(id);
  if (!r) return '#';
  return r.href.replace(/^records\//, '');
}

function jcTitleFor(id) {
  if (id === 'jordan-crossing') return 'The Jordan Crossing (interior record)';
  const r = jcGetRecord(id);
  return r ? r.title : id;
}

// Map full record ID (e.g., '08-29-signpost') to short ID (e.g., 'signpost')
function jcShortId(id) {
  // If already a short ID, return as-is
  if (JC_RECORDS.some(r => r.id === id)) return id;
  
  // Map full date-prefixed IDs to short IDs
  // E.g., '08-29-signpost' → 'signpost', '08-30-compass' → 'compass'
  const match = id.match(/^\d{2}-\d{2}-(.+)$/);
  return match ? match[1] : id;
}

// Get 2-3 thematically related records based on thread edges
function jcGetRelatedRecords(id, limit = 3) {
  // Normalize the ID from full format (e.g., '08-29-signpost') to short format (e.g., 'signpost')
  const shortId = jcShortId(id);
  
  const edges = jcGetEdgesFor(shortId);
  const relatedIds = new Set();
  
  // Add outgoing connections (what this record continues to, answers, etc.)
  edges.outgoing.forEach(edge => {
    if (edge.to && edge.to !== 'jordan-crossing') {
      relatedIds.add(edge.to);
    }
  });
  
  // Add incoming connections (what leads to this record)
  edges.incoming.forEach(edge => {
    if (edge.from && edge.from !== 'jordan-crossing') {
      relatedIds.add(edge.from);
    }
  });
  
  // Convert to record objects, sorted by order, limited to `limit`
  return Array.from(relatedIds)
    .map(rid => jcGetRecord(rid))
    .filter(r => r !== null)
    .sort((a, b) => a.order - b.order)
    .slice(0, limit);
}

