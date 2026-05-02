// ============================================================
// TAB — Challenges
// ============================================================
import { CHALLENGES } from '../../data/challenges.js';
import { evalChallenge, completedIds, challengeProgress } from '../../engine/challenges.js';
import { emit } from '../../engine/bus.js';

const CAT_ICONS = {
  'first steps': '✦',
  'field work':  '⛏',
  'collection':  '📜',
  'the team':    '👥',
  'economy':     '⚖',
  'workshop':    '🔨',
};

// Track which categories are open (default: all open)
const _open = {};

export function renderChallenges() {
  const done  = completedIds();
  const cats  = [...new Set(CHALLENGES.map(c => c.category))];
  const { done: dc, total } = challengeProgress();

  cats.forEach(c => { if (_open[c] === undefined) _open[c] = true; });

  let h = `
    <div class="invs">
      <div><div class="isv">${dc}</div><div class="isl">Completed</div></div>
      <div><div class="isv">${total - dc}</div><div class="isl">Remaining</div></div>
      <div><div class="isv">${Math.round(dc / total * 100)}%</div><div class="isl">Progress</div></div>
    </div>`;

  cats.forEach(cat => {
    const cc      = CHALLENGES.filter(c => c.category === cat);
    const catDone = cc.filter(c => done.includes(c.id)).length;
    const isOpen  = _open[cat];
    const allDone = catDone === cc.length;

    h += `
      <div class="ch-group${allDone ? ' ch-group-done' : ''}">
        <div class="ch-group-hd" onclick="window._toggleCat('${cat}')">
          <div class="ch-group-left">
            <span class="ch-group-icon">${CAT_ICONS[cat] || '·'}</span>
            <span class="ch-group-name">${cat}</span>
          </div>
          <div class="ch-group-right">
            <div class="ch-cat-bar">
              <div class="ch-cat-fill" style="width:${Math.round(catDone / cc.length * 100)}%"></div>
            </div>
            <span class="ch-group-count">${catDone}/${cc.length}</span>
            <span class="ch-group-arrow">${isOpen ? '▲' : '▼'}</span>
          </div>
        </div>
        ${isOpen ? `
          <div class="ch-group-body">
            ${cc.map(ch => {
              const isDone = done.includes(ch.id);
              const { cur, tgt } = evalChallenge(ch);
              const pct = Math.round(cur / tgt * 100);
              const rs  = ch.reward?.gold ? `+${ch.reward.gold}g` : '—';
              return `
                <div class="ch-row${isDone ? ' done' : ''}">
                  <div class="ch-check${isDone ? ' ch-check-done' : ''}"></div>
                  <div class="ch-body">
                    <div class="ch-desc${isDone ? ' done' : ''}">${ch.desc}</div>
                    ${!isDone ? `
                      <div class="ch-foot">
                        <div class="ch-miniprog"><div class="ch-minifill" style="width:${pct}%"></div></div>
                        <div class="ch-prog">${cur} / ${tgt}</div>
                      </div>` : ''}
                  </div>
                  <div class="ch-reward">${rs}</div>
                </div>`;
            }).join('')}
          </div>` : ''}
      </div>`;
  });
  return h;
}

window._toggleCat = (cat) => {
  _open[cat] = !_open[cat];
  emit('render');
};
