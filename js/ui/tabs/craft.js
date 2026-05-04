// ============================================================
// TAB — Workshop
// ============================================================
import { S }         from '../../engine/state.js';
import { ITEMS, RARITY_STAMP } from '../../data/items.js';
import { pxImg }     from '../sprites.js';
import { canCraft, doCraft, cntItem } from '../../engine/inventory.js';
import { researchCost, researchDuration, canResearch, startResearch, authenticatedBonus } from '../../engine/provenance.js';

function fmtDur(s) {
  return s >= 60 ? Math.floor(s / 60) + 'm ' + (s % 60 ? (s % 60) + 's' : '') : s + 's';
}

function fmtCountdown(end) {
  const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
  return fmtDur(s).trim();
}

export function renderCraft() {
  const craftable = Object.entries(ITEMS).filter(([, v]) => v.craftable);
  let h = `<div style="font-family:var(--bf);font-size:13px;color:var(--ink-mid);font-style:italic;margin-bottom:16px;">Combine artifacts to produce rarer pieces. Ingredients are consumed on crafting.</div>`;

  craftable.forEach(([id, item]) => {
    const ok   = canCraft(id);
    const ings = Object.entries(item.recipe).map(([ing, qty]) => {
      const have = cntItem(ing) >= qty;
      const ii   = ITEMS[ing];
      return `<span class="ci ${have ? 'hv' : 'nd'}">${ii?.name || ing} &times;${qty} (have ${cntItem(ing)})</span>`;
    }).join('');

    h += `
      <div class="cfc">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <div class="pb">${pxImg(id, 36)}</div>
          <div style="flex:1">
            <div style="font-family:var(--tf);font-size:14px;font-weight:500;color:var(--ink);margin-bottom:4px">
              ${item.name} <span class="stamp ${RARITY_STAMP[item.rarity]}" style="margin-left:6px">${item.rarity}</span>
            </div>
            <div style="font-family:var(--bf);font-size:11px;color:var(--ink-faint);font-style:italic">${item.flavour}</div>
          </div>
          <button class="jb2 cb" onclick="window._doCraft('${id}')" ${ok ? '' : 'disabled'}>Craft</button>
        </div>
        <div style="font-family:var(--bf);font-size:12px;color:var(--ink-mid);font-style:italic;">Recipe: ${ings}</div>
      </div>`;
  });

  // ── Provenance Research ───────────────────────────────
  h += `<div class="sr" style="margin-top:20px"><span class="srl">Provenance Research</span><div class="srr"></div></div>`;
  h += `<div style="font-family:var(--bf);font-size:13px;color:var(--ink-mid);font-style:italic;margin-bottom:16px;line-height:1.6">Submit an artifact for scholarly authentication. Results are not guaranteed — a poor find may prove to be a forgery. One item researched at a time.</div>`;

  // Active research
  const ar = S.activeResearch;
  if (ar) {
    const item = ITEMS[ar.itemId];
    const done = Date.now() >= ar.end;
    const pct  = done ? 100 : Math.round((Date.now() - ar.start) / (ar.end - ar.start) * 100);
    h += `
      <div class="cfc" style="border-color:var(--accent-mid)">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
          <div class="pb">${pxImg(ar.itemId, 36)}</div>
          <div style="flex:1">
            <div style="font-family:var(--tf);font-size:14px;font-weight:500;color:var(--ink);margin-bottom:3px">${item?.name} <span class="stamp sa" style="margin-left:6px">Under research</span></div>
            <div style="font-family:var(--bf);font-size:11px;color:var(--ink-faint);font-style:italic">${done ? 'Analysis complete — results pending collection.' : `Results in ${fmtCountdown(ar.end)}`}</div>
          </div>
        </div>
        <div style="height:4px;background:var(--paper-darker);border-radius:2px;overflow:hidden;margin-bottom:4px">
          <div id="research-bar" style="height:100%;width:${pct}%;background:var(--accent-light);border-radius:2px;transition:width 1s"></div>
        </div>
      </div>`;
  }

  // Researchable items in inventory
  const researchable = Object.entries(S.inv)
    .filter(([id, qty]) => qty > 0 && ITEMS[id] && !ITEMS[id].craftable)
    .sort(([, a], [, b]) => b - a);

  if (!researchable.length) {
    if (!ar) h += `<div class="en" style="padding:1.5rem 0">No artifacts in inventory to research.</div>`;
  } else {
    h += `<div class="lh" style="grid-template-columns:1fr auto auto auto auto"><span>Artifact</span><span>Rarity</span><span>In stock</span><span>Cost</span><span>Action</span></div>`;
    researchable.forEach(([id, qty]) => {
      const item  = ITEMS[id];
      const cost  = researchCost(id);
      const dur   = fmtDur(researchDuration(id)).trim();
      const bonus = authenticatedBonus(id);
      const busy  = !!ar;
      const ok    = !busy && canResearch(id) && S.gold >= cost;
      h += `
        <div class="lrow" style="grid-template-columns:1fr auto auto auto auto">
          <div class="lname" style="flex-direction:column;align-items:flex-start;gap:2px">
            <div style="display:flex;align-items:center;gap:8px"><div class="pb" style="padding:2px">${pxImg(id, 20)}</div>${item.name}</div>
            ${bonus ? `<div style="font-family:var(--bf);font-size:10px;color:var(--teal);font-style:italic;padding-left:28px">+${bonus}g authenticated</div>` : ''}
          </div>
          <div class="lval"><span class="stamp ${RARITY_STAMP[item.rarity]}">${item.rarity}</span></div>
          <div class="lval qty">${qty}</div>
          <div class="lval" style="font-size:11px">${cost}g &middot; ${dur}</div>
          <div class="lval"><button class="jb2 cb" onclick="window._startResearch('${id}')" ${ok ? '' : 'disabled'}>Research</button></div>
        </div>`;
    });
  }

  return h;
}

window._doCraft       = (id) => doCraft(id);
window._startResearch = (id) => startResearch(id);
