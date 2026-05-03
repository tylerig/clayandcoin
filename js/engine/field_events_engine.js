// ============================================================
// FIELD EVENTS ENGINE — schedules and fires between-dig events
// ============================================================
import { S, save }        from './state.js';
import { FIELD_EVENTS, FIELD_EVENT_MIN_MS, FIELD_EVENT_MAX_MS } from '../data/field_events.js';
import { emit, on }       from './bus.js';

function scheduleNext() {
  const delay = FIELD_EVENT_MIN_MS + Math.random() * (FIELD_EVENT_MAX_MS - FIELD_EVENT_MIN_MS);
  S.nextFieldEvent = Date.now() + delay;
}

export function initFieldEvents() {
  if (!S.nextFieldEvent) scheduleNext();
}

export function chkFieldEvent() {
  if (!S.nextFieldEvent || Date.now() < S.nextFieldEvent) return;
  scheduleNext();
  save();
  // Pick a random event
  const ev = FIELD_EVENTS[Math.floor(Math.random() * FIELD_EVENTS.length)];
  emit('fieldEvent', ev);
}

export function resolveFieldEvent(ev, choiceIdx) {
  const choice = ev.choices[choiceIdx];
  const result = choice.apply(S);
  save();
  emit('render');
  emit('updStats');
  return result;
}

// Listen for resolve requests from overlays.js (avoids circular dep)
on('resolveFieldEvent', ({ ev, choiceIdx, onResult }) => {
  const result = resolveFieldEvent(ev, choiceIdx);
  onResult(result);
});
