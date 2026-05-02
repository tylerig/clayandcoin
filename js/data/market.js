// ============================================================
// MARKET DATA — gamble tiers, card deck, pachinko, lottery
// ============================================================

export const AUCTION_REFRESH_MS = 10 * 60 * 1000;
export const GAMBLE_REFRESH_MS  =  5 * 60 * 1000;

export const GAMBLE_TIERS = [
  { id: 'small',  name: 'Mystery pouch', cost: 10, desc: 'A cloth bag, contents rattling.',        pool: ['common', 'uncommon'] },
  { id: 'medium', name: 'Sealed crate',  cost: 30, desc: 'A wooden box from a recent excavation.', pool: ['uncommon', 'rare'] },
  { id: 'large',  name: 'Iron coffer',   cost: 75, desc: 'Heavy, locked, promising.',              pool: ['rare', 'epic'] },
];

export const CARD_DECK = [
  { id: 'cursed',     name: 'Cursed Relic',     type: 'loss',    flavour: 'It crumbles to dust. The cost of hubris.',      effect: 'gold:-30' },
  { id: 'empty',      name: 'Empty Tomb',        type: 'loss',    flavour: 'Nothing but dust and disappointment.',          effect: 'nothing' },
  { id: 'forgery',    name: 'Known Forgery',     type: 'loss',    flavour: 'The dealer knew. You paid anyway.',            effect: 'gold:-15' },
  { id: 'dust',       name: 'Bag of Dust',       type: 'loss',    flavour: 'Sand from an uncertain provenance. Worthless.', effect: 'nothing' },
  { id: 'shard_c',    name: 'Pottery Shard',     type: 'minor',   flavour: 'A common find, at least.',                     effect: 'item:shard' },
  { id: 'coin_c',     name: 'Ancient Coin',      type: 'minor',   flavour: 'Old money, always welcome.',                   effect: 'item:coin_ancient' },
  { id: 'gold_sm',    name: 'Hidden Cache',      type: 'minor',   flavour: 'A small purse, forgotten in the lining.',      effect: 'gold:20' },
  { id: 'gold_md',    name: "Dealer's Error",    type: 'win',     flavour: 'You spotted the mistake before they did.',     effect: 'gold:40' },
  { id: 'figurine_c', name: 'Clay Figurine',     type: 'minor',   flavour: 'Uncommon enough to feel like a find.',         effect: 'item:figurine' },
  { id: 'jewel_c',    name: 'Loose Gemstone',    type: 'win',     flavour: 'Fell from a setting long ago.',                effect: 'item:jewel' },
  { id: 'scroll_c',   name: 'Fragment of Scroll',type: 'win',     flavour: 'Partial, but legible.',                        effect: 'item:scroll' },
  { id: 'gold_lg',    name: 'Misattributed Lot', type: 'win',     flavour: 'A valuation error works in your favour.',      effect: 'gold:80' },
  { id: 'statue_c',   name: 'Bronze Fragment',   type: 'jackpot', flavour: 'A small miracle. Authenticated on the spot.',  effect: 'item:statue' },
  { id: 'crown_c',    name: 'The Lost Crown',    type: 'jackpot', flavour: 'Rumoured lost for centuries. Here it is.',     effect: 'item:crown' },
];
export const CARD_COST       = 20;
export const CARD_DRAW_COUNT = 3;

export const LOTTERY_TICKET_COST  = 5;
export const LOTTERY_MAX_TICKETS  = 5;
export const LOTTERY_PRIZE_POOL   = ['jewel', 'scroll', 'statue', 'crown', 'astrolabe', 'codex_illum'];

export const PACHINKO_COST = 15;
export const PACHINKO_SLOTS = [
  { label: 'Nothing',  type: 'loss',    effect: 'nothing' },
  { label: '+5g',      type: 'minor',   effect: 'gold:5' },
  { label: 'Common',   type: 'minor',   effect: 'item:common' },
  { label: '+20g',     type: 'win',     effect: 'gold:20' },
  { label: 'Uncommon', type: 'win',     effect: 'item:uncommon' },
  { label: '+50g',     type: 'win',     effect: 'gold:50' },
  { label: 'Rare',     type: 'jackpot', effect: 'item:rare' },
  { label: 'Nothing',  type: 'loss',    effect: 'nothing' },
];
export const PACHINKO_WEIGHTS = [25, 18, 20, 12, 10, 8, 4, 25];

// Prebuilt peg layout for 280×160 canvas — 5 rows, staggered
export const PACHINKO_PEGS = (() => {
  const pegs = [], rows = 5, W = 280, H = 160;
  for (let r = 0; r < rows; r++) {
    const stagger = r % 2 === 0;
    const count   = stagger ? 7 : 6;
    const marginX = stagger ? 14 : 28;
    for (let c = 0; c < count; c++) {
      const x = marginX + c * (W - marginX * 2) / (count - 1);
      const y = 20 + r * (H - 48) / (rows - 1);
      pegs.push({ x, y });
    }
  }
  return pegs;
})();
