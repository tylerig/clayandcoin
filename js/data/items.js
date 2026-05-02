// ============================================================
// ITEMS, EQUIPMENT & RARITY
// ============================================================

export const ITEMS = {
  // ── Roman ruins ────────────────────────────────────────
  fresco:          { name: 'Roman fresco',           rarity: 'uncommon', sellValue: 18,  craftable: false, collectionCategory: 'art',          sites: ['roman'],         flavour: 'A plaster fragment still vivid with colour.' },
  amphora:         { name: 'Intact amphora',          rarity: 'rare',     sellValue: 55,  craftable: false, collectionCategory: 'ceramics',     sites: ['roman','egypt'], flavour: 'Sealed with wax, it still holds a faint scent of resin.' },
  // ── Desert tomb ────────────────────────────────────────
  scarab:          { name: 'Carved scarab',           rarity: 'uncommon', sellValue: 22,  craftable: false, collectionCategory: 'valuables',    sites: ['egypt'],         flavour: 'Lapis lazuli beetle, symbol of rebirth.' },
  // ── Jungle temple ──────────────────────────────────────
  idol:            { name: 'Stone idol',              rarity: 'rare',     sellValue: 60,  craftable: false, collectionCategory: 'sculpture',    sites: ['jungle'],        flavour: 'Featureless face, hands clasped. Origin unknown.' },
  // ── Sunken wreck ───────────────────────────────────────
  compass:         { name: "Navigator's compass",     rarity: 'rare',     sellValue: 70,  craftable: false, collectionCategory: 'instruments',  sites: ['sunken'],        flavour: 'Brass, still functional, marked in an old script.' },
  astrolabe:       { name: 'Astrolabe',               rarity: 'epic',     sellValue: 170, craftable: false, collectionCategory: 'instruments',  sites: ['sunken'],        flavour: 'A marvel of medieval Islamic astronomy, intact.' },
  // ── Alpine monastery ───────────────────────────────────
  illum_page:      { name: 'Illuminated page',         rarity: 'uncommon', sellValue: 30,  craftable: false, collectionCategory: 'manuscripts',  sites: ['monastery'],     flavour: 'A single leaf from a psalter, gold leaf still bright.' },
  reliquary_cross: { name: 'Iron reliquary cross',    rarity: 'rare',     sellValue: 85,  craftable: false, collectionCategory: 'religious',    sites: ['monastery'],     flavour: 'Cast iron, inlaid with enamel. Hung above an altar for centuries.' },
  monks_seal:      { name: "Monk's seal",              rarity: 'rare',     sellValue: 100, craftable: false, collectionCategory: 'inscriptions', sites: ['monastery'],     flavour: "Wax seal matrix in bronze, the abbot's mark still sharp." },
  codex_illum:     { name: 'Codex illuminatus',        rarity: 'epic',     sellValue: 270, craftable: false, collectionCategory: 'manuscripts',  sites: ['monastery'],     flavour: 'A complete illuminated manuscript, bound in calfskin. Irreplaceable.' },
  // ── General drops ──────────────────────────────────────
  shard:           { name: 'Pottery shard',            rarity: 'common',   sellValue: 1,   craftable: false, collectionCategory: 'ceramics',     flavour: 'A fragment of fired clay, painted in faded ochre.' },
  coin_ancient:    { name: 'Ancient coin',             rarity: 'common',   sellValue: 3,   craftable: false, collectionCategory: 'currency',     flavour: 'Worn smooth, the profile on its face barely legible.' },
  figurine:        { name: 'Clay figurine',            rarity: 'uncommon', sellValue: 11,  craftable: false, collectionCategory: 'ceramics',     flavour: 'A small deity, arms raised, baked in the old way.' },
  tablet:          { name: 'Stone tablet',             rarity: 'uncommon', sellValue: 15,  craftable: false, collectionCategory: 'inscriptions', flavour: 'Incised lines that may be proto-writing, or ritual marks.' },
  jewel:           { name: 'Gemstone',                 rarity: 'rare',     sellValue: 38,  craftable: false, collectionCategory: 'valuables',    flavour: 'Deep green, uncut, with a flaw shaped like a feather.' },
  scroll:          { name: 'Papyrus scroll',           rarity: 'rare',     sellValue: 45,  craftable: false, collectionCategory: 'inscriptions', flavour: 'Rolled tight, the outer layer crumbling at the edges.' },
  statue:          { name: 'Bronze statue',            rarity: 'epic',     sellValue: 115, craftable: false, collectionCategory: 'sculpture',    flavour: 'Hollow-cast, depicting a figure mid-stride, eyes inlaid.' },
  crown:           { name: 'Golden crown',             rarity: 'epic',     sellValue: 155, craftable: false, collectionCategory: 'valuables',    flavour: 'Hammered gold leaf on an iron frame. Fit for a minor king.' },
  // ── Craftable ──────────────────────────────────────────
  mosaic:          { name: 'Mosaic panel',             rarity: 'rare',     sellValue: 70,  craftable: true,  collectionCategory: 'ceramics',     flavour: 'Dozens of shards arranged into a geometric scene.',                     recipe: { shard: 6, figurine: 2 } },
  codex:           { name: 'Bound codex',              rarity: 'epic',     sellValue: 230, craftable: true,  collectionCategory: 'inscriptions', flavour: 'Multiple scrolls bound with leather cord.',                             recipe: { scroll: 3, tablet: 2 } },
  reliquary:       { name: 'Reliquary',                rarity: 'epic',     sellValue: 380, craftable: true,  collectionCategory: 'valuables',    flavour: 'A golden box set with jewels, for housing sacred remains.',            recipe: { jewel: 3, crown: 1, coin_ancient: 5 } },
  reliq_triptych:  { name: 'Reliquary triptych',       rarity: 'epic',     sellValue: 460, craftable: true,  collectionCategory: 'religious',    flavour: 'Three hinged panels of iron and enamel, depicting saints.',            recipe: { reliquary_cross: 2, jewel: 2 } },
  bound_scripture: { name: 'Bound scripture',          rarity: 'epic',     sellValue: 310, craftable: true,  collectionCategory: 'manuscripts',  flavour: 'Monastery pages sewn into a scroll binding.',                          recipe: { illum_page: 4, scroll: 2 } },
  compendium:      { name: "Cartographer's compendium", rarity: 'rare',    sellValue: 155, craftable: true,  collectionCategory: 'instruments',  flavour: 'Seal, tablet rubbings, and compass readings in one volume.',           recipe: { monks_seal: 2, tablet: 3, compass: 1 } },
};

