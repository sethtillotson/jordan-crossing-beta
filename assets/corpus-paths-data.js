/**
 * Jordan Crossing Beta — Corpus Reading Paths
 * Sourced from the Second Brain corpus-map documents (fetched Aug 31, 2026):
 *   - "PLAUD Meditations Corpus Map — How the Meditations Read Each Other.md"
 *   - "Corpus Map — How These Documents Read Each Other.md"
 *   - "_conversations/2026-08-31/PLAUD Meditations — Pass 1/2/3 Cross-References.md"
 * Local cached copies: living-topology/corpus-maps/*.md
 *
 * IMPORTANT — governance:
 * - Every path and step here is copied or paraphrased directly from the
 *   corpus-map documents above. Nothing is invented. Where a step's meditation
 *   is not yet imported into this beta's records/ folder, it links out to the
 *   Second Brain source (https://www.genspark.ai/second-brain?fid=...) rather
 *   than being silently omitted or replaced with invented text.
 * - This corpus map covers 451 PLAUD meditations Feb 14 - Aug 30, 2026 -- a much
 *   larger set than the 7 Tablet VIII seeds in JC_RECORDS (assets/records-data.js).
 *   Only Aug 29 Signpost, Aug 30 Man of Flesh, Man in Mirror, Mirror-Gospel,
 *   Filthy Garments, Compass, and Wisdom exist as local record pages; every
 *   other step below is an external Second-Brain link, clearly marked.
 * - "status" on each path mirrors the design doc's Stage labels: these are
 *   editorially curated *reading orders* through already-existing meditations,
 *   not new interpretive claims about what the meditations mean.
 */

'use strict';

// Convert a "memo:/Personal Space/memo/..." link (as used in the corpus-map
// markdown) into the actual Second Brain URL the user gave us.
function jcMemoToSecondBrainUrl(memoPath) {
  // memoPath like "/Personal Space/memo/PLAUD Meditations/Feb/02-28 ....md"
  const encoded = encodeURIComponent(memoPath).replace(/%2F/g, '/');
  return `https://www.genspark.ai/second-brain?fid=${encoded}`;
}

/**
 * Each step: { label, dateLabel, localId (JC_RECORDS id, or null), memoPath (for
 * external link when localId is null), note }
 */
