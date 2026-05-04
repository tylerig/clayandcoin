// ============================================================
// INVENTORY — add, remove, sell, craft
// ============================================================
import { S, save } from './state.js';
import { ITEMS, CONDITION_MULT } from '../data/items.js';
import { chkChallenges } from './challenges.js';
import { onSale }  from './prestige.js';
import { toast }   from '../ui/toast.js';
import { emit }    from './bus.js';

export function addItem(id, qty = 1) {
  S.inv[id] = (S.inv[id] || 0) + qty;
  if (!S.cl[id]) S.cl[id] = { ff: Date.now(), tot: 0 };
  S.cl[id].tot += qty;
}

export function remItem(id, qty = 1) {
  if ((S.inv[id] || 0) < qty) return false;
  S.inv[id] -= qty;
  if (S.inv[id] <= 0) delete S.inv[id];
  return true;
}

export function cntItem(id) {
  return S.inv[id] || 0;
}

/** Get the effective sell value for one item — authenticated items sell for more */
export function effectiveSellValue(id) {
  const item = ITEMS[id]; if (!item) return 0;
  const authCount = (S.invAuth || {})[id] || 0;
  const authBonus = authCount > 0 ? ((S.authBonus || {})[id] || 0) : 0;
  const conds = S.invC?.[id];
  if (!conds) return item.sellValue + authBonus;
  for (const c of ['excellent', 'good', 'fair', 'poor']) {
    if ((conds[c] || 0) > 0) return Math.round(item.sellValue * CONDITION_MULT[c]) + authBonus;
  }
  return item.sellValue + authBonus;
}

/** Get condition breakdown string for display */
export function conditionSummary(id) {
  const conds  = S.invC?.[id];
  const auth   = (S.invAuth || {})[id] || 0;
  const parts  = [];
  if (auth > 0) parts.push(`${auth}× authenticated`);
  if (conds) {
    ['excellent','good','fair','poor'].forEach(c => {
      if ((conds[c] || 0) > 0) parts.push(`${conds[c]}× ${c}`);
    });
  }
  return parts.join(', ');
}

/** Remove one item, selling authenticated first (highest value), then worst condition */
function remOneByCondition(id) {
  if (!remItem(id, 1)) return 0;
  // Sell authenticated first — they're worth the most
  const authCount = (S.invAuth || {})[id] || 0;
  if (authCount > 0) {
    S.invAuth[id]--;
    if (S.invAuth[id] <= 0) delete S.invAuth[id];
    const bonus = (S.authBonus || {})[id] || 0;
    // If no more authenticated, clear the bonus
    if (!S.invAuth[id]) delete S.authBonus[id];
    return (ITEMS[id]?.sellValue || 0) + bonus;
  }
  // Otherwise sell worst condition first
  const conds = S.invC?.[id];
  if (conds) {
    for (const c of ['poor', 'fair', 'good', 'excellent']) {
      if ((conds[c] || 0) > 0) {
        conds[c]--;
        const val = Math.round((ITEMS[id]?.sellValue || 0) * CONDITION_MULT[c]);
        if (Object.values(conds).every(v => v === 0)) delete S.invC[id];
        return val;
      }
    }
  }
  return ITEMS[id]?.sellValue || 0;
}

export function sellIt(id, qty = 1) {
  const item = ITEMS[id];
  if (!item) return;
  let earned = 0;
  for (let i = 0; i < qty; i++) {
    const val = remOneByCondition(id);
    if (val === 0 && i === 0) return; // nothing to sell
    earned += val;
  }
  S.gold += earned;
  S.sh.push({ id, qty, gold: earned, ts: Date.now() });
  onSale(earned);
  save();
  chkChallenges();
  emit('updStats');
  emit('render');
  toast(`Sold ${item.name} for ${earned}g.`);
}

export function sellAllRarity(rarity) {
  const ent = Object.entries(S.inv).filter(([id, q]) => q > 0 && ITEMS[id]?.rarity === rarity);
  if (!ent.length) { toast('Nothing to sell.'); return; }
  let total = 0, count = 0;
  ent.forEach(([id, qty]) => {
    for (let i = 0; i < qty; i++) total += remOneByCondition(id);
    count += qty;
    S.sh.push({ id, qty, gold: total, ts: Date.now() });
  });
  S.gold += total;
  onSale(total);
  save(); chkChallenges(); emit('updStats'); emit('render');
  toast(`Sold ${count} ${rarity} item${count > 1 ? 's' : ''} for ${total}g.`);
}

export function confirmSellAll() {
  const ent = Object.entries(S.inv).filter(([, q]) => q > 0);
  if (!ent.length) { toast('Inventory already empty.'); return; }
  let total = 0, count = 0;
  ent.forEach(([id, qty]) => {
    for (let i = 0; i < qty; i++) total += remOneByCondition(id);
    count += qty;
    S.sh.push({ id, qty, gold: total, ts: Date.now() });
  });
  S.gold += total;
  onSale(total);
  save(); chkChallenges(); emit('updStats'); emit('render');
  toast(`Sold everything for ${total}g.`);
}

export function canCraft(id) {
  const item = ITEMS[id];
  if (!item || !item.craftable || !item.recipe) return false;
  return Object.entries(item.recipe).every(([i, q]) => cntItem(i) >= q);
}

export function doCraft(id) {
  if (!canCraft(id)) return;
  const item = ITEMS[id];
  Object.entries(item.recipe).forEach(([i, q]) => remItem(i, q));
  addItem(id, 1);
  S.ch2.push({ id, ts: Date.now() });
  addLog(`Crafted a <em>${item.name}</em> in the workshop.`, 'craft');
  save(); chkChallenges(); emit('render');
  toast(`Crafted: ${item.name}.`);
}

// Field log helper lives here to avoid a circular dep
export function addLog(text, type = 'dig') {
  S.fl.unshift({ ts: Date.now(), text, type });
  if (S.fl.length > 60) S.fl.length = 60;
}
