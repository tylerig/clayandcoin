// ============================================================
// TAB — Workshop
// ============================================================
import { ITEMS, RARITY_STAMP } from '../../data/items.js';
import { pxImg }      from '../sprites.js';
import { canCraft, doCraft, cntItem } from '../../engine/inventory.js';

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
  return h;
}

window._doCraft = (id) => doCraft(id);
