// ============================================================
// TAB — Dig Sites
// ============================================================
import { S }          from '../../engine/state.js';
import { ARCHS }      from '../../data/archs.js';
import { SITES }      from '../../data/sites.js';
import { ITEMS }      from '../../data/items.js';
import { pxImg }      from '../sprites.js';
import { digDuration, buySite } from '../../engine/dig.js';
import { depthTier, depthPct, restoreCost, restoreSite, getSiteDepth } from '../../engine/site_reputation.js';

function siteFullyExplored(siteId) {
  const excl = Object.entries(ITEMS).filter(([, v]) => !v.craftable && v.sites?.includes(siteId));
  return excl.every(([id]) => S.cl[id]) && !ARCHS.some(a => a.recruitSite === siteId && !S.ra.includes(a.id));
}

function fmtDur(s) {
  return s >= 60 ? Math.floor(s / 60) + 'm ' + (s % 60 ? (s % 60) + 's' : '') : s + 's';
}

export function renderSites() {
  let h = '';
  SITES.forEach(site => {
    const unlocked  = S.sites.includes(site.id);
    const dur       = fmtDur(digDuration(site)).trim();
    const exclusive = Object.entries(ITEMS)
      .filter(([, v]) => !v.craftable && v.sites?.includes(site.id) && v.sites.length === 1)
      .map(([, v]) => v.name);
    const hasRec    = ARCHS.some(a => a.recruitSite === site.id && !S.ra.includes(a.id));
    const fullyEx   = unlocked && siteFullyExplored(site.id);
    const tier      = unlocked ? depthTier(site.id) : null;
    const pct       = unlocked ? depthPct(site.id) : 0;
    const depth     = unlocked ? getSiteDepth(site.id) : 0;
    const rCost     = unlocked ? restoreCost(site.id) : 0;
    const exhausted = tier?.label === 'Exhausted';

    h += `
      <div class="sc" style="${exhausted ? 'border-color:var(--red);opacity:0.9' : ''}">
        <div class="pb">${pxImg(site.id, 48)}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:3px">
            <div class="sn">${site.name}</div>
            <span class="stamp ${unlocked ? 'st' : 'sg'}">${unlocked ? 'Open' : 'Locked'}</span>
            ${hasRec  ? `<span class="stamp sa">Recruit possible</span>` : ''}
            ${fullyEx ? `<span class="stamp st">Fully explored</span>` : ''}
            ${exhausted ? `<span class="stamp sr2">Exhausted</span>` : ''}
          </div>
          <div class="sd2">${site.desc}</div>
          <div class="sm">Duration: ${dur} &nbsp;&middot;&nbsp; Luck: &times;${site.luck} &nbsp;&middot;&nbsp; XP: +${site.xp}</div>
          ${exclusive.length ? `<div style="font-family:var(--bf);font-size:11px;color:var(--accent-mid);font-style:italic;margin-top:4px">Exclusive drops: ${exclusive.join(', ')}</div>` : ''}
          ${unlocked ? `
            <div style="margin-top:8px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
                <div style="font-family:var(--bf);font-size:10px;color:${tier.color};font-style:italic;min-width:64px">${tier.label}</div>
                <div style="flex:1;height:4px;background:var(--paper-darker);border-radius:2px;overflow:hidden;max-width:120px">
                  <div style="height:100%;width:${pct}%;background:${tier.color};border-radius:2px;transition:width 0.4s"></div>
                </div>
                <div style="font-family:var(--bf);font-size:10px;color:var(--ink-faint)">${depth} digs</div>
              </div>
              ${tier.label !== 'Fresh' ? `
                <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
                  <div style="font-family:var(--bf);font-size:10px;color:var(--ink-faint);font-style:italic">Recovers naturally over time.</div>
                  ${rCost > 0 ? `<button class="jb2" style="font-size:10px;padding:2px 7px" onclick="window._restoreSite('${site.id}')" ${S.gold < rCost ? 'disabled' : ''}>Restore now (${rCost}g)</button>` : ''}
                </div>` : ''}
            </div>` : ''}
        </div>
        ${!unlocked ? `<button class="jb2" onclick="window._buySite('${site.id}',${site.cost})" ${S.gold < site.cost ? 'disabled' : ''}>${site.cost}g</button>` : ''}
      </div>`;
  });
  return h;
}

window._buySite     = (id, cost) => buySite(id, cost);
window._restoreSite = (id) => restoreSite(id);
