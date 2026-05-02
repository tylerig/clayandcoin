// ============================================================
// CHALLENGES
// ============================================================
import { ITEMS } from './items.js';

// Helper checks — all receive S (game state) and return { cur, tgt }
const totalEpics  = S => Object.entries(S.cl).filter(([id]) => ITEMS[id]?.rarity === 'epic').reduce((sum, [, v]) => sum + v.tot, 0);
const romanEx     = S => ['fresco','amphora'].filter(id => S.cl[id]).length;
const sunkenEx    = S => ['compass','astrolabe'].filter(id => S.cl[id]).length;
const monasteryEx = S => ['illum_page','reliquary_cross','monks_seal','codex_illum'].filter(id => S.cl[id]).length;

// Returns only XP-earned skill levels — does NOT count base/starting skill.
// This prevents newly-recruited high-skill archaeologists from auto-completing
// skill challenges without the player having actually trained anyone.
function earnedSkillLevel(S, id) {
  const XP_THRESH = [0, 0, 80, 220, 500];
  const MAX_SK = 4;
  const xp = S.axp[id] || 0;
  // Walk from level 2 upward — only count levels reached by XP alone
  let earned = 1;
  for (let lv = 2; lv <= MAX_SK; lv++) if (xp >= XP_THRESH[lv]) earned = lv;
  return earned;
}

const topEarnedSkill = S =>
  Math.max(...['ada','ben','cora','dev','elara'].filter(id => S.ra.includes(id)).map(id => earnedSkillLevel(S, id)));

