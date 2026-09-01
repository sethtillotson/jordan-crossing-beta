/* ═══════════════════════════════════════════════════════════════════
   Audio Player — Phase 3 (CHANGELOG roadmap)
   ═════════════════════════════════════════════════════════════════════

   A custom, accessible wrapper around a native <audio> element: play/
   pause, a seekable progress bar, an elapsed/duration timestamp, volume
   control, and playback-speed control. Captions are supported via a
   standard <track kind="captions"> element whenever a record supplies
   `captionsUrl` — the browser's native caption rendering is used rather
   than a custom implementation, so no extra plumbing is needed here.

   This file is intentionally standalone (no dependency on records-data.js
   internals beyond the `audioUrl`/`captionsUrl` fields) so it can be
   dropped onto any page with a `#audio-player-mount` element and a
   `data-audio-url` attribute, or driven directly via `mountAudioPlayer()`.

   Governance note: this player renders nothing when no audio URL is
   supplied. As of this writing, no record in the corpus has an audioUrl —
   the six Cross-Reference passes and the raw meditation folders are
   text-only (PLAUD/Speakly-generated summaries). The player is built and
   tested against the CHANGELOG's Phase 3 spec so that the day real audio
   source files or URLs are provided, wiring one in is a one-line data
   change (`audioUrl: '...'` on the record), not a new engineering effort.
   ═════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  /**
   * Build and mount an audio player into `mount`.
   * @param {HTMLElement} mount
   * @param {{ audioUrl: string, captionsUrl?: string, title?: string }} opts
   */
  function mountAudioPlayer(mount, opts) {
    if (!mount || !opts || !opts.audioUrl) return;

    mount.classList.add('audio-player');
    mount.innerHTML = `
      <div class="audio-player-inner">
        <button type="button" class="audio-play-btn" aria-label="Play${opts.title ? ' ' + opts.title : ''}">
          <span class="audio-play-icon" aria-hidden="true">▶</span>
        </button>
        <div class="audio-player-body">
          <label class="audio-progress-label" for="audio-progress-${mount.id}">Playback position</label>
          <input type="range" id="audio-progress-${mount.id}" class="audio-progress" min="0" max="100" value="0" step="0.1" aria-label="Seek">
          <div class="audio-time-row">
            <span class="audio-time-elapsed">0:00</span>
            <span class="audio-time-sep" aria-hidden="true">/</span>
            <span class="audio-time-duration">0:00</span>
          </div>
        </div>
        <div class="audio-player-controls">
          <label class="audio-speed-label" for="audio-speed-${mount.id}">Speed</label>
          <select id="audio-speed-${mount.id}" class="audio-speed">
            <option value="0.75">0.75×</option>
            <option value="1" selected>1×</option>
            <option value="1.25">1.25×</option>
            <option value="1.5">1.5×</option>
            <option value="2">2×</option>
          </select>
          <label class="audio-volume-label" for="audio-volume-${mount.id}">Volume</label>
          <input type="range" id="audio-volume-${mount.id}" class="audio-volume" min="0" max="1" step="0.05" value="1" aria-label="Volume">
        </div>
      </div>
    `;

    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.src = opts.audioUrl;
    if (opts.captionsUrl) {
      const track = document.createElement('track');
      track.kind = 'captions';
      track.src = opts.captionsUrl;
      track.default = true;
      audio.appendChild(track);
    }
    mount.appendChild(audio);

    const playBtn = mount.querySelector('.audio-play-btn');
    const playIcon = mount.querySelector('.audio-play-icon');
    const progress = mount.querySelector('.audio-progress');
    const elapsedEl = mount.querySelector('.audio-time-elapsed');
    const durationEl = mount.querySelector('.audio-time-duration');
    const speedSelect = mount.querySelector('.audio-speed');
    const volumeInput = mount.querySelector('.audio-volume');

    let seeking = false;

    playBtn.addEventListener('click', () => {
      if (audio.paused) { audio.play(); } else { audio.pause(); }
    });

    audio.addEventListener('play', () => {
      playIcon.textContent = '❚❚';
      playBtn.setAttribute('aria-label', `Pause${opts.title ? ' ' + opts.title : ''}`);
    });
    audio.addEventListener('pause', () => {
      playIcon.textContent = '▶';
      playBtn.setAttribute('aria-label', `Play${opts.title ? ' ' + opts.title : ''}`);
    });
    audio.addEventListener('ended', () => {
      playIcon.textContent = '▶';
      playBtn.setAttribute('aria-label', `Play${opts.title ? ' ' + opts.title : ''}`);
    });

    audio.addEventListener('loadedmetadata', () => {
      durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      if (seeking) return;
      elapsedEl.textContent = formatTime(audio.currentTime);
      if (audio.duration) {
        progress.value = String((audio.currentTime / audio.duration) * 100);
      }
    });

    progress.addEventListener('input', () => {
      seeking = true;
      if (audio.duration) {
        elapsedEl.textContent = formatTime((Number(progress.value) / 100) * audio.duration);
      }
    });
    progress.addEventListener('change', () => {
      if (audio.duration) {
        audio.currentTime = (Number(progress.value) / 100) * audio.duration;
      }
      seeking = false;
    });

    speedSelect.addEventListener('change', () => {
      audio.playbackRate = Number(speedSelect.value);
    });

    volumeInput.addEventListener('input', () => {
      audio.volume = Number(volumeInput.value);
    });
  }

  // Auto-init: look for a mount with a data-audio-url attribute (used by
  // static pages that want the player without a JC_RECORDS lookup).
  function autoInit() {
    document.querySelectorAll('.audio-player-mount[data-audio-url]').forEach(mount => {
      mountAudioPlayer(mount, {
        audioUrl: mount.dataset.audioUrl,
        captionsUrl: mount.dataset.captionsUrl || null,
        title: mount.dataset.audioTitle || null,
      });
    });
  }

  document.addEventListener('DOMContentLoaded', autoInit);

  window.JordanCrossingAudio = { mountAudioPlayer };
})();
