// ============================================================
// DIG — dispatch, collect, loot rolling, XP, recruiting
// ============================================================
import { S, save }           from './state.js';
import { ARCHS, XP_THRESH, MAX_SK } from '../data/archs.js';
import { SITES, EVENTS }     from '../data/sites.js';
import { ITEMS, dropWeight, RARITY_ORDER, CONDITIONS, CONDITION_MULT } from '../data/items.js';
import { EQUIP }             from '../data/items.js';
import { DIG_OPENERS, FIND_PHRASES } from '../data/narrative.js';
import { addItem, addLog }   from './inventory.js';
import { chkChallenges }     from './challenges.js';
import { qOv }               from './overlays.js';
import { toast }             from '../ui/toast.js';
import { emit }              from './bus.js';
import { currentTier }       from './prestige.js';

// ── Helpers ───────────────────────────────────────────────

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function digDuration(site) {
  return site.duration;
}

/** Duration in seconds accounting for equipped speed bonuses and penalties. Net reduction capped at 50%. */
export function calcDigDuration(archId, siteId) {
  const site = SITES.find(s => s.id === siteId) || { duration: 60 };
  const eq   = (S.asgn[archId] || []).map(eid => EQUIP.find(e => e.id === eid)).filter(Boolean);
  const netSpeed = eq.reduce((sum, e) => sum + (e.speedBonus || 0) - (e.speedPenalty || 0), 0);
  const clamped  = Math.max(-1.0, Math.min(0.5, netSpeed)); // max 50% faster, no cap on slower
  return Math.round(site.duration * (1 - clamped));
}

export function currentSkill(archId) {
  const base = ARCHS.find(a => a.id === archId)?.skill || 1;
  const xp   = S.axp[archId] || 0;
  let sk = base;
  for (let lv = base + 1; lv <= MAX_SK; lv++) if (xp >= XP_THRESH[lv]) sk = lv;
  return Math.min(sk, MAX_SK);
}

export function nextXPThreshold(archId) {
  const sk = currentSkill(archId);
  return sk >= MAX_SK ? null : XP_THRESH[sk + 1];
}

function addXP(archId, amount) {
  const before = currentSkill(archId);
  S.axp[archId] = (S.axp[archId] || 0) + amount;
  const after = currentSkill(archId);
  return after > before ? after : null;
}

export function calcLuck(archId, siteId) {
  const site = SITES.find(s => s.id === siteId);
  const eq   = (S.asgn[archId] || []).map(eid => EQUIP.find(e => e.id === eid)).filter(Boolean);
  const bonus = eq.reduce((sum, e) => sum + e.bonus, 0);
  const prestigeBonus = currentTier().bonus.luck || 0;
  const fieldBonus = S.bonusLuck || 0;
  return site.luck * (1 + bonus * 0.3) * (1 + (currentSkill(archId) - 1) * 0.25) + prestigeBonus + fieldBonus;
}

/** Roll a condition based on luck and an optional condition shift (-ve = worse, +ve = better) */
export function rollCondition(luck, condShift = 0) {
  const r = Math.random();
  // Build thresholds then shift them
  let thresholds;
  if (luck >= 3.5)      thresholds = [0.10, 0.25, 0.60]; // poor/fair/good/excellent
  else if (luck >= 2)   thresholds = [0.15, 0.40, 0.75];
  else                  thresholds = [0.25, 0.55, 0.85];

  // condShift moves thresholds — positive = harder to get poor, easier to get excellent
  const shift = condShift * 0.08;
  const [t1, t2, t3] = thresholds.map(t => Math.max(0, Math.min(1, t - shift)));

  if (r < t1) return 'poor';
  if (r < t2) return 'fair';
  if (r < t3) return 'good';
  return 'excellent';
}

export function rollLoot(luck, count, siteId, condShift = 0) {
  const byRarity = {};
  Object.entries(ITEMS).filter(([, v]) => !v.craftable).forEach(([key, v]) => {
    if (v.sites && !v.sites.includes(siteId)) return;
    (byRarity[v.rarity] = byRarity[v.rarity] || []).push(key);
  });
  RARITY_ORDER.forEach(r => { if (!byRarity[r]) byRarity[r] = byRarity['common'] || ['shard']; });

  return Array.from({ length: count }, () => {
    const weights = RARITY_ORDER.map(r => dropWeight(r, luck));
    const total   = weights.reduce((a, b) => a + b, 0);
    let v = Math.random() * total, chosen = RARITY_ORDER[0];
    RARITY_ORDER.forEach((r, i) => { v -= weights[i]; if (v <= 0 && chosen === RARITY_ORDER[0]) chosen = r; });
    const pool = byRarity[chosen] || byRarity['common'];
    const id = pool[Math.floor(Math.random() * pool.length)];
    return { id, condition: rollCondition(luck, condShift) };
  });
}

function rollRecruit(siteId) {
  return ARCHS.find(a => a.recruitSite === siteId && !S.ra.includes(a.id) && Math.random() < a.recruitChance) || null;
}

function buildLogEntry(arch, site, loot, ev) {
  const names  = [...new Set(loot.map(l => ITEMS[l.id]?.name || l.id))];
  const opener = pick(DIG_OPENERS)(arch.name, site.name);
  let findStr  = 'Nothing of note was recovered.';
  if (names.length === 1)
    findStr = pick(FIND_PHRASES)(`a ${names[0]}`);
  else if (names.length > 1)
    findStr = pick(FIND_PHRASES)(names.slice(0, -1).map(n => 'a ' + n).join(', ') + ' and a ' + names[names.length - 1]);
  let str = opener + ' ' + findStr;
  if (ev) str += ` <span class="lev">[${ev.title}]</span>`;
  return str;
}

