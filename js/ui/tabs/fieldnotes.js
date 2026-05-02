// ============================================================
// TAB — Field Notes
// ============================================================
import { S } from '../../engine/state.js';

function fdt(ts) { return new Date(ts).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); }
function fts(ts) { return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); }

export function renderFieldNotes() {
  if (!S.fl.length) return `<div class="en">No entries yet.<br>Send the team on a dig.</div>`;

  const grouped = {};
  S.fl.forEach(e => {
    const d = fdt(e.ts);
    (grouped[d] = grouped[d] || []).push(e);
  });

  return Object.entries(grouped).map(([d, entries]) => `
    <div class="sr"><span class="srl">${d}</span><div class="srr"></div></div>
    ${entries.map(e => `
      <div class="le">
        <div class="ld">${fts(e.ts)}</div>
        <div class="lt2">${e.text}</div>
      </div>`).join('')}
  `).join('');
}
