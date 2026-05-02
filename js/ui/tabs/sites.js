// ============================================================
// TAB — Dig Sites
// ============================================================
import { S }          from '../../engine/state.js';
import { ARCHS }      from '../../data/archs.js';
import { SITES }      from '../../data/sites.js';
import { ITEMS }      from '../../data/items.js';
import { pxImg }      from '../sprites.js';
import { digDuration, buySite } from '../../engine/dig.js';

function siteFullyExplored(siteId) {
  const excl = Object.entries(ITEMS).filter(([, v]) => !v.craftable && v.sites?.includes(siteId));
  return excl.every(([id]) => S.cl[id]) && !ARCHS.some(a => a.recruitSite === siteId && !S.ra.includes(a.id));
}

export function renderSites() {
  return SITES.map(site => {
    const unlocked  = S.sites.includes(site.id);
    const dur       = digDuration(site) >= 60 ? Math.floor(digDuration(site) / 60) + 'm' : digDuration(site) + 's';
    const exclusive = Object.entries(ITEMS)
      .filter(([, v]) => !v.craftable && v.sites?.includes(site.id) && v.sites.length === 1)
      .map(([, v]) => v.name);
    const hasRec    = ARCHS.some(a => a.recruitSite === site.id && !S.ra.includes(a.id));
    const fullyEx   = unlocked && siteFullyExplored(site.id);

    return `
      <div class="sc">
        <div class="pb">${pxImg(site.id, 48)}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:3px">
            <div class="sn">${site.name}</div>
            <span class="stamp ${unlocked ? 'st' : 'sg'}">${unlocked ? 'Open' : 'Locked'}</span>
            ${hasRec  ? `<span class="stamp sa">Recruit possible</span>` : ''}
            ${fullyEx ? `<span class="stamp st">Fully explored</span>` : ''}
          </div>
          <div class="sd2">${site.desc}</div>
          <div class="sm">Duration: ${dur} &nbsp;&middot;&nbsp; Luck: &times;${site.luck} &nbsp;&middot;&nbsp; XP: +${site.xp}</div>
          ${exclusive.length ? `<div style="font-family:var(--bf);font-size:11px;color:var(--accent-mid);font-style:italic;margin-top:4px">Exclusive drops: ${exclusive.join(', ')}</div>` : ''}
        </div>
        ${!unlocked ? `<button class="jb2" onclick="window._buySite('${site.id}',${site.cost})" ${S.gold < site.cost ? 'disabled' : ''}>${site.cost}g</button>` : ''}
      </div>`;
  }).join('');
}

window._buySite = (id, cost) => buySite(id, cost);