// ── Actions ───────────────────────────────────────────────

export function dispatch(archId) {
  if (S.active[archId]) return;
  const sel = document.getElementById('sel-' + archId);
  if (!sel) return;
  const siteId = sel.value;
  if (!siteId) { toast('Select a dig site first.'); return; }
  const site = SITES.find(s => s.id === siteId);
  if (!site) return;
  const dur = calcDigDuration(archId, siteId);
  S.active[archId] = { site: siteId, start: Date.now(), end: Date.now() + dur * 1000 };
  save();
  emit('render');
}

export function collectDig(archId) {
  const dig  = S.active[archId];
  if (!dig) return;
  const arch = ARCHS.find(a => a.id === archId);
  const site = SITES.find(s => s.id === dig.site);
  const luck = calcLuck(archId, dig.site);
  const count = Math.max(1, Math.floor(luck + Math.random() * luck));

  // Gather double-edged equipment effects
  const eq         = (S.asgn[archId] || []).map(eid => EQUIP.find(e => e.id === eid)).filter(Boolean);
  const condShift  = eq.reduce((sum, e) => sum + (e.conditionBonus || 0), 0);
  const xpMult     = eq.reduce((sum, e) => sum + (e.xpBonus || 0), 0) || 1;
  const extraEvent = eq.reduce((sum, e) => sum + (e.eventChance || 0), 0);

  let loot = rollLoot(luck, count, dig.site, condShift);
  let ev   = null;
  const totalEventChance = extraEvent;
  for (const e of EVENTS) {
    if (Math.random() < e.chance + totalEventChance) { ev = e; break; }
  }
  if (ev) loot = ev.apply([...loot]);

  // Consume one-time field bonus luck (positive or negative — applies once then clears)
  if (S.bonusLuck !== 0) S.bonusLuck = 0;

  loot.forEach(({ id, condition }) => addItemWithCondition(id, condition));
  const xpEarned = Math.round((site.xp + Math.floor(loot.length * 1)) * xpMult);
  const newSkill = addXP(archId, xpEarned);
  const recruit  = rollRecruit(dig.site);

  if (recruit) {
    S.ra.push(recruit.id);
    addLog(`<em>${recruit.name}</em> was found at the ${site.name} and has joined the expedition. <span class="lrec">[New recruit]</span>`, 'recruit');
  }

  S.digs++;
  S.siteDigCounts = S.siteDigCounts || {};
  S.siteDigCounts[dig.site] = (S.siteDigCounts[dig.site] || 0) + 1;
  delete S.active[archId];

  save();
  addLog(buildLogEntry(arch, site, loot, ev), 'dig');
  chkChallenges();
  emit('render');
  emit('updCB');

  const totalGold = loot.reduce((sum, { id }) => (ITEMS[id]?.sellValue || 0) + sum, 0);
  if (ev)      qOv({ type: 'event',   ev, arch, site });
  if (recruit) qOv({ type: 'recruit', arch: recruit, site });
  qOv({ type: 'reveal', arch, site, loot, tg: totalGold });
  if (newSkill) qOv({ type: 'levelup', arch, sk: newSkill });
}

/** Add an item with a specific condition to inventory */
export function addItemWithCondition(id, condition) {
  addItem(id, 1);
  if (!S.invC[id]) S.invC[id] = { poor: 0, fair: 0, good: 0, excellent: 0 };
  S.invC[id][condition] = (S.invC[id][condition] || 0) + 1;
}

/** Process a dig that finished while the page was closed */
export function silentDig(archId) {
  const dig  = S.active[archId];
  if (!dig) return null;
  const arch = ARCHS.find(a => a.id === archId);
  const site = SITES.find(s => s.id === dig.site);
  const luck = calcLuck(archId, dig.site);
  const count = Math.max(1, Math.floor(luck + Math.random() * luck));
  const loot  = rollLoot(luck, count, dig.site);
  loot.forEach(({ id, condition }) => addItemWithCondition(id, condition));
  addXP(archId, site.xp + Math.floor(loot.length * 1));
  if (S.bonusLuck !== 0) S.bonusLuck = 0;

  const recruit = rollRecruit(dig.site);
  if (recruit) {
    S.ra.push(recruit.id);
    addLog(`<em>${recruit.name}</em> joined at the ${site.name}. <span class="lrec">[New recruit]</span>`, 'recruit');
  }

  S.digs++;
  S.siteDigCounts = S.siteDigCounts || {};
  S.siteDigCounts[dig.site] = (S.siteDigCounts[dig.site] || 0) + 1;
  delete S.active[archId];

  addLog(buildLogEntry(arch, site, loot, null), 'dig');
  chkChallenges();
  save();

  // Return a summary for the welcome-back notice in main.js
  return { arch, site, loot, recruit };
}

export function buySite(id, cost) {
  if (S.gold < cost) return;
  S.gold -= cost;
  S.sites.push(id);
  save(); chkChallenges(); emit('render');
  toast('New dig site unlocked.');
}

export function buyEquip(id, cost) {
  if (S.gold < cost) return;
  S.gold -= cost;
  S.equip.push(id);
  save(); emit('render');
  toast('Equipment acquired.');
}

export function assignEquip(equipId, archId) {
  Object.keys(S.asgn).forEach(a => {
    S.asgn[a] = (S.asgn[a] || []).filter(e => e !== equipId);
  });
  if (archId) {
    S.asgn[archId] = S.asgn[archId] || [];
    S.asgn[archId].push(equipId);
  }
  save(); emit('render');
}
