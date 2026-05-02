// ============================================================
// TAB — Market
// ============================================================
import { S }          from '../../engine/state.js';
import { ITEMS, RARITY_STAMP } from '../../data/items.js';
import { GAMBLE_TIERS, CARD_COST, CARD_DRAW_COUNT, LOTTERY_TICKET_COST, LOTTERY_MAX_TICKETS, PACHINKO_COST, PACHINKO_SLOTS } from '../../data/market.js';
import { pxImg }      from '../sprites.js';
import {
  submitBid, doGamble, doCardDraw, revealCard,
  buyLotteryTicket, drawLottery, doPachinko,
  buildPacSlots, fmtCountdown, genLotteryState, _pacResult,
} from '../../engine/market.js';

export function renderMarket() {
  const now    = Date.now();
  const aucMs  = Math.max(0, S.market.auctionRefreshAt - now);
  const gamMs  = Math.max(0, S.market.gambleRefreshAt  - now);
  const cardUsed = S.market.cardDeckUsed && (!S.market.cardDeck || S.market.cardDeck.every(c => c.revealed));
  const lot    = S.market.lottery || genLotteryState();
  let h = '';

  // ── Auction ───────────────────────────────────────────
  h += `
    <div class="mkt-header">
      <div class="mkt-title">Artifact Auction</div>
      <div class="mkt-timer" id="auc-timer">Refreshes in ${fmtCountdown(aucMs)}</div>
    </div>
    <div class="mkt-intro">Three lots are on offer. Submit a sealed bid — if you outbid the rival, the piece is yours.</div>
    <div class="auc-grid">`;

  S.market.auctions.forEach((auc, i) => {
    const item = ITEMS[auc.id];
    const cls  = auc.result === 'won' ? ' won' : auc.result === 'lost' ? ' lost' : '';
    h += `
      <div class="auc-card${cls}">
        <div style="display:flex;justify-content:center">${pxImg(auc.id, 32)}</div>
        <div class="auc-name">${item.name}</div>
        <div class="auc-meta">${item.collectionCategory} &nbsp;&middot;&nbsp; <span class="stamp ${RARITY_STAMP[item.rarity]}">${item.rarity}</span></div>
        <div class="auc-floor">Floor bid: ${auc.floor}g</div>`;
    if      (auc.result === 'won')  h += `<div class="auc-result win">Won for ${auc.playerBid}g.</div>`;
    else if (auc.result === 'lost') h += `<div class="auc-result lose">Outbid. Rival paid ${auc.rivalBid}g.</div>`;
    else h += `<div class="auc-input-row"><input class="auc-input" id="bid-input-${i}" type="number" min="${auc.floor}" placeholder="${auc.floor}g" ${S.gold < auc.floor ? 'disabled' : ''}><button class="jb2 pri" onclick="window._submitBid(${i})" ${S.gold < auc.floor ? 'disabled' : ''}>Bid</button></div>`;
    h += `</div>`;
  });
  h += `</div>`;

  // ── Relic Gamble ──────────────────────────────────────
  h += `
    <div class="mkt-header" style="margin-top:20px">
      <div class="mkt-title">The Relic Gamble</div>
      <div class="mkt-timer" id="gam-timer">Refreshes in ${fmtCountdown(gamMs)}</div>
    </div>
    <div class="mkt-intro">Pay to open a mystery container. Each tier only once per cycle.</div>
    <div class="gamble-tiers">`;

  GAMBLE_TIERS.forEach(tier => {
    const used      = S.market.gamble.used[tier.id];
    const canAfford = S.gold >= tier.cost;
    const disabled  = used || !canAfford;
    h += `
      <div class="gamble-card${disabled ? ' spent' : ''}" onclick="${disabled ? '' : `window._doGamble('${tier.id}')`}">
        <div class="gamble-name">${tier.name}</div>
        <div class="gamble-cost">${tier.cost}g</div>
        <div class="gamble-desc">${tier.desc}</div>
        <div style="margin-top:8px">
          ${used ? `<span class="stamp st">Opened</span>` : canAfford ? `<span class="stamp sa">${tier.pool.join(' / ')}</span>` : `<span class="stamp sg">Need ${tier.cost}g</span>`}
        </div>
      </div>`;
  });
  h += `</div>`;

  // ══ THE BACK ROOM ══════════════════════════════════════
  h += `
    <div class="backroom-wrap">
      <div class="backroom-header">
        <div style="display:flex;align-items:center;gap:3px">${Array(3).fill('<div style="width:8px;height:2px;background:var(--accent);opacity:0.6;border-radius:1px"></div>').join('')}</div>
        <div class="backroom-title">The Back Room</div>
        <div style="display:flex;align-items:center;gap:3px">${Array(3).fill('<div style="width:8px;height:2px;background:var(--accent);opacity:0.6;border-radius:1px"></div>').join('')}</div>
      </div>
      <div class="backroom-subtitle">Games of chance. Played at your own risk. You may win nothing at all.</div>`;

  // Card Draw
  h += `
    <div class="br-mkt-header">
      <div class="br-mkt-title">Provenance Card Draw</div>
      <div class="br-mkt-timer" id="br-card-timer">Refreshes in ${fmtCountdown(aucMs)}</div>
    </div>
    <div class="br-mkt-intro">Draw ${CARD_DRAW_COUNT} cards from the provenance deck. Reveal each one — some are finds, others are losses.</div>`;

  if (S.market.cardDeck?.length > 0) {
    h += `<div class="card-draw-area">`;
    S.market.cardDeck.forEach((card, i) => {
      if (card.revealed) {
        const tc = card.type === 'jackpot' ? 'var(--accent)' : card.type === 'win' ? 'var(--teal)' : card.type === 'minor' ? 'var(--ink-mid)' : 'var(--red)';
        h += `<div class="prov-card revealed" style="border-color:${tc};background:var(--paper-dark)">
          <div style="display:flex;justify-content:center;margin-bottom:6px">${pxImg('coin_ancient', 20)}</div>
          <div class="prov-card-name">${card.name}</div>
          <div class="prov-card-type" style="color:${tc}">${card.type}</div>
          <div class="prov-card-val ${card.type === 'loss' ? 'neg' : 'pos'}">${card.resultText || '—'}</div>
          <div style="font-family:var(--bf);font-size:9px;color:var(--ink-faint);font-style:italic;margin-top:4px;line-height:1.3">${card.flavour}</div>
        </div>`;
      } else {
        h += `<div class="prov-card" onclick="window._revealCard(${i})" style="background:var(--paper-darker);border-color:var(--accent-mid)">
          <div class="br-action-art">${pxImg('card_back', 32)}</div>
          <div style="font-family:var(--bf);font-size:10px;color:var(--line);font-style:italic">Tap to reveal</div>
        </div>`;
      }
    });
    h += `</div>`;
    if (cardUsed) h += `<div style="text-align:center;font-family:var(--bf);font-size:11px;color:var(--ink-faint);font-style:italic;margin-top:4px">All cards revealed. Draw again next cycle.</div>`;
  } else {
    h += `<div class="br-action-grid">
      <button class="br-action-btn ${cardUsed ? 'used' : ''}" onclick="${cardUsed ? '' : 'window._doCardDraw()'}" ${S.gold < CARD_COST ? 'disabled' : ''}>
        <div class="br-action-art">${pxImg('card_back', 40)}</div>
        <div class="br-action-name">Draw cards</div>
        <div class="br-action-cost">${CARD_COST}g</div>
        <div class="br-action-desc">${cardUsed ? 'Already drawn this cycle' : '3 cards, unknown outcomes'}</div>
      </button>
    </div>`;
  }

  h += `<div class="backroom-divider"></div>`;

  // Lottery
  h += `
    <div class="br-mkt-header">
      <div class="br-mkt-title">Antiquities Lottery</div>
      <div class="br-mkt-timer" id="br-lottery-timer">Refreshes in ${fmtCountdown(aucMs)}</div>
    </div>
    <div class="br-mkt-intro">Buy tickets for ${LOTTERY_TICKET_COST}g each. When you draw, one number wins. Most tickets lose.</div>`;

  if (!lot.winnerDrawn) {
    h += `<div class="br-action-grid">`;
    if (lot.tickets.length < LOTTERY_MAX_TICKETS) {
      h += `<button class="br-action-btn" onclick="window._buyLotteryTicket()" ${S.gold < LOTTERY_TICKET_COST ? 'disabled' : ''}>
        <div class="br-action-art">${pxImg('ticket', 40)}</div>
        <div class="br-action-name">Buy ticket</div>
        <div class="br-action-cost">${LOTTERY_TICKET_COST}g</div>
        <div class="br-action-desc">${lot.tickets.length}/${LOTTERY_MAX_TICKETS} purchased</div>
      </button>`;
    }
    if (lot.tickets.length > 0) {
      h += `<button class="br-action-btn" onclick="window._drawLottery()">
        <div class="br-action-art">${pxImg('token', 40)}</div>
        <div class="br-action-name">Draw now</div>
        <div class="br-action-cost">Free</div>
        <div class="br-action-desc">Reveal the winning number</div>
      </button>`;
    }
    h += `</div>`;
  }
  if (lot.tickets.length > 0) {
    h += `<div class="lottery-tickets">`;
    lot.tickets.forEach(n => {
      const isWin = lot.winnerDrawn && lot.winningNum === n;
      h += `<div class="lottery-ticket${isWin ? ' winner' : ' mine'}">#${n}</div>`;
    });
    if (lot.winnerDrawn && lot.winningNum !== null)
      h += `<div class="lottery-ticket" style="border-color:var(--ink-mid);color:var(--ink-mid)">Draw: #${lot.winningNum}</div>`;
    h += `</div>`;
    if (lot.winnerDrawn)
      h += `<div class="lottery-result" style="color:${lot.prize ? 'var(--teal)' : 'var(--red)'}">${lot.prize ? `Won! Prize: ${ITEMS[lot.prize]?.name}. Draw again next cycle.` : 'No match this cycle.'}</div>`;
  }

  h += `<div class="backroom-divider"></div>`;

  // Pachinko
  h += `
    <div class="br-mkt-header"><div class="br-mkt-title">Dig Pachinko</div></div>
    <div class="br-mkt-intro">Drop a token for ${PACHINKO_COST}g. Watch it fall through the strata. Where it lands is your find — or your loss. Unlimited plays.</div>
    <div class="pac-block">
      <canvas id="pac-canvas" width="280" height="140"></canvas>
      <div class="pac-slots" id="pac-slots">${PACHINKO_SLOTS.map(sl => `<div class="pac-slot">${sl.label}</div>`).join('')}</div>
    </div>
    <div class="pac-result" id="pac-result"></div>
    <div class="br-action-grid">
      <button class="br-action-btn" id="pac-btn" onclick="window._doPachinko()" ${S.gold < PACHINKO_COST ? 'disabled' : ''}>
        <div class="br-action-art">${pxImg('token', 40)}</div>
        <div class="br-action-name">Drop token</div>
        <div class="br-action-cost">${PACHINKO_COST}g per play</div>
        <div class="br-action-desc">Unlimited plays per cycle</div>
      </button>
    </div>`;

  h += `</div>`; // close backroom-wrap
  return h;
}

// After render, restore lit pachinko slot if a result exists
export function afterRenderMarket() {
  // _pacResult is imported from market engine
  // We need to re-import dynamically since it changes
  import('../../engine/market.js').then(m => {
    if (m._pacResult !== null) buildPacSlots(m._pacResult);
  });
}

// Globals
window._submitBid         = (i) => submitBid(i);
window._doGamble          = (id) => doGamble(id);
window._doCardDraw        = () => doCardDraw();
window._revealCard        = (i) => revealCard(i);
window._buyLotteryTicket  = () => buyLotteryTicket();
window._drawLottery       = () => drawLottery();
window._doPachinko        = () => doPachinko();
