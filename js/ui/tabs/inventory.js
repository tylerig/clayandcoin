// ============================================================
// TAB — Inventory
// ============================================================
import { S }          from '../../engine/state.js';
import { ITEMS, RARITY_ORDER, RARITY_STAMP } from '../../data/items.js';
import { pxImg }      from '../sprites.js';
import { sellIt, sellAllRarity, confirmSellAll } from '../../engine/inventory.js';
import { render }     from '../render.js';

export let _sellAllConfirm = false;

export function renderInventory() {
  const entries = Object.entries(S.inv).filter(([, q]) => q > 0);
  if (!entries.length) return `<div class="en">Your inventory is empty.<br>Send the team on a dig to begin.</div>`;

  const byRarity = {};
  entries.forEach(([id, qty]) => {
    const item = ITEMS[id]; if (!item) return;
    (byRarity[item.rarity] = byRarity[item.rarity] || []).push({ id, qty, item });
  });

  const totalItems = entries.reduce((s, [, q]) => s + q, 0);
  const totalSell  = entries.reduce((s, [id, q]) => s + (ITEMS[id]?.sellValue || 0) * q, 0);
  const totalTypes = Object.keys(S.cl).length;

  let h = `
    <div class="invs">
      <div><div class="isv">${totalItems}</div><div class="isl">Items held</div></div>
      <div><div class="isv">${totalTypes}</div><div class="isl">Types found</div></div>
      <div><div class="isv">${totalSell}g</div><div class="isl">Est. sell value</div></div>
    </div>`;

  if (_sellAllConfirm) {
    h += `<div class="bulk-sell-bar" style="background:rgba(107,31,15,0.08);border:1px dashed var(--red);border-radius:1px;padding:10px;display:block">
      <div style="font-family:var(--bf);font-size:12px;color:var(--red);font-style:italic;margin-bottom:8px">Sell everything in your inventory? This cannot be undone.</div>
      <div style="display:flex;gap:8px">
        <button class="jb2 danger" onclick="window._confirmSellAll()">Yes, sell everything</button>
        <button class="jb2" onclick="window._cancelSellAll()">Cancel</button>
      </div>
    </div>`;
  } else {
    h += `<div class="bulk-sell-bar">
      <span style="font-family:var(--bf);font-size:11px;color:var(--ink-faint);font-style:italic;align-self:center">Bulk sell:</span>
      ${RARITY_ORDER.filter(r => byRarity[r]).map(r => `<button class="jb2 sell-all" onclick="window._sellAllRarity('${r}')">All ${r}</button>`).join('')}
      <button class="jb2 sell-all" onclick="window._askSellAll()" style="border-color:var(--red);color:var(--red)">Sell everything</button>
    </div>`;
  }

  h += `<div class="lh"><span>Artifact</span><span>Rarity</span><span>Each</span><span>Qty</span><span>Action</span></div>`;

  RARITY_ORDER.filter(r => byRarity[r]).forEach(r => {
    const rVal = byRarity[r].reduce((s, { id, qty }) => s + (ITEMS[id]?.sellValue || 0) * qty, 0);
    h += `<div class="lsh"><span>${r}</span><button class="jb2 sell-all" onclick="window._sellAllRarity('${r}')" style="font-size:9px;padding:1px 6px">Sell all (${rVal}g)</button></div>`;
    byRarity[r].forEach(({ id, qty, item }) => {
      h += `<div class="lrow">
        <div class="lname"><div class="pb" style="padding:2px">${pxImg(id, 20)}</div>${item.name}</div>
        <div class="lval"><span class="stamp ${RARITY_STAMP[r]}">${r}</span></div>
        <div class="lval">${item.sellValue}g</div>
        <div class="lval qty">${qty}</div>
        <div class="lval"><button class="jb2 sell" onclick="window._sellIt('${id}',1)">Sell 1</button></div>
      </div>`;
    });
  });
  return h;
}

window._sellIt         = (id, qty) => sellIt(id, qty);
window._sellAllRarity  = (r) => sellAllRarity(r);
window._askSellAll     = () => { _sellAllConfirm = true; render(); };
window._cancelSellAll  = () => { _sellAllConfirm = false; render(); };
window._confirmSellAll = () => { _sellAllConfirm = false; confirmSellAll(); };
