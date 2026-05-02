// ============================================================
// INVENTORY — add, remove, sell, craft
// ============================================================
import { S, save } from './state.js';
import { ITEMS }   from '../data/items.js';
import { chkChallenges } from './challenges.js';
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

export function sellIt(id, qty = 1) {
  const item = ITEMS[id];
  if (!item) return;
  if (!remItem(id, qty)) return;
  const earned = item.sellValue * qty;
  S.gold += earned;
  S.sh.push({ id, qty, gold: earned, ts: Date.now() });
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
    const e = (ITEMS[id]?.sellValue || 0) * qty;
    S.gold += e; total += e; count += qty;
    S.sh.push({ id, qty, gold: e, ts: Date.now() });
    delete S.inv[id];
  });
  save(); chkChallenges(); emit('updStats'); emit('render');
  toast(`Sold ${count} ${rarity} item${count > 1 ? 's' : ''} for ${total}g.`);
}

export function confirmSellAll() {
  const ent = Object.entries(S.inv).filter(([, q]) => q > 0);
  if (!ent.length) { toast('Inventory already empty.'); return; }
  let total = 0, count = 0;
  ent.forEach(([id, qty]) => {
    const e = (ITEMS[id]?.sellValue || 0) * qty;
    S.gold += e; total += e; count += qty;
    S.sh.push({ id, qty, gold: e, ts: Date.now() });
    delete S.inv[id];
  });
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
