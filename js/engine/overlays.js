// ============================================================
// OVERLAYS — reveal, recruit, event, level-up, challenge
// ============================================================
import { S }             from './state.js';
import { ITEMS, RARITY_GLOW, RARITY_STAMP } from '../data/items.js';
import { SKILL_LABELS }  from '../data/archs.js';
import { px }            from '../ui/sprites.js';

const RECRUIT_GLOW = 'rgba(160,98,42,0.7)';

let _queue = [];

export function qOv(o)    { _queue.push(o); if (_queue.length === 1) _proc(); }
function nxtOv()           { _queue.shift(); _proc(); }
function _proc() {
  if (!_queue.length) { document.getElementById('op').innerHTML = ''; return; }
  const o = _queue[0];
  if      (o.type === 'reveal')    _showReveal(o);
  else if (o.type === 'recruit')   _showRecruit(o);
  else if (o.type === 'event')     _showEvent(o);
  else if (o.type === 'levelup')   _showLevelUp(o);
  else if (o.type === 'challenge') _showChallenge(o);
}

export function advOv() {
  const o = _queue[0];
  if (!o) { nxtOv(); return; }
  if (o.type === 'reveal') _showReveal(o);
  else nxtOv();
}

// ── Reveal ────────────────────────────────────────────────
function _showReveal(o) {
  if (o._i === undefined) o._i = 0;
  if (o._i >= o.loot.length) { nxtOv(); return; }
  const id     = o.loot[o._i];
  const item   = ITEMS[id];
  const isLast = o._i === o.loot.length - 1;
  const prior  = o.loot.slice(0, o._i).filter(x => x === id).length;
  const isNew  = (S.cl[id]?.tot || 0) - (o.loot.filter(x => x === id).length) + prior === 0;

  document.getElementById('op').innerHTML = `
    <div class="ov" onclick="if(event.target===this)window._advOv()">
      <div class="ob">
        <div class="rf">${o.arch.name} &nbsp;&middot;&nbsp; ${o.site.name}</div>
        <div class="ra">
          <div class="rg" style="box-shadow:0 0 50px 18px ${RARITY_GLOW[item.rarity]};background:${RARITY_GLOW[item.rarity]};"></div>
          <img src="${px(id, 80)}" width="80" height="80" style="image-rendering:pixelated;position:relative;z-index:1;">
        </div>
        <div class="rn">${item.name}</div>
        <div class="rr"><span class="stamp ${RARITY_STAMP[item.rarity]}">${item.rarity}</span></div>
        ${isNew ? `<div class="rnew">✦ First discovery</div>` : ''}
        <div class="rv">${item.flavour}</div>
        <div class="rm">Sell value: ${item.sellValue}g &nbsp;&middot;&nbsp; ${item.collectionCategory}</div>
        <button class="jb2 pri" style="width:100%;margin-top:4px" onclick="window._advOv()">${isLast ? 'Close' : 'Next &rarr;'}</button>
        <div class="rc">${o._i + 1} of ${o.loot.length} &nbsp;&middot;&nbsp; +${o.tg}g total</div>
      </div>
    </div>`;
  o._i++;
}

// ── Recruit ───────────────────────────────────────────────
function _showRecruit(o) {
  const arch = o.arch, site = o.site;
  document.getElementById('op').innerHTML = `
    <div class="ov">
      <div class="ob rec">
        <div class="rf">${site.name}</div>
        <div class="ra">
          <div class="rg" style="box-shadow:0 0 60px 20px ${RECRUIT_GLOW};background:${RECRUIT_GLOW};"></div>
          <img src="${px(arch.id, 80)}" width="80" height="80" style="image-rendering:pixelated;position:relative;z-index:1;">
        </div>
        <div class="recb">New Recruit</div>
        <div class="rn">${arch.name}</div>
        <div class="reci">${arch.recruitIntro}</div>
        <div class="recsk">Skill: ${SKILL_LABELS[arch.skill]} (${arch.skill}) &nbsp;&middot;&nbsp; ${arch.role}</div>
        <button class="jb2 pri" style="width:100%" onclick="window._advOv()">Welcome to the team</button>
      </div>
    </div>`;
}

// ── Event ─────────────────────────────────────────────────
function _showEvent(o) {
  document.getElementById('op').innerHTML = `
    <div class="ov" onclick="if(event.target===this)window._advOv()">
      <div class="ob">
        <div class="ei">${o.ev.icon}</div>
        <div class="et">${o.ev.title}</div>
        <div class="eb">${o.ev.desc(o.arch, o.site)}</div>
        <button class="jb2 pri" style="width:100%" onclick="window._advOv()">Continue</button>
      </div>
    </div>`;
}

// ── Level up ──────────────────────────────────────────────
function _showLevelUp(o) {
  document.getElementById('op').innerHTML = `
    <div class="ov">
      <div class="ob">
        <div style="display:flex;justify-content:center;margin-bottom:14px">
          <img src="${px(o.arch.id, 56)}" width="56" height="56" style="image-rendering:pixelated;">
        </div>
        <div class="lvlt">Level Up!</div>
        <div class="lvls">${o.arch.name} has reached<br><strong>${SKILL_LABELS[o.sk]}</strong> (Skill ${o.sk})</div>
        <button class="jb2 pri" style="width:100%" onclick="window._advOv()">Excellent</button>
      </div>
    </div>`;
}

// ── Challenge complete ────────────────────────────────────
function _showChallenge(o) {
  const ch = o.ch;
  const rs = ch.reward?.gold ? `+${ch.reward.gold}g` : '';
  document.getElementById('op').innerHTML = `
    <div class="ov">
      <div class="ob">
        <div class="ch-complete-icon">✦</div>
        <div class="ch-complete-title">Challenge complete</div>
        <div class="ch-complete-body">"${ch.desc}"</div>
        ${rs ? `<div style="font-family:var(--tf);font-size:14px;color:var(--accent);margin-bottom:18px">${rs} added to your purse.</div>` : ''}
        <button class="jb2 pri" style="width:100%" onclick="window._advOv()">Noted</button>
      </div>
    </div>`;
}

// Expose advOv globally so inline onclick handlers can call it
window._advOv = advOv;
