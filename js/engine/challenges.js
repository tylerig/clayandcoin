// ============================================================
// CHALLENGES ENGINE
// ============================================================
import { S, save }      from './state.js';
import { CHALLENGES }   from '../data/challenges.js';
import { qOv }          from './overlays.js';

export function evalChallenge(ch) { return ch.check(S); }

export function isComplete(ch) {
  const { cur, tgt } = evalChallenge(ch);
  return cur >= tgt;
}

export function completedIds() { return S.completedChallenges || []; }

export function markDone(id) {
  if (!S.completedChallenges) S.completedChallenges = [];
  if (S.completedChallenges.includes(id)) return;
  S.completedChallenges.push(id);
  const ch = CHALLENGES.find(c => c.id === id);
  if (ch?.reward?.gold) S.gold += ch.reward.gold;
  save();
  qOv({ type: 'challenge', ch });
}

export function chkChallenges() {
  CHALLENGES.forEach(ch => {
    if (!completedIds().includes(ch.id) && isComplete(ch)) markDone(ch.id);
  });
}

export function challengeProgress() {
  const done = CHALLENGES.filter(ch => completedIds().includes(ch.id)).length;
  return { done, total: CHALLENGES.length };
}
