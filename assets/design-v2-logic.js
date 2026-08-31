/* ═══════════════════════════════════════════════════════════════════
   The Jordan Crossing — Design v2 Logic
   Interactive behaviors for the four movements
   ═════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const CARRY_STORAGE_KEY = 'jc_carry_question';
  const RECORD_ID = document.body.dataset.recordId || 'unknown';

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
        writePanel.classList.add('active');
        textarea.focus();
      });
    }

    // Save custom question
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const q = textarea.value.trim();
        if (q) {
          saveCarryState(q);
          textarea.value = '';
          writePanel.classList.remove('active');
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
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        textarea.value = '';
        writePanel.classList.remove('active');
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
        textarea.value = '';
        writePanel.classList.remove('active');
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
    html += '<h3 class="reviewed-threads-heading">Reviewed thread connections</h3>';
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
  // INIT — Run on DOMContentLoaded
  // ═════════════════════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', () => {
    initDiscernChoices();
    initCarryQuestion();
    initReturnChoices();
    initGraphNav();
    initThreadConnections();
  });

  // Expose globally for debugging
  window.JordanCrossing = {
    getCarryState,
    saveCarryState,
    clearCarryState
  };

})();
