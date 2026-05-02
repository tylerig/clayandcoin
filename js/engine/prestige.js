// ============================================================
// PRESTIGE — expedition reputation meter
// ============================================================
import { S } from './state.js';

export const PRESTIGE_TIERS = [
  { label: 'Unknown',       min: 0,    bonus: { luck: 0,    recruitChance: 0    } },
  { label: 'Local',         min: 100,  bonus: { luck: 0.05, recruitChance: 0.002 } },
  { label: 'Regional',      min: 400,  bonus: { luck: 0.1,  recruitChance: 0.004 } },
  { label: 'National',      min: 1000, bonus: { luck: 0.18, recruitChance: 0.007 } },
  { label: 'International', min: 2500, bonus: { luck: 0.28, recruitChance: 0.012 } },
];

export function getPrestige() {
  return S.prestige || 0;
}

export function addPrestige(amount) {
  S.prestige = (S.prestige || 0) + amount;
}

export function currentTier() {
  let tier = PRESTIGE_TIERS[0];
  for (const t of PRESTIGE_TIERS) { if (getPrestige() >= t.min) tier = t; }
  return tier;
}

export function nextTier() {
  const p = getPrestige();
  return PRESTIGE_TIERS.find(t => t.min > p) || null;
}

export function prestigePct() {
  const tier = currentTier();
  const next = nextTier();
  if (!next) return 100;
  return Math.min(100, Math.round((getPrestige() - tier.min) / (next.min - tier.min) * 100));
}

// Called whenever items are sold — prestige grows from legitimate sales
export function onSale(goldEarned) {
  // Prestige grows slowly from sales — roughly 1 prestige per 8g sold
  addPrestige(Math.floor(goldEarned / 8));
}
