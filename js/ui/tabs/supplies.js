// ============================================================
// TAB — Supplies (equipment shop)
// ============================================================
import { S }     from '../../engine/state.js';
import { ARCHS } from '../../data/archs.js';
import { EQUIP } from '../../data/items.js';
import { pxImg } from '../sprites.js';
import { buyEquip, assignEquip } from '../../engine/dig.js';

export function renderSupplies() {
  const recruited = ARCHS.filter(a => S.ra.includes(a.id));

  return EQUIP.map(eq => {
    const owned = S.equip.includes(eq.id);
    return `
      <div class="shopc">
        <div class="shr">
          <div class="pb">${pxImg(eq.id, 32)}</div>
          <div style="flex:1">
            <div class="shopn">${eq.name}</div>
            <div class="shopd">${eq.desc} &mdash; +${eq.bonus} luck, -${Math.round((eq.speedBonus||0) * 100)}% dig time${eq.tradeoff ? ` <span style="color:var(--red);font-style:normal">[${eq.tradeoff}]</span>` : ''}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
            ${owned
              ? `<span class="stamp st">Owned</span>
                 <select onchange="window._assignEquip('${eq.id}',this.value)" style="font-size:12px;font-family:var(--bf);font-style:italic;background:var(--paper-dark);border:1px solid var(--line);border-radius:1px;padding:3px 8px;color:var(--ink)">
                   <option value="">Assign to...</option>
                   ${recruited.map(a => `<option value="${a.id}" ${(S.asgn[a.id] || []).includes(eq.id) ? 'selected' : ''}>${a.name}</option>`).join('')}
                 </select>`
              : `<button class="jb2" onclick="window._buyEquip('${eq.id}',${eq.cost})" ${S.gold < eq.cost ? 'disabled' : ''}>${eq.cost}g</button>`
            }
          </div>
        </div>
      </div>`;
  }).join('');
}

window._buyEquip    = (id, cost) => buyEquip(id, cost);
window._assignEquip = (eid, aid) => assignEquip(eid, aid);
