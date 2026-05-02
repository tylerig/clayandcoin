// ============================================================
// BUS — minimal event bus to decouple engine from UI
//
// Engine modules fire events; render.js subscribes.
// This breaks the circular dependency:
//   render.js → tabs/market.js → engine/market.js → render.js  ✗
//   render.js → tabs/market.js → engine/market.js → bus.js     ✓
// ============================================================

const _listeners = {};

export function on(event, fn) {
  (_listeners[event] = _listeners[event] || []).push(fn);
}

export function emit(event, payload) {
  (_listeners[event] || []).forEach(fn => fn(payload));
}
