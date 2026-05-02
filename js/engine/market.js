// ============================================================
// MARKET ENGINE — auction, gamble, card draw, lottery, pachinko
// ============================================================
import { S, save }       from './state.js';
import { ITEMS, RARITY_ORDER } from '../data/items.js';
import {
  GAMBLE_TIERS, CARD_DECK, CARD_COST, CARD_DRAW_COUNT,
  LOTTERY_TICKET_COST, LOTTERY_MAX_TICKETS, LOTTERY_PRIZE_POOL,
  PACHINKO_COST, PACHINKO_SLOTS, PACHINKO_WEIGHTS, PACHINKO_PEGS,
  AUCTION_REFRESH_MS, GAMBLE_REFRESH_MS,
} from '../data/market.js';
import {
  MARKET_OPENERS_WIN, MARKET_OPENERS_LOSE, GAMBLE_OPENERS,
} from '../data/narrative.js';
import { addItem, addLog } from './inventory.js';
import { chkChallenges }  from './challenges.js';
import { qOv }            from './overlays.js';
import { toast }          from '../ui/toast.js';
import { emit }           from './bus.js';

// ── Helpers ───────────────────────────────────────────────

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function allDroppableIds() {
  return Object.entries(ITEMS).filter(([, v]) => !v.craftable).map(([k]) => k);
}

// ── Generators (also used by state.js on load) ────────────

export function genAuction() {
  const pool = allDroppableIds();
  const picks = [];
  while (picks.length < 3) {
    const id = pool[Math.floor(Math.random() * pool.length)];
    if (!picks.includes(id)) picks.push(id);
  }
  return picks.map(id => {
    const item = ITEMS[id];
    const floor     = Math.max(5, Math.round(item.sellValue * 0.8));
    const rivalBid  = Math.round(item.sellValue * (0.9 + Math.random() * 0.6));
    return { id, floor, rivalBid, playerBid: null, result: null };
  });
}

export function genGambleState() {
  return { used: { small: false, medium: false, large: false } };
}

export function genLotteryState() {
  return { tickets: [], winnerDrawn: false, winningNum: null, prize: null };
}

