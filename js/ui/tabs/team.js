// ============================================================
// TAB — The Team
// ============================================================
import { S }             from '../../engine/state.js';
import { ARCHS, XP_THRESH, MAX_SK } from '../../data/archs.js';
import { SITES }         from '../../data/sites.js';
import { EQUIP }         from '../../data/items.js';
import { pxImg }         from '../sprites.js';
import { currentSkill, nextXPThreshold, digDuration, dispatch } from '../../engine/dig.js';
import { collectDig }    from '../../engine/dig.js';

function pips(n, max = 4) {
  return Array.from({ length: max }, (_, i) => `<div class="pip${i < n ? ' f' : ''}"></div>`).join('');
}

function ftm(end) {
  const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
  return s >= 60 ? Math.floor(s / 60) + 'm ' + (s % 60) + 's' : s + 's';
}

export function renderTeam() {
  const recruited = ARCHS.filter(a => S.ra.includes(a.id));
  const locked    = ARCHS.filter(a => !S.ra.includes(a.id));
  const unlockedSites = SITES.filter(s => S.sites.includes(s.id));

  let h = recruited.map(arch => {
    const dig   = S.active[arch.id];
    const eq    = (S.asgn[arch.id] || []).map(eid => EQUIP.find(e => e.id === eid)).filter(Boolean);
    const now   = Date.now();
    const ready = dig && dig.end <= now;
    const pct   = dig && !ready ? Math.min(100, Math.round((now - dig.start) / (dig.end - dig.start) * 100)) : 0;
    const sk    = currentSkill(arch.id);
    const xp    = S.axp[arch.id] || 0;
    const nx    = nextXPThreshold(arch.id);
    const xpct  = nx ? Math.min(100, Math.round((xp - (XP_THRESH[sk] || 0)) / (nx - (XP_THRESH[sk] || 0)) * 100)) : 100;
    const site  = dig ? SITES.find(s => s.id === dig.site) : null;

    return `
      <div class="ac${dig ? ' od' : ''}" id="card-${arch.id}">
        <div class="am">
          <div class="pb">${pxImg(arch.id, 40)}</div>
          <div style="flex:1;min-width:0">
            <div class="an">${arch.name}</div>
            <div class="ar">${arch.role}</div>
            <div class="xr">
              <div class="spp">${pips(sk)}</div>
              <div class="xt"><div class="xf" style="width:${xpct}%"></div></div>
              <div class="xl">${nx ? xp + '/' + nx + 'xp' : 'Max'}</div>
            </div>
            ${eq.length ? `<div style="margin-top:5px;display:flex;gap:4px;flex-wrap:wrap">${eq.map(e => `<span class="stamp sg">${e.name}</span>`).join('')}</div>` : ''}
          </div>
        </div>
        ${dig ? `
          <div class="ds">
            <div class="dsn">Excavating: ${site?.name}</div>
            ${ready
              ? `<div class="crw"><span class="rl">Findings await collection</span><button class="jb2 pri" onclick="window._collectDig('${arch.id}')">Collect findings</button></div>`
              : `<div class="pt"><div class="pf" id="pf-${arch.id}" style="width:${pct}%"></div></div><div class="dt" id="dt-${arch.id}">${ftm(dig.end)} remaining</div>`
            }
          </div>`
        : `
          <div class="dr">
            <select class="ss" id="sel-${arch.id}" onchange="window._rememberSite('${arch.id}',this.value)">
              <option value="">— select a dig site —</option>
              ${unlockedSites.map(s => {
                const dur = digDuration(s) >= 60 ? Math.floor(digDuration(s) / 60) + 'm' : digDuration(s) + 's';
                const sel = (S.lastSite?.[arch.id] === s.id) ? ' selected' : '';
                return `<option value="${s.id}"${sel}>${s.name} (${dur})</option>`;
              }).join('')}
            </select>
            <button class="jb2 pri" onclick="window._dispatch('${arch.id}')">Begin excavation</button>
          </div>`
        }
      </div>`;
  }).join('');

  if (locked.length) {
    h += `<div class="sr" style="margin-top:4px"><span class="srl">Not yet found</span><div class="srr"></div></div>`;
    locked.forEach(arch => {
      const site = SITES.find(s => s.id === arch.recruitSite);
      h += `<div class="al"><div class="pb" style="filter:grayscale(1);opacity:0.5">${pxImg(arch.id, 36)}</div><div><div class="aln">Unknown archaeologist</div><div class="alh">Rumoured to be near the ${site?.name || 'field'}. Keep digging.</div></div></div>`;
    });
  }
  return h;
}

// Expose for inline onclick
window._dispatch     = (id) => {
  const sel = document.getElementById('sel-' + id);
  if (sel?.value) {
    if (!S.lastSite) S.lastSite = {};
    S.lastSite[id] = sel.value;
  }
  dispatch(id);
};
window._rememberSite = (id, val) => {
  if (!S.lastSite) S.lastSite = {};
  S.lastSite[id] = val;
};
window._collectDig   = (id) => collectDig(id);
