// ============================================================
// MAIN — entry point
// Imports everything, wires up events, starts the game loop.
// ============================================================
import { S, load, save }   from './engine/state.js';
import { genAuction, genGambleState, genLotteryState } from './engine/market.js';
import { silentDig }       from './engine/dig.js';
import { chkChallenges }   from './engine/challenges.js';
import { render, tick, sw, updCB } from './ui/render.js';
import { openSettings }    from './ui/settings.js';
import { ITEMS }           from './data/items.js';
import { initFieldEvents } from './engine/field_events_engine.js';
import { showWelcomeBack } from './engine/overlays.js';
import { ITEMS }           from './data/items.js';

// ── Boot ──────────────────────────────────────────────────

// Load saved state (pass generators so state.js doesn't need to import market)
load(genAuction, genGambleState, genLotteryState);

// Process any digs that finished while the page was closed
const _returned = [];
Object.keys(S.active).forEach(id => {
  if (S.active[id] && S.active[id].end <= Date.now()) {
    const summary = silentDig(id);
    if (summary) _returned.push(summary);
  }
});
save();

// Check for challenge completions from loaded state
chkChallenges();

// Init field event scheduler
initFieldEvents();

// Initial render
render();
updCB();

// Show welcome-back notice after a short delay (so the page has painted)
if (_returned.length > 0) {
  setTimeout(() => showWelcomeBack(_returned, ITEMS), 300);
}

// ── Spine dots ────────────────────────────────────────────
document.getElementById('sd').innerHTML =
  Array.from({ length: 14 }, () => '<div class="sd-dot"></div>').join('');

// ── Nav tab buttons ───────────────────────────────────────
document.querySelectorAll('.nt').forEach(btn => {
  btn.addEventListener('click', () => sw(btn.dataset.tab));
});

// ── Settings gear button ──────────────────────────────────
document.getElementById('gear-btn').addEventListener('click', openSettings);

// ── Game loop ─────────────────────────────────────────────
setInterval(tick, 1000);
