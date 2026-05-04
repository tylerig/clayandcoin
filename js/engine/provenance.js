// ============================================================
// PROVENANCE RESEARCH — authenticate items in the workshop
// ============================================================
import { S, save }  from './state.js';
import { ITEMS, CONDITION_MULT } from '../data/items.js';
import { remItem }  from './inventory.js';
import { addLog }   from './inventory.js';
import { emit }     from './bus.js';
import { toast }    from '../ui/toast.js';
import { onSale }   from './prestige.js';

// Research cost and duration by rarity
const RESEARCH = {
  common:   { cost: 5,  duration: 60  },
  uncommon: { cost: 15, duration: 180 },
  rare:     { cost: 35, duration: 360 },
  epic:     { cost: 80, duration: 720 },
};

// Outcome probabilities by rarity (authenticated / misattributed / forgery)
const OUTCOMES = {
  common:   [0.60, 0.30, 0.10],
  uncommon: [0.55, 0.30, 0.15],
  rare:     [0.50, 0.30, 0.20],
  epic:     [0.45, 0.30, 0.25],
};

// Condition shifts outcome odds — excellent gets +10% auth, poor gets -10%
function conditionAuthBonus(itemId) {
  const conds = S.invC?.[itemId];
  if (!conds) return 0;
  for (const c of ['excellent','good','fair','poor']) {
    if ((conds[c] || 0) > 0) {
      return { excellent: 0.10, good: 0.05, fair: 0, poor: -0.10 }[c];
    }
  }
  return 0;
}

export function researchCost(itemId) {
  const item = ITEMS[itemId];
  if (!item) return 0;
  return RESEARCH[item.rarity]?.cost || 10;
}

export function researchDuration(itemId) {
  const item = ITEMS[itemId];
  if (!item) return 60;
  return RESEARCH[item.rarity]?.duration || 60;
}

export function canResearch(itemId) {
  const item = ITEMS[itemId];
  if (!item || item.craftable) return false;
  // Must have at least one in inventory and not currently researching it
  if ((S.inv[itemId] || 0) < 1) return false;
  if (S.activeResearch?.itemId === itemId) return false;
  return true;
}

export function startResearch(itemId) {
  if (!canResearch(itemId)) return;
  const cost = researchCost(itemId);
  const dur  = researchDuration(itemId);
  if (S.gold < cost) { toast('Not enough gold.'); return; }
  if (!remItem(itemId, 1)) return;
  S.gold -= cost;
  // Remove from invC too — consume worst condition first
  const conds = S.invC?.[itemId];
  if (conds) {
    for (const c of ['poor','fair','good','excellent']) {
      if ((conds[c] || 0) > 0) { conds[c]--; break; }
    }
    if (Object.values(conds).every(v => v === 0)) delete S.invC[itemId];
  }
  S.activeResearch = { itemId, start: Date.now(), end: Date.now() + dur * 1000 };
  save();
  emit('render');
  emit('updStats');
  toast(`Research started on ${ITEMS[itemId].name}.`);
}

export function collectResearch() {
  const r = S.activeResearch;
  if (!r || Date.now() < r.end) return;
  const item = ITEMS[r.itemId];
  const [authBase, misBase] = OUTCOMES[item.rarity] || [0.5, 0.3, 0.2];
  const condBonus   = conditionAuthBonus(r.itemId);
  const authChance  = Math.min(0.85, authBase + condBonus);
  const roll        = Math.random();

  let outcome, text;

  if (roll < authChance) {
    outcome = 'authenticated';
    const bonus = Math.round(item.sellValue * 0.5);
    // Store auth bonus per item type
    if (!S.authBonus)  S.authBonus  = {};
    S.authBonus[r.itemId] = bonus; // fixed bonus per authenticated instance
    // Track authenticated count separately
    if (!S.invAuth)    S.invAuth    = {};
    S.invAuth[r.itemId] = (S.invAuth[r.itemId] || 0) + 1;
    // Also add back to regular inv count so total qty is correct
    S.inv[r.itemId] = (S.inv[r.itemId] || 0) + 1;
    onSale(item.sellValue * 0.3);
    text = `Authenticated. The ${item.name} has been verified. Sell value increased by ${bonus}g.`;
  } else if (roll < authChance + misBase) {
    outcome = 'misattributed';
    // Return as fair condition
    S.inv[r.itemId] = (S.inv[r.itemId] || 0) + 1;
    if (!S.invC[r.itemId]) S.invC[r.itemId] = { poor: 0, fair: 0, good: 0, excellent: 0 };
    S.invC[r.itemId].fair = (S.invC[r.itemId].fair || 0) + 1;
    text = `Misattributed. The ${item.name} is genuine but from a different period. Returned to inventory.`;
  } else {
    outcome = 'forgery';
    // Already removed from inventory in startResearch
    S.prestige = Math.max(0, (S.prestige || 0) - 10);
    text = `Forgery detected. The ${item.name} was not what it appeared. It has been removed. -10 reputation.`;
  }

  addLog(`Research complete on <em>${item.name}</em>: ${text} <span class="lmkt">[Research]</span>`, 'research');
  delete S.activeResearch;
  save();
  emit('render');
  emit('updStats');
  toast(`Research complete: ${outcome}.`);
  return { outcome, text, item };
}

/** Auth bonus for display — only if authenticated instances exist in inventory */
export function authenticatedBonus(itemId) {
  const authCount = (S.invAuth || {})[itemId] || 0;
  if (!authCount) return 0;
  return (S.authBonus || {})[itemId] || 0;
}
