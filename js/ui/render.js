// ============================================================
// RENDER — main loop, tab switching, stat updates
// ============================================================
import { S }               from '../engine/state.js';
import { chkMarketRefresh } from '../engine/market.js';
import { challengeProgress } from '../engine/challenges.js';
import { digDuration }     from '../engine/dig.js';
import { SITES }           from '../data/sites.js';
import { on }              from '../engine/bus.js';
import { currentTier, nextTier, prestigePct, getPrestige } from '../engine/prestige.js';
import { chkFieldEvent }   from '../engine/field_events_engine.js';
import { chkSiteRecovery } from '../engine/site_reputation.js';
import { collectResearch } from '../engine/provenance.js';

import { renderTeam }       from './tabs/team.js';
import { renderSites }      from './tabs/sites.js';
import { renderInventory }  from './tabs/inventory.js';
import { renderCollection } from './tabs/collection.js';
import { renderCraft }      from './tabs/craft.js';
import { renderMarket, afterRenderMarket } from './tabs/market.js';
import { renderChallenges } from './tabs/challenges.js';
import { renderFieldNotes } from './tabs/fieldnotes.js';
import { renderSupplies }   from './tabs/supplies.js';
import { buildPacSlots }    from '../engine/market.js';

const TABS = ['team','sites','inv','clog','craft','mkt','ch','flog','sup'];
const LABELS = {
  team: 'Field team', sites: 'Known sites', inv: 'Inventory ledger',
  clog: 'Collection log', craft: 'Workshop', mkt: 'Market',
  ch: 'Challenges', flog: 'Field notes', sup: 'Supply depot',
};
const RENDERERS = {
  team: renderTeam, sites: renderSites, inv: renderInventory,
  clog: renderCollection, craft: renderCraft, mkt: renderMarket,
  ch: renderChallenges, flog: renderFieldNotes, sup: renderSupplies,
};

export let currentTab = 'team';
let _snap = '';

export function sw(name) {
  currentTab = name;
  document.querySelectorAll('.nt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === name);
  });
  render();
}

export function updStats() {
  document.getElementById('gv').textContent = S.gold;
  document.getElementById('av').textContent = Object.values(S.inv).reduce((a, b) => a + b, 0);
  document.getElementById('dv').textContent = S.digs;
  // Update prestige meter
  const tier = currentTier();
  const next = nextTier();
  const pv = document.getElementById('prestige-val'); if (pv) pv.textContent = tier.label;
  const pf = document.getElementById('prestige-fill'); if (pf) pf.style.width = prestigePct() + '%';
  const pt = document.getElementById('prestige-tip'); if (pt) pt.textContent = next ? `${getPrestige()}/${next.min} rep` : 'Max';
}

export function updCB() {
  const { done, total } = challengeProgress();
  const pct = Math.round(done / total * 100);
  const sf = document.getElementById('sf'); if (sf) sf.style.width = pct + '%';
  const sg = document.getElementById('sg'); if (sg) sg.textContent = `${done}/${total}`;
}

function fmtCountdown(ms) {
  if (ms <= 0) return 'refreshing soon';
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export function render() {
  updStats();
  updCB();
  const body = document.getElementById('jb');
  body.innerHTML = `<div class="sr"><span class="srl">${LABELS[currentTab]}</span><div class="srr"></div></div>` + RENDERERS[currentTab]();
  _snap = JSON.stringify(S.active);
  // Post-render hooks
  if (currentTab === 'mkt') afterRenderMarket();
}

export function tick() {
  updStats();
  const changed = chkMarketRefresh();
  if (changed && currentTab === 'mkt') { render(); return; }
  chkFieldEvent();
  chkSiteRecovery();
  // Check if active research has completed
  if (S.activeResearch && Date.now() >= S.activeResearch.end) {
    const result = collectResearch();
    if (result) render();
  }

  const now = Date.now();
  let needsRender = false;

  Object.keys(S.active).forEach(id => {
    const dig = S.active[id];
    if (!dig) return;
    if (dig.end <= now) { needsRender = true; return; }
    const pf = document.getElementById('pf-' + id);
    const dt = document.getElementById('dt-' + id);
    if (pf) pf.style.width = Math.min(100, Math.round((now - dig.start) / (dig.end - dig.start) * 100)) + '%';
    if (dt) dt.textContent = (() => {
      const s = Math.max(0, Math.floor((dig.end - now) / 1000));
      return s >= 60 ? Math.floor(s / 60) + 'm ' + (s % 60) + 's' : s + 's';
    })() + ' remaining';
  });

  if (JSON.stringify(S.active) !== _snap) needsRender = true;
  if (needsRender) render();

  // Update research bar and countdown in-place if on craft tab
  if (currentTab === 'craft' && S.activeResearch && Date.now() < S.activeResearch.end) {
    const rb = document.getElementById('research-bar');
    const rc = document.getElementById('research-countdown');
    const now2 = Date.now();
    if (rb) {
      const pct = Math.round((now2 - S.activeResearch.start) / (S.activeResearch.end - S.activeResearch.start) * 100);
      rb.style.width = pct + '%';
    }
    if (rc) {
      const s = Math.max(0, Math.floor((S.activeResearch.end - now2) / 1000));
      rc.textContent = s >= 60 ? Math.floor(s / 60) + 'm ' + (s % 60) + 's' : s + 's';
    }
  }
  if (currentTab === 'mkt') {
    const aucMs = Math.max(0, S.market.auctionRefreshAt - now);
    const gamMs = Math.max(0, S.market.gambleRefreshAt  - now);
    const at = document.getElementById('auc-timer');       if (at) at.textContent = `Refreshes in ${fmtCountdown(aucMs)}`;
    const gt = document.getElementById('gam-timer');       if (gt) gt.textContent = `Refreshes in ${fmtCountdown(gamMs)}`;
    const ct = document.getElementById('br-card-timer');   if (ct) ct.textContent = `Refreshes in ${fmtCountdown(aucMs)}`;
    const lt = document.getElementById('br-lottery-timer');if (lt) lt.textContent = `Refreshes in ${fmtCountdown(aucMs)}`;
  }
}

// ── Bus subscriptions — engine → UI ──────────────────────
on('render',   () => render());
on('updStats', () => updStats());
on('updCB',    () => updCB());
