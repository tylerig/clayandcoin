// ============================================================
// OVERLAYS — reveal, recruit, event, level-up, challenge
// ============================================================
import { S }             from './state.js';
import { ITEMS, RARITY_GLOW, RARITY_STAMP, CONDITION_COLOR, CONDITION_LABEL } from '../data/items.js';
import { SKILL_LABELS }  from '../data/archs.js';
import { px }            from '../ui/sprites.js';
import { resolveFieldEvent } from './field_events_engine.js';
import { on }            from './bus.js';

const RECRUIT_GLOW = 'rgba(160,98,42,0.7)';

let _queue = [];

export function qOv(o)    { _queue.push(o); if (_queue.length === 1) _proc(); }
function nxtOv()           { _queue.shift(); _proc(); }
function _proc() {
  if (!_queue.length) { document.getElementById('op').innerHTML = ''; return; }
  const o = _queue[0];
  if      (o.type === 'reveal')     _showReveal(o);
  else if (o.type === 'recruit')    _showRecruit(o);
  else if (o.type === 'event')      _showEvent(o);
  else if (o.type === 'levelup')    _showLevelUp(o);
  else if (o.type === 'challenge')  _showChallenge(o);
  else if (o.type === 'fieldEvent') _showFieldEvent(o);
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
  const { id, condition } = o.loot[o._i];
  const item   = ITEMS[id];
  const isLast = o._i === o.loot.length - 1;
  const prior  = o.loot.slice(0, o._i).filter(x => x.id === id).length;
  const isNew  = (S.cl[id]?.tot || 0) - (o.loot.filter(x => x.id === id).length) + prior === 0;
  const condColor = CONDITION_COLOR[condition] || 'var(--ink-mid)';
  const condLabel = CONDITION_LABEL[condition] || condition;

  document.getElementById('op').innerHTML = `
    <div class="ov" onclick="if(event.target===this)window._advOv()">
      <div class="ob">
        <div class="rf">${o.arch.name} &nbsp;&middot;&nbsp; ${o.site.name}</div>
        <div class="ra">
          <div class="rg" style="box-shadow:0 0 50px 18px ${RARITY_GLOW[item.rarity]};background:${RARITY_GLOW[item.rarity]};"></div>
          <img src="${px(id, 80)}" width="80" height="80" style="image-rendering:pixelated;position:relative;z-index:1;">
        </div>
        <div class="rn">${item.name}</div>
        <div class="rr">
          <span class="stamp ${RARITY_STAMP[item.rarity]}">${item.rarity}</span>
          &nbsp;
          <span style="font-family:var(--bf);font-size:11px;font-style:italic;color:${condColor}">${condLabel} condition</span>
        </div>
        ${isNew ? `<div class="rnew">✦ First discovery</div>` : ''}
        <div class="rv">${item.flavour}</div>
        <div class="rm">Est. value: ${Math.round(item.sellValue * (CONDITION_COLOR[condition] ? ({poor:0.5,fair:0.8,good:1.0,excellent:1.3}[condition]) : 1))}g &nbsp;&middot;&nbsp; ${item.collectionCategory}</div>
        <button class="jb2 pri" style="width:100%;margin-top:4px" onclick="window._advOv()">${isLast ? 'Close' : 'Next &rarr;'}</button>
        <div class="rc">${o._i + 1} of ${o.loot.length} &nbsp;&middot;&nbsp; est. +${o.tg}g total</div>
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
        <button class="jb2 pri" style="width:100%" onclick="window._advOv()">Noted</button>
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

// ── Field Event ───────────────────────────────────────────
function _showFieldEvent(o) {
  const ev = o.ev;
  const body = ev.body({});
  document.getElementById('op').innerHTML = `
    <div class="ov" onclick="if(event.target===this){}">
      <div class="ob" style="text-align:left;max-width:340px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--line)">
          <span style="font-size:22px;line-height:1">${ev.icon}</span>
          <div style="font-family:var(--tf);font-size:16px;font-weight:500;color:var(--ink)">${ev.title}</div>
        </div>
        <div style="font-family:var(--bf);font-size:13px;color:var(--ink-mid);font-style:italic;line-height:1.65;margin-bottom:20px">${body}</div>
        <div style="display:flex;flex-direction:column;gap:8px" id="fev-choices">
          ${ev.choices.map((c, i) => `<button class="jb2" style="text-align:left;font-style:normal" onclick="window._resolveFieldEvent(${i})">${c.label}</button>`).join('')}
        </div>
      </div>
    </div>`;
  window._currentFieldEvent = ev;
}

// ── Welcome back ──────────────────────────────────────────
export function showWelcomeBack(returned, ITEMS) {
  const op = document.getElementById('op');
  if (!op || !returned.length) return;

  const lines = returned.map(({ arch, site, loot }) => {
    const counts = {};
    loot.forEach(({ id }) => { counts[id] = (counts[id] || 0) + 1; });
    const summary = Object.entries(counts)
      .map(([id, n]) => {
        const name = ITEMS[id]?.name || id.replace(/_/g, ' ');
        return n > 1 ? `${n}× ${name}` : name;
      })
      .join(', ');
    return { archName: arch.name, siteName: site.name, summary };
  });

  const recruits   = returned.filter(r => r.recruit).map(r => r.recruit.name);
  const totalItems = returned.reduce((s, r) => s + r.loot.length, 0);

  op.innerHTML = `
    <div class="ov" onclick="if(event.target===this){this.innerHTML=''}">
      <div class="ob" style="max-width:340px;text-align:left">
        <div style="font-family:var(--tf);font-size:18px;font-weight:500;color:var(--accent);margin-bottom:4px">Welcome back.</div>
        <div style="font-family:var(--bf);font-size:12px;color:var(--ink-faint);font-style:italic;margin-bottom:18px;border-bottom:1px solid var(--line);padding-bottom:12px">
          The team kept working while you were away.
        </div>
        ${lines.map(l => `
          <div style="margin-bottom:12px">
            <div style="font-family:var(--tf);font-size:13px;font-weight:500;color:var(--ink)">${l.archName}</div>
            <div style="font-family:var(--bf);font-size:11px;color:var(--ink-faint);font-style:italic;margin-bottom:3px">returned from ${l.siteName}</div>
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
}
window._resolveFieldEvent = (choiceIdx) => {
  const ev = window._currentFieldEvent;
  if (!ev) return;
  const result = resolveFieldEvent(ev, choiceIdx);
  document.getElementById('op').innerHTML = `
    <div class="ov" onclick="if(event.target===this){this.innerHTML=''}">
      <div class="ob" style="text-align:left;max-width:340px">
        <div style="font-family:var(--tf);font-size:15px;font-weight:500;color:var(--ink);margin-bottom:12px">${ev.title}</div>
        <div style="font-family:var(--bf);font-size:13px;color:var(--ink-mid);font-style:italic;line-height:1.65;margin-bottom:20px">${result}</div>
        <button class="jb2 pri" style="width:100%" onclick="document.getElementById('op').innerHTML='';window._currentFieldEvent=null">Continue</button>
      </div>
    </div>`;
};

// Listen for field events fired by the engine tick
on('fieldEvent', (ev) => {
  // Only show if no other overlay is currently queued
  if (_queue.length === 0 && document.getElementById('op').innerHTML === '') {
    document.getElementById('op').innerHTML = '';
    _showFieldEvent({ type: 'fieldEvent', ev });
  }
});
