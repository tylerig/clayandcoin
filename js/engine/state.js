// ============================================================
// STATE — single source of truth
//
// IMPORTANT: S is exported as a plain object and mutated in
// place everywhere. Never reassign S = something; always
// mutate its properties. This keeps the reference stable
// across all modules that import { S }.
// ============================================================
import { AUCTION_REFRESH_MS, GAMBLE_REFRESH_MS } from '../data/market.js';

export const SAVE_KEY = 'cc_v3';

// The single shared state object — mutated in place, never reassigned
export const S = {};

function freshValues() {
  return {
    gold: 10,
    digs: 0,
    sites: ['roman'],
    equip: [],
    asgn: {},
    active: {},
    inv: {},
    invC: {},       // condition counts: { itemId: { poor:0, fair:0, good:0, excellent:0 } }
    cl: {},
    sh: [],
    ch2: [],
    axp: {},
    ra: ['ada'],
    fl: [],
    completedChallenges: [],
    siteDigCounts: {},
    gambleCount: 0,
    auctionWins: 0,
    cardDraws: 0,
    pachinkoPlays: 0,
    prestige: 0,
    bonusLuck: 0,
    nextFieldEvent: null,
    lastSite: {},
    siteDepth: {},
    siteRecovery: {},
    activeResearch: null,
    authBonus: {},
    invAuth: {},
    settings: {},
    market: {
      auctionRefreshAt: Date.now() + AUCTION_REFRESH_MS,
      gambleRefreshAt:  Date.now() + GAMBLE_REFRESH_MS,
      auctions: null,
      gamble: null,
      cardDeck: null,
      cardDeckUsed: false,
      lottery: null,
    },
  };
}

/** Wipe S and reset to fresh values */
export function resetState() {
  const fresh = freshValues();
  // Clear all keys first
  Object.keys(S).forEach(k => delete S[k]);
  // Copy fresh values in
  Object.assign(S, fresh);
}

/** Load from localStorage into S (mutates in place) */
export function load(genAuction, genGambleState, genLotteryState) {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (saved) {
      Object.keys(S).forEach(k => delete S[k]);
      Object.assign(S, saved);
    } else {
      resetState();
    }
    // Migrations / defaults for older saves
    if (!S.siteDigCounts)       S.siteDigCounts = {};
    if (!S.ch2)                 S.ch2 = [];
    if (!S.completedChallenges) S.completedChallenges = [];
    if (!S.settings)            S.settings = {};
    if (!S.gambleCount)         S.gambleCount = 0;
    if (!S.auctionWins)         S.auctionWins = 0;
    if (!S.cardDraws)           S.cardDraws = 0;
    if (!S.pachinkoPlays)       S.pachinkoPlays = 0;
    if (!S.prestige)            S.prestige = 0;
    if (!S.bonusLuck)           S.bonusLuck = 0;
    if (!S.invC)                S.invC = {};
    if (!S.lastSite)            S.lastSite = {};
    if (!S.siteDepth)           S.siteDepth = {};
    if (!S.siteRecovery)        S.siteRecovery = {};
    if (!S.authBonus)           S.authBonus = {};
    if (!S.invAuth)             S.invAuth = {};
    if (!S.market) {
      S.market = {
        auctionRefreshAt: Date.now() + AUCTION_REFRESH_MS,
        gambleRefreshAt:  Date.now() + GAMBLE_REFRESH_MS,
        auctions: null, gamble: null,
        cardDeck: null, cardDeckUsed: false, lottery: null,
      };
    }
    if (S.market.cardDeckUsed === undefined) S.market.cardDeckUsed = false;
    // Refresh cycles that expired while away
    if (Date.now() >= S.market.auctionRefreshAt) {
      S.market.auctions        = genAuction();
      S.market.auctionRefreshAt = Date.now() + AUCTION_REFRESH_MS;
      S.market.cardDeck        = null;
      S.market.cardDeckUsed    = false;
      S.market.lottery         = genLotteryState();
    }
    if (Date.now() >= S.market.gambleRefreshAt) {
      S.market.gamble          = genGambleState();
      S.market.gambleRefreshAt  = Date.now() + GAMBLE_REFRESH_MS;
    }
    if (!S.market.auctions) S.market.auctions = genAuction();
    if (!S.market.gamble)   S.market.gamble   = genGambleState();
    if (!S.market.lottery)  S.market.lottery  = genLotteryState();
  } catch (e) {
    console.warn('Save load failed, using fresh state.', e);
    resetState();
  }
}

/** Persist S to localStorage */
export function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(S));
  } catch (e) {
    console.warn('Save failed.', e);
  }
}
