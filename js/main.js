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

// Initial render
render();
updCB();

// Show welcome-back notice after a short delay (so the page has painted)
if (_returned.length > 0) {
  setTimeout(() => {
    const op = document.getElementById('op');
    if (!op) return;

    // Build item list across all returning digs
    const lines = _returned.map(({ arch, site, loot }) => {
      const counts = {};
      loot.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
      const summary = Object.entries(counts)
        .map(([id, n]) => {
          const name = ITEMS[id]?.name || id.replace(/_/g, ' ');
          return n > 1 ? `${n}× ${name}` : name;
        })
        .join(', ');
      return { arch: arch.name, site: site.name, summary };
    });

    const recruits = _returned.filter(r => r.recruit).map(r => r.recruit.name);
    const totalItems = _returned.reduce((s, r) => s + r.loot.length, 0);

    op.innerHTML = `
      <div class="ov" onclick="if(event.target===this){this.innerHTML=''}">
        <div class="ob" style="max-width:340px;text-align:left">
          <div style="font-family:var(--tf);font-size:18px;font-weight:500;color:var(--accent);margin-bottom:4px">Welcome back.</div>
          <div style="font-family:var(--bf);font-size:12px;color:var(--ink-faint);font-style:italic;margin-bottom:18px;border-bottom:1px solid var(--line);padding-bottom:12px">
            The team kept working while you were away.
          </div>
          ${lines.map(l => `
            <div style="margin-bottom:12px">
              <div style="font-family:var(--tf);font-size:13px;font-weight:500;color:var(--ink)">${l.arch}</div>
              <div style="font-family:var(--bf);font-size:11px;color:var(--ink-faint);font-style:italic;margin-bottom:3px">returned from ${l.site}</div>
              <div style="font-family:var(--bf);font-size:12px;color:var(--ink-mid)">Found: ${l.summary}</div>
            </div>`).join('')}
          ${recruits.length ? `
            <div style="margin-top:4px;padding-top:12px;border-top:1px solid var(--line);font-family:var(--bf);font-size:12px;color:var(--teal);font-style:italic">
              ✦ New recruit${recruits.length > 1 ? 's' : ''}: ${recruits.join(', ')}
            </div>` : ''}
          <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--line);font-family:var(--bf);font-size:11px;color:var(--ink-faint);font-style:italic;margin-bottom:16px">
            ${totalItems} item${totalItems !== 1 ? 's' : ''} added to your inventory.
          </div>
          <button class="jb2 pri" style="width:100%" onclick="document.getElementById('op').innerHTML=''">Continue</button>
        </div>
      </div>`;
  }, 300);
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
