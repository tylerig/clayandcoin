// ============================================================
// SITE REPUTATION — depth tracking, drop modifiers, recovery
// ============================================================
import { S, save } from './state.js';
import { SITES }   from '../data/sites.js';
import { emit }    from './bus.js';

// Depth thresholds
export const DEPTH_TIERS = [
  { label: 'Fresh',      min: 0,  color: 'var(--teal)',        dropMod: 0    },
  { label: 'Established',min: 5,  color: 'var(--ink-mid)',     dropMod: 0.08 },
  { label: 'Deep',       min: 15, color: 'var(--accent-light)',dropMod: 0.18 },
  { label: 'Exhausted',  min: 30, color: 'var(--red)',         dropMod: 0.30 },
];

// Natural recovery — 1 depth point every 2 hours per site
const RECOVERY_MS = 2 * 60 * 60 * 1000;

export function getSiteDepth(siteId) {
  return (S.siteDepth || {})[siteId] || 0;
}

export function addSiteDepth(siteId, amount = 1) {
  if (!S.siteDepth) S.siteDepth = {};
  S.siteDepth[siteId] = (S.siteDepth[siteId] || 0) + amount;
}

export function depthTier(siteId) {
  const d = getSiteDepth(siteId);
  let tier = DEPTH_TIERS[0];
  for (const t of DEPTH_TIERS) { if (d >= t.min) tier = t; }
  return tier;
}

export function depthPct(siteId) {
  const d = getSiteDepth(siteId);
  const max = 40; // cap display at 40
  return Math.min(100, Math.round(d / max * 100));
}

/** Cost to restore a site to Fresh instantly */
export function restoreCost(siteId) {
  const d = getSiteDepth(siteId);
  if (d < 5)  return 0;
  if (d < 15) return 30;
  if (d < 30) return 80;
  return 160;
}

export function restoreSite(siteId) {
  const cost = restoreCost(siteId);
  if (S.gold < cost) return false;
  S.gold -= cost;
  if (!S.siteDepth) S.siteDepth = {};
  S.siteDepth[siteId] = 0;
  // Reset last recovery time
  if (!S.siteRecovery) S.siteRecovery = {};
  S.siteRecovery[siteId] = Date.now();
  save();
  emit('render');
  emit('updStats');
  return true;
}

/** Called every tick — recover depth naturally over time */
export function chkSiteRecovery() {
  if (!S.siteDepth) return;
  if (!S.siteRecovery) S.siteRecovery = {};
  const now = Date.now();
  let changed = false;
  SITES.forEach(site => {
    const depth = S.siteDepth[site.id] || 0;
    if (depth <= 0) return;
    const last = S.siteRecovery[site.id] || now;
    const elapsed = now - last;
    const recovered = Math.floor(elapsed / RECOVERY_MS);
    if (recovered > 0) {
      S.siteDepth[site.id] = Math.max(0, depth - recovered);
      S.siteRecovery[site.id] = last + recovered * RECOVERY_MS;
      changed = true;
    }
  });
  if (changed) { save(); emit('render'); }
}

/**
 * Applies depth modifier to drop weights.
 * At deep/exhausted: commons get a penalty, epics get a small bonus.
 * This makes deep sites less productive overall but relatively better for rares.
 */
export function applyDepthToWeights(weights, rarityOrder, siteId) {
  const d = getSiteDepth(siteId);
  if (d < 5) return weights; // Fresh — no effect

  const mod = depthTier(siteId).dropMod;
  return weights.map((w, i) => {
    const r = rarityOrder[i];
    if (r === 'common')   return Math.max(1, Math.round(w * (1 - mod)));
    if (r === 'uncommon') return Math.max(1, Math.round(w * (1 - mod * 0.4)));
    if (r === 'rare')     return Math.round(w * (1 + mod * 0.2));
    if (r === 'epic')     return Math.round(w * (1 + mod * 0.5));
    return w;
  });
}