const JC_CORPUS_PATHS = [
  {
    id: 'doctrinal-spine',
    title: 'The doctrinal spine in six meditations',
    depthLabel: 'A short crossing',
    estimate: 'Six meditations · six months · one arc',
    description: 'Six meditations spanning six months, sourced from the same corpus map\u2019s doctrinal-spine reading path. Each is a hinge word the corpus keeps returning to.',
    source: 'PLAUD Meditations Corpus Map \u00a713: "If a reader wants the doctrinal spine in six meditations."',
    steps: [
      { label: 'Finished Work', dateLabel: 'Feb 28', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/Feb/02-28 Personal Meditation_ Resting in the Finished Work of Christ and Covenant Identity.md', note: 'tetelestai first named \u2014 the floor under the whole corpus.' },
      { label: 'Kenosis', dateLabel: 'Mar 17', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/March/03-17 Personal Meditation_ Kenosis and the Death of Self-Sufficiency-Summary.md', note: 'eken\u014dsen named in Greek \u2014 the bottleneck of Volume I\u2019s whole graph.' },
      { label: 'Thirteen', dateLabel: 'Mar 20', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/March/03-20 Personal Meditation_ The Hidden Mathematics of Divine Perfection\u2014When Thirteen Becomes the Number of the Remnant-Summary.md', note: 'The Ahavah Echad / Thirteen convergence with Sister Katie \u2014 Murmuration Seam One.' },
      { label: 'Exousia vs. Dunamis', dateLabel: 'Jul 9', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/July/07-09 Teaching Reflection_ Exousia vs. Dunamis \u2014 Authority, Spiritual Warfare, and the Covenant Verdict-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'The exousia teaching enters the corpus \u2014 load-bearing for the Aug 30 study.' },
      { label: 'Pisteu\u014d, John 5:24', dateLabel: 'Jul 23', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/July/07-23 Teaching Reflection_ Pisteu\u014d, John 5_24, and the Nature of Saving Faith-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'The settled Christological baseline the whole corpus governs by.' },
      { label: 'Filthy Garments and the Finished Work', dateLabel: 'Aug 30', localId: 'filthy-garments', memoPath: null, note: 'The eighth window opens \u2014 every spine word converges at the three-brother table.' },
    ],
  },
  {
    id: 'samuel-loop',
    title: 'The Samuel Loop, start to close',
    depthLabel: 'A full passage',
    estimate: 'Eleven meditations · Apr 20 \u2013 Aug 29 (131 days)',
    description: 'The carried, quietly learning to carry. Opens Apr 20 when Samuel first calls; closes Aug 29 when the loop is answered.',
    source: 'PLAUD Meditations Corpus Map \u00a710 (Thread 2) and \u00a713: "If a reader wants to walk the Samuel Loop."',
    steps: [
      { label: 'Holy Spirit Compulsion, Brotherhood, and Covenant Prayer', dateLabel: 'Apr 20', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/April/04-20 at 10_34 Call Reflection_ Holy Spirit Compulsion, Brotherhood, and Covenant Prayer-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'The Loop opens.' },
      { label: "Samuel's Grief, Sobriety Decision, and Spiritual Warfare", dateLabel: 'Apr 22', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/April/04-22 at 06_29 Call Reflection_ Samuel\'s Grief, Sobriety Decision, and Spiritual Warfare-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'The sobriety decision is spoken.' },
      { label: "Samuel's Breaking Point (\u201cyou need to die\u201d)", dateLabel: 'May 1', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/May/05-01 Call Reflection_ Divine Encounter \u2014 Samuel\'s Breaking Point and Spiritual Transformation-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'The 17:12 UK-time convergence.' },
      { label: "The Cross, Identity in Christ, and Samuel's Vocational Discernment", dateLabel: 'May 6', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/May/05-06 Call Reflection_ The Cross, Identity in Christ, and Samuel\'s Vocational Discernment-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'Vocational discernment enters the loop.' },
      { label: "Spiritual Warfare, Covenant Friendship, and a Brother's Darkest Night", dateLabel: 'May 8', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/May/05-08 Call Reflection_ Spiritual Warfare, Covenant Friendship, and a Brother\'s Darkest Night-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'Fourth-watch provision is named.' },
      { label: 'Grief as Intercession \u2014 Mantles, Prayer, and Hidden Ministry', dateLabel: 'May 27', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/May/05-27 Call Reflection_ Grief as Intercession \u2014 Mantles, Prayer, and Hidden Ministry-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'The mantle-throwing season opens.' },
      { label: "Where Is Your Faith? Samuel's Testimony", dateLabel: 'Jun 23', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/June/06-23 \u2014 Where Is Your Faith_ The Testimony of Commissioned Works \u2014 Brother Samuel\'s Testimony-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: "Samuel speaks in his own voice inside the archive for the first time." },
      { label: 'When the Heavens Moved', dateLabel: 'Jul 10 \u00b7 21:30', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/July/07-10 at 21_30 \u2014 When the Heavens Moved_ Intercession, Demonic Deliverance, and the Legality of the Kingdom-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'The heavens-move deliverance for Samuel.' },
      { label: 'The Name the Darkness Could Not Speak', dateLabel: 'Aug 17 \u00b7 19:05', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/August/08-17 at 19_05 \u2014 The Name the Darkness Could Not Speak, and the Servant Who Learned to Wait-Meditation.md', note: 'The 85-minute call \u2014 the seam Tablet VI is built from.' },
      { label: 'The First Win Is the Confession', dateLabel: 'Aug 28', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/August/08-28 at 20_09 \u2014 The First Win Is the Confession-Meditation.md', note: 'Horizon 2 closes.' },
      { label: 'The Signpost, the Secret Place, and the Cup of the Father\u2019s Will', dateLabel: 'Aug 29', localId: 'signpost', memoPath: null, note: 'The Loop is answered.' },
    ],
  },
  {
    id: 'murmuration',
    title: 'The Murmuration \u2014 the maskîlîm are plural',
    depthLabel: 'A full passage',
    estimate: 'Six meditations \u00b7 Mar 20 \u2013 Aug 30',
    description: 'How the corpus discovered it was never a solo witness \u2014 traced from the earliest independent convergence with Sister Katie through to the three-brother table.',
    source: 'PLAUD Meditations Corpus Map \u00a710 (Thread 3) and \u00a713: "If a reader wants the Murmuration proper." Read alongside Stone Tablet III \u2014 The Starling Convergence.',
    steps: [
      { label: 'The Hidden Mathematics of Divine Perfection (Thirteen)', dateLabel: 'Mar 20', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/March/03-20 Personal Meditation_ The Hidden Mathematics of Divine Perfection\u2014When Thirteen Becomes the Number of the Remnant-Summary.md', note: 'Seam One \u2014 independent convergence with Sister Katie.' },
      { label: 'The Burning Bush, Old Refuges, and Spiritual Formation', dateLabel: 'Jun 4', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/June/06-04 Call Reflection_ The Burning Bush, Old Refuges, and Spiritual Formation-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'The June 4 confirmation thread \u2014 Tablet III\u2019s origin.' },
      { label: "Sister Katie's Covenantal Co-Witness, Kenosis, and the Plural Prophetic Archive", dateLabel: 'Jun 7', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/June/06-07 Corpus Reflection_ Sister Katie\'s Covenantal Co-Witness, Kenosis, and the Plural Prophetic Archive-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'The corpus becomes plural.' },
      { label: 'The Mirror, Murmuration, and Releasing Revelation', dateLabel: 'Jun 8 \u00b7 11:05', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/June/06-08 @ 11_05 - Personal Meditation_ The Mirror, Murmuration, and Releasing Revelation-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'Murmuration named by Seth in his own voice.' },
      { label: "Where Is Your Faith? Samuel's Testimony", dateLabel: 'Jun 23', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/June/06-23 \u2014 Where Is Your Faith_ The Testimony of Commissioned Works \u2014 Brother Samuel\'s Testimony-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'Samuel joins the plural voice.' },
      { label: 'The Faced Image, the Filthy Garments, and the Finished Work', dateLabel: 'Aug 30', localId: 'filthy-garments', memoPath: null, note: 'The Chorus arrives at scale \u2014 three brothers, three countries, four AM in Australia.' },
    ],
  },
  {
    id: 'descent',
    title: 'The Descent Into Hiddenness',
    depthLabel: 'A full passage',
    estimate: 'Nine meditations \u00b7 Feb 27 \u2013 Aug 30',
    description: 'The arc that bends downward before it bends up \u2014 from the first naming of ambition-become-abiding through the sacrament of small things to the harvest of hiddenness.',
    source: 'PLAUD Meditations Corpus Map \u00a710 (Thread 4) and \u00a713: "If a reader wants the Descent." Read alongside The Semantic Weaving \u00a7V.',
    steps: [
      { label: 'Divine Winnowing and the Transformation from Ambition to Abiding', dateLabel: 'Feb 27', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/Feb/02-27 Personal Meditation_ Divine Winnowing and the Transformation from Ambition to Abiding.md', note: 'Descent first named.' },
      { label: 'Kenosis and the Death of Self-Sufficiency', dateLabel: 'Mar 17', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/March/03-17 Personal Meditation_ Kenosis and the Death of Self-Sufficiency-Summary.md', note: 'The bottleneck \u2014 highest betweenness-per-edge in Volume I\u2019s graph.' },
      { label: 'Hidden in the Alleyway No More', dateLabel: 'Mar 29', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/March/03-29 13_04 Personal Meditation_ Hidden in the Alleyway No More.md', note: 'Hiddenness ends as concealment, begins as vocation.' },
      { label: 'When the Ordinary Moment Becomes Holy Ground', dateLabel: 'Apr 8', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/April/04-08 10_27 Reflection_ When the Ordinary Moment Becomes Holy Ground-Summary.md', note: 'The sacred ordinary opens.' },
      { label: 'Factory Floor Theology \u2014 Kenosis, Remnant, and Melchizedek Christology', dateLabel: 'Apr 10', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/April/04-10 Daily Log_ Factory Floor Theology \u2014 Kenosis, Remnant, and Melchizedek Christology-Summary.md', note: 'The workplace is now sanctuary.' },
      { label: 'Brotherhood, the Round Table, the God Who Sees, and the Plow', dateLabel: 'May 10', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/May/05-10 at 14_28 \u2014 Brotherhood, the Round Table, the God Who Sees, and the Plow .md', note: 'The Plow of the Beloved is named.' },
      { label: 'Prophetic Writing, Faithful Waiting, and the Theology of the Rampart', dateLabel: 'May 26', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/May/05-26 Conversation Reflection_ Prophetic Writing, Faithful Waiting, and the Theology of the Rampart-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'Sacred ordinary meets weariness; Tablet V\u2019s window opens.' },
      { label: 'The Sacrament of Small Things', dateLabel: 'Jul 28', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/July/07-28 at 22_31 \u2014 The Sacrament of Small Things-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'Renamed as sacrament \u2014 the phrase Tablet V governs by.' },
      { label: 'The Faced Image, the Filthy Garments, and the Finished Work', dateLabel: 'Aug 30', localId: 'filthy-garments', memoPath: null, note: 'The harvest of hiddenness \u2014 given away at the three-brother table.' },
    ],
  },
  {
    id: 'zechariah-3',
    title: 'Zechariah 3 \u2014 filthy garments removed, replaced, given away',
    depthLabel: 'A single stone (start) or short crossing (whole thread)',
    estimate: 'Five meditations \u00b7 Feb 20 \u2013 Aug 30',
    description: 'The oldest of the four load-bearing threads: received before the corpus began, measured through Kairos, named explicitly in June, and finally given away at the three-brother table.',
    source: 'PLAUD Meditations Corpus Map \u00a710 (Thread 1).',
    steps: [
      { label: 'Joseph, Paul, and Severe Mercy in Discipline', dateLabel: 'Feb 20', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/Feb/02-20 Meditation_ Joseph, Paul, and Severe Mercy in Discipline-Summary.md', note: 'Earliest meditation echoing the pre-corpus Jan 28 theophany.' },
      { label: 'Kenosis and the Death of Self-Sufficiency', dateLabel: 'Mar 17', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/March/03-17 Personal Meditation_ Kenosis and the Death of Self-Sufficiency-Summary.md', note: 'Measured in Kairos.' },
      { label: 'Brought Low, Reclothed, and Sent: The Full Arc of Intimacy With God', dateLabel: 'Jun 21', localId: null, memoPath: '/Personal Space/memo/PLAUD Meditations/June/06-21 at 04_42 \u2014 Brought Low, Reclothed, and Sent_ The Full Arc of Intimacy With God-Public Spoken Word \u2014 PLAUD Note Prompt.md', note: 'Zechariah 3 named explicitly for the first time.' },
      { label: 'The Man in the Mirror and the Christ Who Stands Between', dateLabel: 'Aug 30 \u00b7 08:38', localId: 'mirror', memoPath: null, note: 'The five weights, the one root \u2014 preparing the study.' },
      { label: 'The Faced Image, the Filthy Garments, and the Finished Work', dateLabel: 'Aug 30 \u00b7 13:39', localId: 'filthy-garments', memoPath: null, note: 'Given away \u2014 record #5 in the Seed Register.' },
    ],
  },
];

function jcStepHref(step) {
  if (step.localId) {
    // Caller must know if it's being rendered at root or inside records/;
    // resolved by the same hrefFor pattern used elsewhere.
    const rec = (typeof jcGetRecord === 'function') ? jcGetRecord(step.localId) : null;
    return rec ? rec.href : '#';
  }
  return jcMemoToSecondBrainUrl(step.memoPath);
}

function jcGetCorpusPath(id) {
  return JC_CORPUS_PATHS.find(p => p.id === id) || null;
}