export const EQUIP = [
  { id: 'brush',     name: 'Fine brush',          desc: 'Surface detail work',                bonus: 0.3, cost: 40   },
  { id: 'sonar',     name: 'Ground sonar',         desc: 'Locates buried chambers',            bonus: 0.5, cost: 110  },
  { id: 'camera',    name: 'Stereo camera',        desc: '3D site documentation',              bonus: 0.7, cost: 220  },
  { id: 'detector',  name: 'Metal detector',       desc: 'Traces metal artefacts below grade', bonus: 0.8, cost: 280  },
  { id: 'drone',     name: 'Survey drone',         desc: 'Full overhead mapping',              bonus: 1.0, cost: 420  },
  { id: 'theodolite',name: 'Tripod theodolite',    desc: 'Precision angular measurement',      bonus: 1.2, cost: 600  },
  { id: 'field_lab', name: 'Portable field lab',   desc: 'On-site analysis and dating',        bonus: 1.5, cost: 850  },
  { id: 'lidar',     name: 'LiDAR scanner',        desc: 'Sub-centimetre terrain mapping',     bonus: 2.0, cost: 1300 },
];

// Rarity display order (highest first)
export const RARITY_ORDER = ['epic', 'rare', 'uncommon', 'common'];

// CSS class per rarity stamp
export const RARITY_STAMP = { common: 'sg', uncommon: 'st', rare: 'sa', epic: 'sr2' };

// Glow colour per rarity (for reveal overlays)
export const RARITY_GLOW = {
  common:   'rgba(168,150,110,0.4)',
  uncommon: 'rgba(26,74,58,0.5)',
  rare:     'rgba(160,98,42,0.6)',
  epic:     'rgba(200,80,20,0.65)',
};

/** Drop weights for a given luck multiplier, returns weight for rarity r */
export function dropWeight(r, luck) {
  if (luck >= 3.5) return { common: 20, uncommon: 28, rare: 30, epic: 22 }[r] || 10;
  if (luck >= 3)   return { common: 30, uncommon: 30, rare: 25, epic: 15 }[r] || 10;
  if (luck >= 2)   return { common: 45, uncommon: 30, rare: 18, epic:  7 }[r] || 10;
  if (luck >= 1.5) return { common: 52, uncommon: 28, rare: 14, epic:  6 }[r] || 10;
  return               { common: 60, uncommon: 25, rare: 10, epic:  5 }[r] || 10;
}
