/* ═══════════════════════════════════════════════════════════════════
   The Jordan Crossing — Design v2 Logic
   Interactive behaviors for the four movements
   ═════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const CARRY_STORAGE_KEY = 'jc_carry_question';
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
  // MOVEMENT 2: CARRY — Question persistence and UI toggling
  // ═════════════════════════════════════════════════════════════════════

  function getCarryState() {
    const stored = localStorage.getItem(CARRY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { question: null, records: [] };
  }

  function saveCarryState(question) {
    const state = getCarryState();
    state.question = question;
    if (!state.records.includes(RECORD_ID)) {
      state.records.push(RECORD_ID);
    }
    localStorage.setItem(CARRY_STORAGE_KEY, JSON.stringify(state));
  }

  function clearCarryState() {
    localStorage.removeItem(CARRY_STORAGE_KEY);
  }

  function initCarryQuestion() {
    const carryBtn = document.getElementById('carry-btn');
    const writeOwnBtn = document.getElementById('write-own-btn');
    const writePanel = document.getElementById('carry-write-panel');
    const textarea = document.getElementById('carry-textarea');
    const saveBtn = document.getElementById('carry-save-btn');
    const cancelBtn = document.getElementById('carry-cancel-btn');
    const status = document.getElementById('carry-status');
    const statusText = document.getElementById('carry-status-text');
    const clearBtn = document.getElementById('carry-clear-btn');

    // Only initialize if we have the required carry elements (not on all pages)
    if (!carryBtn && !writeOwnBtn && !status) {
      return;
    }

    const state = getCarryState();

    // Update initial UI
    updateCarryUI();

    // "Carry this question forward" - use default
    if (carryBtn) {
      carryBtn.addEventListener('click', () => {
        const defaultQuestion = "What does it mean to fix my gaze on Christ when the world presses in?";
        saveCarryState(defaultQuestion);
        updateCarryUI();
      });
    }

    // "Write my own question"
    if (writeOwnBtn) {
      writeOwnBtn.addEventListener('click', () => {
        if (writePanel) writePanel.classList.add('active');
        if (textarea) textarea.focus();
      });
    }

    // Save custom question
    if (saveBtn && textarea) {
      saveBtn.addEventListener('click', () => {
        const q = textarea.value.trim();
        if (q) {
          saveCarryState(q);
          textarea.value = '';
          if (writePanel) writePanel.classList.remove('active');
          updateCarryUI();
        }
      });

      // Allow Enter+Ctrl to save
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          saveBtn.click();
        }
      });
    }

    // Cancel
    if (cancelBtn && textarea) {
      cancelBtn.addEventListener('click', () => {
        textarea.value = '';
        if (writePanel) writePanel.classList.remove('active');
      });
    }

    // Clear saved question
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        clearCarryState();
        updateCarryUI();
      });
    }

    function updateCarryUI() {
      const current = getCarryState();
      if (current.question) {
        // Show status, hide carry buttons
        if (carryBtn) carryBtn.style.display = 'none';
        if (writeOwnBtn) writeOwnBtn.style.display = 'none';
        if (status) {
          status.classList.add('active');
          if (statusText) {
            const preview = current.question.length > 60
              ? current.question.slice(0, 60) + '...'
              : current.question;
            statusText.textContent = preview;
          }
        }
      } else {
        // Show carry buttons, hide status
        if (carryBtn) carryBtn.style.display = '';
        if (writeOwnBtn) writeOwnBtn.style.display = '';
        if (status) status.classList.remove('active');
        if (textarea) textarea.value = '';
        if (writePanel) writePanel.classList.remove('active');
      }
    }
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
  // MOVEMENT 4: GRAPH NAV — Chronological nav (if records-data available)
  // ═════════════════════════════════════════════════════════════════════

  function initGraphNav() {
    const mount = document.getElementById('graph-nav-mount');
    if (!mount || typeof RECORDS_DATA === 'undefined') return;

    const record = RECORDS_DATA.find(r => r.id === RECORD_ID);
    if (!record) return;

    let html = '<div class="graph-nav"><h3 class="graph-nav-heading">Record Sequence</h3>';
    html += '<div class="graph-nav-links">';

    if (record.prev) {
      const prevRecord = RECORDS_DATA.find(r => r.id === record.prev);
      if (prevRecord) {
        html += `
          <a href="${record.prev}.html" class="nav-link">
            <span class="nav-link-label">← Previous</span>
            <span class="nav-link-title">${prevRecord.title}</span>
            <span class="nav-link-meta">${prevRecord.date}</span>
          </a>
        `;
      }
    }

    html += '<div style="flex-grow: 1;"></div>';

    if (record.next) {
      const nextRecord = RECORDS_DATA.find(r => r.id === record.next);
      if (nextRecord) {
        html += `
          <a href="${record.next}.html" class="nav-link">
            <span class="nav-link-label">Next →</span>
            <span class="nav-link-title">${nextRecord.title}</span>
            <span class="nav-link-meta">${nextRecord.date}</span>
          </a>
        `;
      }
    }

    html += '</div></div>';
    mount.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════════════
  // THREAD CONNECTIONS — If threads-data available
  // ═════════════════════════════════════════════════════════════════════

  function initThreadConnections() {
    const mount = document.getElementById('threads-mount');
    if (!mount || typeof THREAD_CONNECTIONS === 'undefined') return;

    const edges = THREAD_CONNECTIONS.filter(e => e.source === RECORD_ID);
    if (!edges.length) return;

    let html = '<div class="reviewed-threads">';
    html += '<h2 class="reviewed-threads-heading">Reviewed thread connections</h2>';
    html += '<ul class="thread-list">';

    edges.forEach(edge => {
      const { type, targetId, targetTitle, note, source } = edge;
      const typeLabel = {
        'continues': 'continues',
        'answers': 'answers',
        'opens': 'opens',
        'anticipates': 'anticipates',
        'reopens': 'reopens',
        'unresolved': 'unresolved'
      }[type] || type;

      html += `
        <li class="thread-item">
          <div class="thread-edge">
            <span class="thread-status thread-status--${type}">${typeLabel}</span>
            <a href="${targetId}.html">${targetTitle}</a>
          </div>
          ${note ? `<p class="thread-note">${note}</p>` : ''}
          ${source ? `<p class="thread-source">Source: ${source}</p>` : ''}
        </li>
      `;
    });

    html += '</ul></div>';
    mount.innerHTML = html;
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
  // Removes recommendations, discernment prompts, thread bridges, and the
  // carry-question tool, leaving title, date, source status, and the
  // original record content itself. Per design doc §6.2.
  // ═════════════════════════════════════════════════════════════════════

  function applyNoInterpretationMode() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') !== 'original') return;

    document.body.classList.add('no-interpretation-mode');

    const toHide = [
      '.discern-section',
      '.carry-question-section',
      '#related-records-mount',
      '#threads-mount',
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

  document.addEventListener('DOMContentLoaded', applyNoInterpretationMode);

  // ═══════════════════════════════════════════════════════════════════
  // INIT — Run on DOMContentLoaded
  // ═════════════════════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', () => {
    renderRecordMarkdown();
    initDiscernChoices();
    initCarryQuestion();
    initReturnChoices();
    initGraphNav();
    initRelatedRecords();
    initThreadConnections();
  });

  // Expose globally for debugging
  window.JordanCrossing = {
    getCarryState,
    saveCarryState,
    clearCarryState
  };

})();
