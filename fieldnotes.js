// ============================================================
// SETTINGS OVERLAY
// ============================================================
import { S, save, resetState, SAVE_KEY } from '../engine/state.js';
import { chkChallenges } from '../engine/challenges.js';
import { render, updCB } from './render.js';
import { toast }         from './toast.js';

let _confirmReset = false;

export function openSettings() {
  _confirmReset = false;
  _render();
}

export function closeSettings() {
  document.getElementById('settings-portal').innerHTML = '';
}

function _render() {
  document.getElementById('settings-portal').innerHTML = `
    <div class="ov" onclick="if(event.target===this)window._closeSettings()">
      <div class="ob settings" style="position:relative">
        <button class="set-close" onclick="window._closeSettings()">✕</button>
        <div class="set-title">Settings</div>
        <div class="set-version">Clay &amp; Coin &nbsp;&middot;&nbsp; build 1.0</div>

        <div class="set-section">save data</div>
        <div class="set-row">
          <div><div class="set-label">Export save</div><div class="set-desc">Copy your full save to clipboard.</div></div>
          <button class="jb2" onclick="window._exportSave()">Copy</button>
        </div>
        <div class="set-row" style="display:block">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <div><div class="set-label">Import save</div><div class="set-desc">Paste a previously exported save string.</div></div>
            <button class="jb2" onclick="window._importSave()" style="margin-left:12px;flex-shrink:0">Import</button>
          </div>
          <textarea class="import-area" id="import-area" placeholder="Paste save data here..."></textarea>
        </div>

        <div class="set-section" style="margin-top:8px">danger zone</div>
        <div class="set-row" style="display:block">
          ${_confirmReset
            ? `<div class="confirm-danger">This will erase all progress permanently. There is no undo.</div>
               <div style="display:flex;gap:8px">
                 <button class="jb2 danger" onclick="window._confirmReset()">Yes, reset everything</button>
                 <button class="jb2" onclick="window._cancelReset()">Cancel</button>
               </div>`
            : `<div style="display:flex;align-items:center;justify-content:space-between">
                 <div><div class="set-label">Reset all progress</div><div class="set-desc">Wipe save data and start fresh.</div></div>
                 <button class="jb2 danger" onclick="window._askReset()">Reset</button>
               </div>`
          }
        </div>
      </div>
    </div>`;
}

// Expose as globals for inline onclick
window._closeSettings  = closeSettings;
window._exportSave     = () => {
  try {
    const d = localStorage.getItem(SAVE_KEY) || '{}';
    navigator.clipboard.writeText(d)
      .then(() => toast('Save copied.'))
      .catch(() => { const ta = document.getElementById('import-area'); if (ta) ta.value = d; toast('Copy failed — data in import field.'); });
  } catch (e) { toast('Export failed.'); }
};
window._importSave     = () => {
  const ta = document.getElementById('import-area');
  if (!ta || !ta.value.trim()) { toast('Paste a save string first.'); return; }
  try {
    JSON.parse(ta.value.trim());
    localStorage.setItem(SAVE_KEY, ta.value.trim());
    // Reload state
    location.reload();
  } catch (e) { toast('Invalid save data.'); }
};
window._askReset       = () => { _confirmReset = true; _render(); };
window._cancelReset    = () => { _confirmReset = false; _render(); };
window._confirmReset   = () => {
  localStorage.removeItem(SAVE_KEY);
  closeSettings();
  resetState();
  save();
  render();
  updCB();
  chkChallenges();
  toast('Progress reset.');
};
