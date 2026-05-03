// ============================================================
// TAB — Supplies (equipment shop)
// ============================================================
import { S }     from '../../engine/state.js';
import { ARCHS } from '../../data/archs.js';
import { EQUIP } from '../../data/items.js';
import { pxImg } from '../sprites.js';
import { buyEquip, assignEquip } from '../../engine/dig.js';

function statLine(eq) {
  const parts = [];

  // Luck
  if (eq.bonus)        parts.push(`<span style="color:var(--accent-light)">+${eq.bonus} luck</span>`);

  // Speed — net effect
  const net = (eq.speedBonus || 0) - (eq.speedPenalty || 0);
  if (net > 0)         parts.push(`<span style="color:var(--teal)">-${Math.round(net * 100)}% dig time</span>`);
  else if (net < 0)    parts.push(`<span style="color:var(--red)">+${Math.round(Math.abs(net) * 100)}% dig time</span>`);

  // Condition
  if (eq.conditionBonus > 0)  parts.push(`<span style="color:var(--teal)">+condition quality</span>`);
  else if (eq.conditionBonus < 0) parts.push(`<span style="color:var(--red)">-condition quality</span>`);

  // XP
  if (eq.xpBonus)      parts.push(`<span style="color:var(--teal)">+${Math.round((eq.xpBonus - 1) * 100)}% XP</span>`);

  // Event risk
  if (eq.eventChance)  parts.push(`<span style="color:var(--red)">+event risk</span>`);

  return parts.join(' &middot; ');
}

export function renderSupplies() {
  const recruited = ARCHS.filter(a => S.ra.includes(a.id));

  // Sort by cost ascending
  const sorted = [...EQUIP].sort((a, b) => a.cost - b.cost);

  // Divider between standard and double-edged
  let lastWasStandard = true;
  let h = '';

  sorted.forEach(eq => {
    const isDoubleEdged = !!eq.tradeoff;
    const owned = S.equip.includes(eq.id);

    // Insert divider before first double-edged item
    if (isDoubleEdged && lastWasStandard) {
      h += `<div class="sr" style="margin:14px 0 10px"><span class="srl">Trade-off equipment</span><div class="srr"></div></div>
            <div style="font-family:var(--bf);font-size:12px;color:var(--ink-faint);font-style:italic;margin-bottom:12px;line-height:1.5">These pieces carry genuine trade-offs. Read the stats carefully before assigning.</div>`;
      lastWasStandard = false;
    }

    h += `
      <div class="shopc" style="${isDoubleEdged ? 'border-color:var(--accent-mid);' : ''}">
        <div class="shr">
          <div class="pb">${pxImg(eq.id, 32)}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:7px;margin-bottom:2px">
              <div class="shopn">${eq.name}</div>
              ${isDoubleEdged ? `<span class="stamp sa" style="font-size:8px">Trade-off</span>` : ''}
            </div>
            <div class="shopd" style="margin-bottom:4px">${eq.desc}</div>
            <div style="font-family:var(--bf);font-size:11px;line-height:1.4">${statLine(eq)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;margin-left:10px">
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
  });

  return h;
}

window._buyEquip    = (id, cost) => buyEquip(id, cost);
window._assignEquip = (eid, aid) => assignEquip(eid, aid);