export const CHALLENGES = [
  // First steps
  { id: 'first_dig',        category: 'first steps', desc: 'Send Ada on her first expedition.',                    reward: { gold: 5  }, check: S => ({ cur: Math.min(S.digs, 1),                                                    tgt: 1  }) },
  { id: 'first_epic',       category: 'first steps', desc: 'Unearth your first epic artifact.',                    reward: { gold: 35  }, check: S => ({ cur: Math.min(totalEpics(S), 1),                                              tgt: 1  }) },
  { id: 'first_recruit',    category: 'first steps', desc: 'Recruit a second archaeologist.',                      reward: { gold: 20  }, check: S => ({ cur: Math.min(S.ra.length - 1, 1),                                           tgt: 1  }) },
  { id: 'first_sale',       category: 'first steps', desc: 'Sell an item at market.',                              reward: { gold: 10  }, check: S => ({ cur: Math.min(S.sh.length, 1),                                               tgt: 1  }) },
  { id: 'first_craft',      category: 'first steps', desc: 'Craft something in the workshop.',                     reward: { gold: 20  }, check: S => ({ cur: Math.min(S.ch2.length, 1),                                              tgt: 1  }) },
  { id: 'first_gamble',     category: 'first steps', desc: 'Open your first mystery crate at the market.',        reward: { gold: 5  }, check: S => ({ cur: Math.min(S.gambleCount || 0, 1),                                        tgt: 1  }) },
  { id: 'first_auction',    category: 'first steps', desc: 'Win an item at auction.',                              reward: { gold: 15  }, check: S => ({ cur: Math.min(S.auctionWins || 0, 1),                                       tgt: 1  }) },
  { id: 'first_card',       category: 'first steps', desc: 'Draw your first provenance card.',                     reward: { gold: 5  }, check: S => ({ cur: Math.min(S.cardDraws || 0, 1),                                         tgt: 1  }) },
  { id: 'first_pachinko',   category: 'first steps', desc: 'Drop a token in the dig pachinko.',                   reward: { gold: 5  }, check: S => ({ cur: Math.min(S.pachinkoPlays || 0, 1),                                     tgt: 1  }) },
  // Field work
  { id: 'digs_10',          category: 'field work',  desc: 'Complete 10 digs.',                                    reward: { gold: 30  }, check: S => ({ cur: Math.min(S.digs, 10),                                                   tgt: 10 }) },
  { id: 'digs_25',          category: 'field work',  desc: 'Complete 25 digs in total.',                           reward: { gold: 55  }, check: S => ({ cur: Math.min(S.digs, 25),                                                   tgt: 25 }) },
  { id: 'digs_50',          category: 'field work',  desc: 'Complete 50 digs — a proper campaign.',                reward: { gold: 105 }, check: S => ({ cur: Math.min(S.digs, 50),                                                   tgt: 50 }) },
  { id: 'sunken_5',         category: 'field work',  desc: 'Make 5 dives at the sunken wreck.',                    reward: { gold: 40  }, check: S => ({ cur: Math.min(S.siteDigCounts?.sunken || 0, 5),                             tgt: 5  }) },
  { id: 'jungle_5',         category: 'field work',  desc: 'Return from the jungle temple 5 times.',               reward: { gold: 35  }, check: S => ({ cur: Math.min(S.siteDigCounts?.jungle || 0, 5),                             tgt: 5  }) },
  { id: 'monastery_unlock', category: 'field work',  desc: 'Unlock the alpine monastery.',                         reward: { gold: 55  }, check: S => ({ cur: S.sites.includes('monastery') ? 1 : 0,                                 tgt: 1  }) },
  { id: 'monastery_5',      category: 'field work',  desc: 'Complete 5 expeditions to the alpine monastery.',      reward: { gold: 85 }, check: S => ({ cur: Math.min(S.siteDigCounts?.monastery || 0, 5),                          tgt: 5  }) },
  // Collection
  { id: 'unique_5',         category: 'collection',  desc: 'Discover 5 different artifact types.',                 reward: { gold: 20  }, check: S => ({ cur: Math.min(Object.keys(S.cl).length, 5),                                 tgt: 5  }) },
  { id: 'unique_10',        category: 'collection',  desc: 'Fill 10 entries in the collection log.',               reward: { gold: 50  }, check: S => ({ cur: Math.min(Object.keys(S.cl).length, 10),                                tgt: 10 }) },
  { id: 'unique_all',       category: 'collection',  desc: 'Complete the full collection.',                        reward: { gold: 350 }, check: S => ({ cur: Math.min(Object.keys(S.cl).length, Object.keys(ITEMS).length),         tgt: Object.keys(ITEMS).length }) },
  { id: 'epics_3',          category: 'collection',  desc: 'Find 3 epic artifacts.',                               reward: { gold: 70 }, check: S => ({ cur: Math.min(totalEpics(S), 3),                                            tgt: 3  }) },
  { id: 'roman_set',        category: 'collection',  desc: 'Find every exclusive drop from the Roman ruins.',      reward: { gold: 40  }, check: S => ({ cur: romanEx(S),                                                            tgt: 2  }) },
  { id: 'sunken_set',       category: 'collection',  desc: 'Find every exclusive drop from the sunken wreck.',    reward: { gold: 85 }, check: S => ({ cur: sunkenEx(S),                                                           tgt: 2  }) },
  { id: 'monastery_set',    category: 'collection',  desc: 'Find all four exclusive drops from the monastery.',   reward: { gold: 140 }, check: S => ({ cur: monasteryEx(S),                                                        tgt: 4  }) },
  // The team
  { id: 'full_team',        category: 'the team',    desc: 'Recruit all five archaeologists.',                     reward: { gold: 175 }, check: S => ({ cur: Math.min(S.ra.length, 5),                                              tgt: 5  }) },
  { id: 'recruit_elara',    category: 'the team',    desc: 'Find Sister Elara at the alpine monastery.',           reward: { gold: 70 }, check: S => ({ cur: S.ra.includes('elara') ? 1 : 0,                                       tgt: 1  }) },
  { id: 'skill_3',          category: 'the team',    desc: 'Train any archaeologist up to skill level 3 through field work.',  reward: { gold: 55  }, check: S => ({ cur: Math.min(topEarnedSkill(S), 3), tgt: 3 }) },
  { id: 'skill_max',        category: 'the team',    desc: 'Reach peak mastery with any archaeologist through training.',       reward: { gold: 140 }, check: S => ({ cur: Math.min(topEarnedSkill(S), 4), tgt: 4 }) },
  // Economy
  { id: 'gold_100',         category: 'economy',     desc: 'Accumulate 100 gold.',                                 reward: { gold: 0   }, check: S => ({ cur: Math.min(S.gold, 100),                                                 tgt: 100 }) },
  { id: 'gold_500',         category: 'economy',     desc: 'Hold 500 gold at once.',                               reward: { gold: 35  }, check: S => ({ cur: Math.min(S.gold, 500),                                                 tgt: 500 }) },
  { id: 'sell_10',          category: 'economy',     desc: 'Sell 10 items to market.',                             reward: { gold: 30  }, check: S => ({ cur: Math.min(S.sh.length, 10),                                             tgt: 10 }) },
  { id: 'gamble_5',         category: 'economy',     desc: 'Try your luck at the relic gamble 5 times.',           reward: { gold: 20  }, check: S => ({ cur: Math.min(S.gambleCount || 0, 5),                                      tgt: 5  }) },
  { id: 'auction_3',        category: 'economy',     desc: 'Win 3 auctions.',                                      reward: { gold: 40  }, check: S => ({ cur: Math.min(S.auctionWins || 0, 3),                                      tgt: 3  }) },
  // Workshop
  { id: 'craft_codex',      category: 'workshop',    desc: 'Bind a codex from gathered scrolls and tablets.',      reward: { gold: 55  }, check: S => ({ cur: S.ch2.filter(c => c.id === 'codex').length > 0 ? 1 : 0,              tgt: 1  }) },
  { id: 'craft_reliq',      category: 'workshop',    desc: "Assemble the reliquary — the workshop's masterwork.", reward: { gold: 140 }, check: S => ({ cur: S.ch2.filter(c => c.id === 'reliquary').length > 0 ? 1 : 0,          tgt: 1  }) },
  { id: 'craft_triptych',   category: 'workshop',    desc: 'Forge the reliquary triptych from monastery crosses.', reward: { gold: 105 }, check: S => ({ cur: S.ch2.filter(c => c.id === 'reliq_triptych').length > 0 ? 1 : 0,    tgt: 1  }) },
  { id: 'craft_scripture',  category: 'workshop',    desc: 'Bind the illuminated scripture from monastery pages.', reward: { gold: 70 }, check: S => ({ cur: S.ch2.filter(c => c.id === 'bound_scripture').length > 0 ? 1 : 0,   tgt: 1  }) },
];