export function fmtCountdown(ms) {
  if (ms <= 0) return 'refreshing soon';
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

// ── Market refresh ────────────────────────────────────────

export function chkMarketRefresh() {
  const now = Date.now();
  let changed = false;
  if (now >= S.market.auctionRefreshAt) {
    S.market.auctions         = genAuction();
    S.market.auctionRefreshAt = now + AUCTION_REFRESH_MS;
    S.market.cardDeck         = null;
    S.market.cardDeckUsed     = true;
    S.market.lottery          = genLotteryState();
    changed = true;
  }
  if (now >= S.market.gambleRefreshAt) {
    S.market.gamble          = genGambleState();
    S.market.gambleRefreshAt = now + GAMBLE_REFRESH_MS;
    changed = true;
  }
  if (changed) { save(); }
  return changed;
}

// ── Auction ───────────────────────────────────────────────

export function submitBid(idx) {
  const input = document.getElementById('bid-input-' + idx);
  if (!input) return;
  const bid = parseInt(input.value) || 0;
  const lot = S.market.auctions[idx];
  if (!lot || lot.result) return;
  if (bid < lot.floor) { toast(`Minimum bid is ${lot.floor}g.`); return; }
  if (bid > S.gold)    { toast('Not enough gold.'); return; }
  S.gold -= bid;
  lot.playerBid = bid;
  if (bid >= lot.rivalBid) {
    lot.result = 'won';
    addItem(lot.id, 1);
    S.auctionWins = (S.auctionWins || 0) + 1;
    addLog(pick(MARKET_OPENERS_WIN)(lot.id, bid), 'market');
    toast(`You won! The ${ITEMS[lot.id].name} is yours.`);
  } else {
    S.gold += bid;
    lot.result = 'lost';
    addLog(pick(MARKET_OPENERS_LOSE)(lot.rivalBid), 'market');
    toast(`Outbid. The rival paid ${lot.rivalBid}g.`);
  }
  save(); chkChallenges(); emit('render');
}

// ── Relic Gamble ──────────────────────────────────────────

export function doGamble(tierId) {
  const tier = GAMBLE_TIERS.find(t => t.id === tierId);
  if (!tier || S.market.gamble.used[tierId]) return;
  if (S.gold < tier.cost) { toast('Not enough gold.'); return; }
  S.gold -= tier.cost;
  S.market.gamble.used[tierId] = true;
  S.gambleCount = (S.gambleCount || 0) + 1;
  const pool   = Object.entries(ITEMS).filter(([, v]) => !v.craftable && tier.pool.includes(v.rarity)).map(([k]) => k);
  const itemId = pool[Math.floor(Math.random() * pool.length)];
  addItem(itemId, 1);
  addLog(pick(GAMBLE_OPENERS)(tier.name, ITEMS[itemId].name), 'market');
  save(); chkChallenges(); emit('render');
  qOv({ type: 'reveal', arch: { name: 'The Market' }, site: { name: tier.name }, loot: [itemId], tg: ITEMS[itemId].sellValue });
}

// ── Card Draw ─────────────────────────────────────────────

function genCardDeck() {
  const deck = [...CARD_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, CARD_DRAW_COUNT).map(c => ({ ...c, revealed: false }));
}

function applyCardEffect(effect) {
  if (effect === 'nothing') return { text: 'Nothing.' };
  if (effect.startsWith('gold:')) {
    const g = parseInt(effect.split(':')[1]);
    S.gold += g;
    return { text: g > 0 ? `+${g}g` : `${g}g` };
  }
  if (effect.startsWith('item:')) {
    const id = effect.split(':')[1];
    addItem(id, 1);
    return { text: `+${ITEMS[id]?.name || id}` };
  }
  return { text: 'Nothing.' };
}

export function doCardDraw() {
  const cardUsed = S.market.cardDeckUsed && (!S.market.cardDeck || S.market.cardDeck.every(c => c.revealed));
  if (cardUsed)           { toast('Already drew this cycle.'); return; }
  if (S.gold < CARD_COST) { toast(`Need ${CARD_COST}g.`); return; }
  S.gold -= CARD_COST;
  S.market.cardDeck     = genCardDeck();
  S.market.cardDeckUsed = false;
  S.cardDraws = (S.cardDraws || 0) + 1;
  save(); chkChallenges(); emit('render');
}

export function revealCard(idx) {
  if (!S.market.cardDeck) return;
  const card = S.market.cardDeck[idx];
  if (!card || card.revealed) return;
  card.revealed = true;
  const result = applyCardEffect(card.effect);
  card.resultText = result.text;
  if (S.market.cardDeck.every(c => c.revealed)) S.market.cardDeckUsed = true;
  addLog(`Drew a provenance card: <em>${card.name}</em>. ${result.text} <span class="lmkt">[Card Draw]</span>`, 'market');
  save(); chkChallenges(); emit('render');
}

// ── Lottery ───────────────────────────────────────────────

export function buyLotteryTicket() {
  if (!S.market.lottery) S.market.lottery = genLotteryState();
  if (S.market.lottery.winnerDrawn)                   { toast('Lottery already drawn this cycle.'); return; }
  if (S.market.lottery.tickets.length >= LOTTERY_MAX_TICKETS) { toast('Maximum tickets purchased.'); return; }
  if (S.gold < LOTTERY_TICKET_COST)                   { toast(`Need ${LOTTERY_TICKET_COST}g.`); return; }
  S.gold -= LOTTERY_TICKET_COST;
  const num = Math.floor(Math.random() * 99) + 1;
  S.market.lottery.tickets.push(num);
  save(); emit('render');
  toast(`Ticket #${num} purchased.`);
}

export function drawLottery() {
  if (!S.market.lottery?.tickets.length) { toast('Buy at least one ticket first.'); return; }
  if (S.market.lottery.winnerDrawn)      { toast('Already drawn this cycle.'); return; }
  const winner = Math.floor(Math.random() * 99) + 1;
  S.market.lottery.winningNum  = winner;
  S.market.lottery.winnerDrawn = true;
  const playerWon = S.market.lottery.tickets.includes(winner);
  if (playerWon) {
    const prizeId = LOTTERY_PRIZE_POOL[Math.floor(Math.random() * LOTTERY_PRIZE_POOL.length)];
    S.market.lottery.prize = prizeId;
    addItem(prizeId, 1);
    addLog(`Lottery draw: winning number ${winner}. We held that ticket! Prize: a <em>${ITEMS[prizeId]?.name}</em>. <span class="lmkt">[Lottery]</span>`, 'market');
    toast(`Lottery won! ${ITEMS[prizeId]?.name}`);
    qOv({ type: 'reveal', arch: { name: 'The Lottery' }, site: { name: 'Back Room' }, loot: [prizeId], tg: ITEMS[prizeId]?.sellValue || 0 });
  } else {
    S.market.lottery.prize = null;
    addLog(`Lottery draw: winning number ${winner}. No match. <span class="lmkt">[Lottery]</span>`, 'market');
    toast(`Lottery draw: #${winner}. No match.`);
  }
  save(); chkChallenges(); emit('render');
}

// ── Pachinko ──────────────────────────────────────────────

let _pacRunning = false, _pacAnim = null;
export let _pacResult = null;

export function buildPacSlots(litIdx = null) {
  const el = document.getElementById('pac-slots');
  if (!el) return;
  el.innerHTML = PACHINKO_SLOTS.map((sl, i) => {
    let cls = '';
    if (litIdx !== null && i === litIdx)
      cls = sl.type === 'jackpot' ? ' p-jackpot' : sl.type === 'loss' ? ' p-loss' : ' p-win';
    return `<div class="pac-slot${cls}">${sl.label}</div>`;
  }).join('');
}

export function doPachinko() {
  if (_pacRunning)          { toast('Ball still dropping.'); return; }
  if (S.gold < PACHINKO_COST) { toast(`Need ${PACHINKO_COST}g.`); return; }
  S.gold -= PACHINKO_COST;
  S.pachinkoPlays = (S.pachinkoPlays || 0) + 1;
  save(); chkChallenges(); emit('updStats');

  // Pick outcome
  const tot = PACHINKO_WEIGHTS.reduce((a, b) => a + b, 0);
  let v = Math.random() * tot, slotIdx = 0;
  for (let i = 0; i < PACHINKO_WEIGHTS.length; i++) { v -= PACHINKO_WEIGHTS[i]; if (v <= 0) { slotIdx = i; break; } }
  _pacResult = slotIdx;
  _pacRunning = true;

  buildPacSlots(); // clear previous lit
  const resEl = document.getElementById('pac-result');
  if (resEl) resEl.textContent = '';
  const btn = document.getElementById('pac-btn');
  if (btn) btn.disabled = true;

  const canvas = document.getElementById('pac-canvas');
  if (!canvas) { _pacRunning = false; finishPachinko(slotIdx); return; }

  const ctx = canvas.getContext('2d');
  const W = 280, H = 140, sw = W / PACHINKO_SLOTS.length;
  const targetX = sw * slotIdx + sw / 2;
  let bx = W / 2, by = 8, vx = 0, vy = 1.8, frame = 0;

  function step() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(154,136,96,0.7)';
    PACHINKO_PEGS.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); });

    const pull = (by / H) * 0.03;
    bx += (targetX - bx) * pull + vx;
    by += vy; vy += 0.14; vx *= 0.92;

    PACHINKO_PEGS.forEach(p => {
      const dx = bx - p.x, dy = by - p.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 9) { bx += dx / d * (9 - d); by += dy / d * (9 - d); vx += (dx / d) * 1.5 + (Math.random() - 0.5) * 1.2; vy = Math.abs(vy) * 0.7 + 0.5; }
    });
    if (bx < 6)     { bx = 6;     vx =  Math.abs(vx) * 0.6; }
    if (bx > W - 6) { bx = W - 6; vx = -Math.abs(vx) * 0.6; }

    ctx.fillStyle = '#5C3310';
    ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
    frame++;

    if (by < H - 14 && frame < 150) {
      _pacAnim = requestAnimationFrame(step);
    } else {
      cancelAnimationFrame(_pacAnim);
      _pacRunning = false;
      // Final draw
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(154,136,96,0.7)';
      PACHINKO_PEGS.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = '#5C3310';
      ctx.beginPath(); ctx.arc(sw * slotIdx + sw / 2, H - 10, 5, 0, Math.PI * 2); ctx.fill();
      // Light slot via direct DOM
      buildPacSlots(slotIdx);
      const b = document.getElementById('pac-btn'); if (b) b.disabled = false;
      finishPachinko(slotIdx);
    }
  }
  _pacAnim = requestAnimationFrame(step);
}

