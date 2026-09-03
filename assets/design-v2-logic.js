/* ═══════════════════════════════════════════════════════════════════
   The Jordan Crossing — Design v2 Logic
   Interactive behaviors for the four movements
   ═════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const RECORD_ID = document.body.dataset.recordId || 'unknown';

  function escapeHtml(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderInlineMarkdown(value) {
    let html = escapeHtml(value);
    const code = [];

    html = html.replace(/`([^`]+)`/g, (_, content) => {
      code.push(`<code>${content}</code>`);
      return `\u0000${code.length - 1}\u0000`;
    });
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, '<em>$1</em>');
    html = html.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<em>$1</em>');

    return html.replace(/\u0000(\d+)\u0000/g, (_, index) => code[Number(index)]);
  }

  function renderRecordMarkdown() {
    const article = document.querySelector('.record-source');
    if (!article || article.dataset.markdownRendered === 'true') return;

    const lines = article.textContent.replace(/\r\n?/g, '\n').split('\n');
    const output = [];
    let paragraph = [];
    let list = null;
    let quote = [];

    const flushParagraph = () => {
      if (paragraph.length) {
        output.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`);
        paragraph = [];
      }
    };
    const flushList = () => {
      if (list) {
        output.push(`<${list.type}>${list.items.map(item => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</${list.type}>`);
        list = null;
      }
    };
    const flushQuote = () => {
      if (quote.length) {
        output.push(`<blockquote><p>${quote.map(renderInlineMarkdown).join('<br>')}</p></blockquote>`);
        quote = [];
      }
    };

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].trim();
      const nextLine = lines[index + 1] ? lines[index + 1].trim() : '';

      if (!line) {
        flushParagraph();
        flushList();
        flushQuote();
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        flushParagraph();
        flushList();
        flushQuote();
        output.push(`<h${heading[1].length}>${renderInlineMarkdown(heading[2])}</h${heading[1].length}>`);
        continue;
      }

      if (/^([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
        flushParagraph();
        flushList();
        flushQuote();
        output.push('<hr>');
        continue;
      }

      if (line.startsWith('|') && nextLine.startsWith('|') && /^\|?[\s:|-]+\|[\s:|-]*\|?$/.test(nextLine)) {
        flushParagraph();
        flushList();
        flushQuote();
        const headers = line.split('|').slice(1, -1).map(cell => `<th>${renderInlineMarkdown(cell.trim())}</th>`).join('');
        const rows = [];
        index += 2;
        while (index < lines.length && lines[index].trim().startsWith('|')) {
          const cells = lines[index].trim().split('|').slice(1, -1)
            .map(cell => `<td>${renderInlineMarkdown(cell.trim())}</td>`).join('');
          rows.push(`<tr>${cells}</tr>`);
          index += 1;
        }
        index -= 1;
        output.push(`<table><thead><tr>${headers}</tr></thead><tbody>${rows.join('')}</tbody></table>`);
        continue;
      }

      const unordered = line.match(/^[-*+]\s+(.+)$/);
      const ordered = line.match(/^\d+\.\s+(.+)$/);
      if (unordered || ordered) {
        flushParagraph();
        flushQuote();
        const type = unordered ? 'ul' : 'ol';
        if (!list || list.type !== type) {
          flushList();
          list = { type, items: [] };
        }
        list.items.push((unordered || ordered)[1]);
        continue;
      }

      if (line.startsWith('>')) {
        flushParagraph();
        flushList();
        quote.push(line.replace(/^>\s?/, ''));
        continue;
      }

      flushList();
      flushQuote();
      paragraph.push(line);
      flushParagraph();
    }

    flushParagraph();
    flushList();
    flushQuote();
    article.innerHTML = output.join('');
    article.dataset.markdownRendered = 'true';
  }

  // ═══════════════════════════════════════════════════════════════════
  // MOVEMENT 1: DISCERN — Response panel toggling
  // ═════════════════════════════════════════════════════════════════════

  function initDiscernChoices() {
    const choices = document.querySelectorAll('.discern-choice');
    
    choices.forEach(btn => {
      btn.addEventListener('click', () => {
        const revealed = btn.dataset.reveals;
        const allChoices = document.querySelectorAll('.discern-choice');
        const allResponses = document.querySelectorAll('.discern-response');

        // Deselect all
        allChoices.forEach(c => c.setAttribute('aria-pressed', 'false'));
        allResponses.forEach(r => r.classList.remove('active'));

        // Select this one
        btn.setAttribute('aria-pressed', 'true');
        const response = document.getElementById(revealed);
        if (response) {
          response.classList.add('active');
          // Scroll to response
          response.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // MOVEMENT 3: RETURN — Button actions and page navigation
  // ═════════════════════════════════════════════════════════════════════

  function initReturnChoices() {
    // Remain here
    const remainBtn = document.querySelector('[data-release-action="remain"]');
    if (remainBtn) {
      remainBtn.addEventListener('click', () => {
        document.querySelector('.record-header').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Leave and return later
    const leaveBtn = document.querySelector('[data-release-action="leave"]');
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => {
        // Optional: close the tab or go to a landing page
        // For now, just scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // AUDIO PLAYER — Phase 3. Renders only if the record's JC_RECORDS entry
  // carries an audioUrl. As of this writing no record has one — the six
  // Cross-Reference passes and the raw meditation corpus are text-only —
  // so this mounts nothing on any current page. Wired ahead of time so a
  // future audioUrl is a one-line data change, not new engineering.
  // ═════════════════════════════════════════════════════════════════════

  function initAudioPlayer() {
    const mount = document.getElementById('audio-player-mount');
    if (!mount || typeof JC_RECORDS === 'undefined' || typeof window.JordanCrossingAudio === 'undefined') return;

    const shortId = (typeof jcShortId === 'function') ? jcShortId(RECORD_ID) : RECORD_ID;
    const record = JC_RECORDS.find(r => r.id === shortId);
    if (!record || !record.audioUrl) return;

    window.JordanCrossingAudio.mountAudioPlayer(mount, {
      audioUrl: record.audioUrl,
      captionsUrl: record.captionsUrl || null,
      title: record.title,
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // MOVEMENT 4: GRAPH NAV — Chronological nav (if records-data available)
  // ═════════════════════════════════════════════════════════════════════

  function initGraphNav() {
    const mount = document.getElementById('graph-nav-mount');
    if (!mount || typeof JC_RECORDS === 'undefined') return;

    const shortId = (typeof jcShortId === 'function') ? jcShortId(RECORD_ID) : RECORD_ID;
    const { prev, next } = jcGetPrevNext(shortId);
    if (!prev && !next) return;

    let html = '<h3 class="graph-nav-heading">Record Sequence</h3>';
    html += '<div class="graph-nav-links">';

    if (prev) {
      const href = jcHrefFromRecord(prev.id);
      html += `
        <a href="${href}" class="nav-link">
          <span class="nav-link-label">← Previous</span>
          <span class="nav-link-title">${prev.title}</span>
          <span class="nav-link-meta">${prev.dateLabel}</span>
        </a>
      `;
    } else {
      html += '<div style="flex-grow:1;"></div>';
    }

    if (next) {
      const href = jcHrefFromRecord(next.id);
      html += `
        <a href="${href}" class="nav-link">
          <span class="nav-link-label">Next →</span>
          <span class="nav-link-title">${next.title}</span>
          <span class="nav-link-meta">${next.dateLabel}</span>
        </a>
      `;
    }

    html += '</div>';
    mount.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════════════
  // THREAD CONNECTIONS — labeled bridges from assets/records-data.js
  // ═════════════════════════════════════════════════════════════════════

  function initThreadConnections() {
    const mount = document.getElementById('threads-mount');
    if (!mount || typeof JC_EDGES === 'undefined') return;

    const shortId = (typeof jcShortId === 'function') ? jcShortId(RECORD_ID) : RECORD_ID;
    const { outgoing, incoming } = jcGetEdgesFor(shortId);
    const edges = [
      ...outgoing.map(e => ({ ...e, direction: 'out' })),
      ...incoming.map(e => ({ ...e, direction: 'in' })),
    ];
    if (!edges.length) return;

    // The mount element itself already carries the .reviewed-threads class
    // (spacing/border styling) in every record page's static template —
    // do NOT wrap this injected content in another element with the same
    // class, or the margin/padding/border-top apply twice (a real,
    // previously-unnoticed double-spacing bug fixed alongside the
    // Corpus Lattice edge rebuild).
    let html = '<h2 class="reviewed-threads-heading">Reviewed thread connections</h2>';
    html += '<ul class="thread-list">';

    edges.forEach(edge => {
      const otherId = edge.direction === 'out' ? edge.to : edge.from;
      const label = edge.direction === 'out'
        ? (EDGE_LABELS[edge.type] || edge.type)
        : (EDGE_LABELS_INCOMING[edge.type] || `is ${edge.type} by`);
      const targetHref = jcHrefFromRecord(otherId);
      const targetTitle = jcTitleFor(otherId);

      html += `
        <li class="thread-item">
          <div class="thread-edge">
            <span class="thread-status thread-status--confirmed">verified</span>
            <span>${label}</span>
            <a href="${targetHref}">${targetTitle}</a>
          </div>
          ${edge.note ? `<p class="thread-note">${edge.note}</p>` : ''}
        </li>
      `;
    });

    html += '</ul>';
    mount.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════════════
  // HUMAN DOORWAYS — theme chips (design doc §7 "the human doorways"):
  // shame, waiting, fear, identity, surrender, obedience, grief,
  // fellowship, work, marriage, money, discipline. Chips link to Threads
  // filtered to that theme, so a reader can leave this record by the
  // life-question it touched rather than only by its reviewed edges.
  // ═════════════════════════════════════════════════════════════════════

  function initDoorwayThemes() {
    const mount = document.getElementById('doorway-themes-mount');
    if (!mount || typeof JC_RECORDS === 'undefined') return;

    const shortId = (typeof jcShortId === 'function') ? jcShortId(RECORD_ID) : RECORD_ID;
    const rec = JC_RECORDS.find(r => r.id === shortId);
    if (!rec || !rec.doorwayThemes || !rec.doorwayThemes.length) return;

    const chips = rec.doorwayThemes.map(theme =>
      `<a class="doorway-theme-chip" href="../threads.html?q=${encodeURIComponent(theme)}">${theme}</a>`
    ).join('');

    mount.innerHTML = `
      <h3 class="doorway-themes-heading">This record touches</h3>
      <div class="doorway-themes-list">${chips}</div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════════
  // RELATED RECORDS — Thematically connected meditations
  // ═════════════════════════════════════════════════════════════════════

  function initRelatedRecords() {
    const mount = document.getElementById('related-records-mount');
    if (!mount || typeof jcGetRelatedRecords === 'undefined') return;

    const related = jcGetRelatedRecords(RECORD_ID, 3);
    if (!related.length) return;

    let html = '<div class="related-records-header">';
    html += '<h3>Related records</h3>';
    html += '</div>';
    html += '<div class="related-records-grid">';

    related.forEach(record => {
      // Use jcHrefFromRecord since we're on a record page
      const href = record.href.replace(/^records\//, '');
      html += `
        <a href="${href}" class="related-record-card">
          <div class="related-record-title">${record.title}</div>
          <div class="related-record-date">${record.dateLabel}</div>
        </a>
      `;
    });

    html += '</div>';
    mount.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════════════
  // NO-INTERPRETATION ROUTE — ?mode=original
  // Removes recommendations, discernment prompts, and thread bridges,
  // leaving title, date, source status, and the original record content
  // itself. Per design doc §6.2.
  // ═════════════════════════════════════════════════════════════════════

  function applyNoInterpretationMode() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') !== 'original') return;

    document.body.classList.add('no-interpretation-mode');

    const toHide = [
      '.discern-section',
      '#related-records-mount',
      '#threads-mount',
      '#doorway-themes-mount',
      '.return-panel',
    ];
    toHide.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => { el.style.display = 'none'; });
    });
    // Hide the movement dividers that separated the now-hidden sections so
    // the original record reads as one continuous, uninterrupted page.
    document.querySelectorAll('.movement-divider').forEach(el => { el.style.display = 'none'; });

    const article = document.querySelector('.record-source');
    if (article) {
      const banner = document.createElement('div');
      banner.className = 'no-interpretation-banner';
      banner.innerHTML = `
        <p><strong>No-interpretation route.</strong> Recommendations, discernment prompts, and thread
        bridges are hidden. What remains is the title, date, source status, and the original record.</p>
        <a href="${window.location.pathname}">Show the full experience →</a>
      `;
      article.parentNode.insertBefore(banner, article);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // RETURNING READER — last-record continuity (design doc §11, "The
  // returning reader": last place read, no account, no surveillance).
  // Records only the current record's id + a timestamp, locally.
  // ═════════════════════════════════════════════════════════════════════

  const LAST_RECORD_KEY = 'jc_last_record';

  function trackLastRecord() {
    if (!RECORD_ID || RECORD_ID === 'unknown') return;
    try {
      localStorage.setItem(LAST_RECORD_KEY, JSON.stringify({ id: RECORD_ID, at: Date.now() }));
    } catch (e) { /* localStorage unavailable — fail silently, no functionality depends on it */ }
  }

  document.addEventListener('DOMContentLoaded', applyNoInterpretationMode);

  // ═══════════════════════════════════════════════════════════════════
  // INIT — Run on DOMContentLoaded
  // ═════════════════════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', () => {
    renderRecordMarkdown();
    initDiscernChoices();
    initReturnChoices();
    initAudioPlayer();
    initGraphNav();
    initRelatedRecords();
    initDoorwayThemes();
    initThreadConnections();
    trackLastRecord();
  });

})();
