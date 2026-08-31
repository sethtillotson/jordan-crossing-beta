/* ═══════════════════════════════════════════════════════════════════
   Mystery Mode v2 Logic
   ═════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const DOORWAY_ROUTING = {
    'beginning-again': { record: '08-29-signpost-v2.html', prompt: 'You entered through beginning again. This record explores the repeated question of whether we can begin again when we have failed before.' },
    'trapped-identity': { record: '08-30-man-of-flesh-v2.html', prompt: 'You entered through the weight of an old identity. This record names the patterns we repeat and the way the flesh holds us.' },
    'waiting': { record: '08-30-mirror-v2.html', prompt: 'You entered through waiting. This record approaches what happens when we do not yet know what God is doing.' },
    'cannot-see': { record: '08-30-mirror-gospel-v2.html', prompt: 'You entered through uncertainty about God\'s work. This record teaches what happens when the mirror shifts and we begin to see Him instead of ourselves.' },
    'cost-of-obedience': { record: '08-30-filthy-garments-v2.html', prompt: 'You entered through the fear of what obedience costs. This record holds that fear without minimizing it.' },
    'surrender': { record: '08-30-compass-v2.html', prompt: 'You entered through the question of surrender. This record approaches surrender through the loss of self-command.' },
    'searching-jesus': { record: '08-30-wisdom-v2.html', prompt: 'You entered through searching for Jesus. This record teaches that He is the one who searches us first.' },
    'examine-carefully': { record: '08-29-signpost-v2.html', prompt: 'You entered to examine carefully. The records are primary; everything else is secondary. Read without hurrying.' },
    'signpost': { record: '08-29-signpost-v2.html', prompt: 'You chose the full chronology. The records unfold in the order they were recorded; follow the thread connections.' },
    'jordan-crossing': { record: 'jordan-crossing-interior.html', prompt: 'You chose a quiet place. The full interior awaits—read, listen, let the silence work on you.' },
    'compass': { record: '08-30-compass-v2.html', prompt: 'You are here, and that is enough. This record is offered for the moment you are in.' }
  };

  function initDoorways() {
    const btns = document.querySelectorAll('.doorway-btn');
    const continueBtn = document.getElementById('mystery-continue');
    const guidanceDiv = document.getElementById('selected-doorway');
    let selectedDoorway = null;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Deselect all
        btns.forEach(b => b.setAttribute('aria-pressed', 'false'));
        guidanceDiv.classList.remove('active');

        // Select this one
        btn.setAttribute('aria-pressed', 'true');
        selectedDoorway = btn.dataset.doorway;

        // Show guidance
        const routing = DOORWAY_ROUTING[selectedDoorway];
        if (routing) {
          guidanceDiv.innerHTML = `<p class="guidance-text">${routing.prompt}</p>`;
          guidanceDiv.classList.add('active');
          guidanceDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Enable continue button
        continueBtn.disabled = false;
        continueBtn.setAttribute('aria-disabled', 'false');
      });
    });

    continueBtn.addEventListener('click', () => {
      if (selectedDoorway && DOORWAY_ROUTING[selectedDoorway]) {
        const target = DOORWAY_ROUTING[selectedDoorway].record;
        window.location.href = `records/${target}`;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initDoorways);
})();