function finishPachinko(slotIdx) {
  const slot = PACHINKO_SLOTS[slotIdx];
  let resultText = 'Nothing.';
  if (slot.effect === 'nothing') {
    resultText = 'Nothing. The dust settles.';
  } else if (slot.effect.startsWith('gold:')) {
    const g = parseInt(slot.effect.split(':')[1]);
    S.gold += g; emit('updStats');
    resultText = `+${g}g`;
  } else if (slot.effect.startsWith('item:')) {
    const rarity = slot.effect.split(':')[1];
    const pool = Object.entries(ITEMS).filter(([, v]) => !v.craftable && v.rarity === rarity).map(([k]) => k);
    if (pool.length) {
      const id = pool[Math.floor(Math.random() * pool.length)];
      addItem(id, 1);
      resultText = `Found: ${ITEMS[id].name}`;
      if (rarity === 'rare' || rarity === 'epic')
        qOv({ type: 'reveal', arch: { name: 'Dig Pachinko' }, site: { name: 'Back Room' }, loot: [id], tg: ITEMS[id].sellValue });
    }
  }
  addLog(`Pachinko: ball landed on <em>${slot.label}</em>. ${resultText} <span class="lmkt">[Pachinko]</span>`, 'market');
  const resEl = document.getElementById('pac-result');
  if (resEl) {
    resEl.textContent = resultText;
    resEl.style.color = slot.type === 'loss' ? 'var(--red)' : slot.type === 'jackpot' ? 'var(--teal)' : 'var(--ink-mid)';
  }
  save(); chkChallenges();
}
