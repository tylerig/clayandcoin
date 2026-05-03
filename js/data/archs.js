// ============================================================
// ARCHAEOLOGISTS
// ============================================================

export const ARCHS = [
  { id: 'ada',   name: 'Ada Okafor',   role: 'Junior field researcher', skill: 1, recruitSite: null,       recruitChance: 0,     recruitIntro: null },
  { id: 'ben',   name: 'Ben Martel',   role: 'Experienced excavator',   skill: 2, recruitSite: 'egypt',    recruitChance: 0.04,  recruitIntro: 'Encountered sheltering in a tomb antechamber, cataloguing wall inscriptions by lamplight. He agreed to join without hesitation.' },
  { id: 'cora',  name: 'Cora Singh',   role: 'Senior archaeologist',    skill: 3, recruitSite: 'jungle',   recruitChance: 0.035, recruitIntro: 'Found mapping temple carvings alone, three days deep in the forest. She had been waiting for a team worth joining.' },
  { id: 'dev',   name: 'Dev Nakamura', role: 'Lead field director',     skill: 4, recruitSite: 'sunken',   recruitChance: 0.025, recruitIntro: 'Surfaced beside the dive vessel mid-expedition, bearing a sealed amphora and a reputation that preceded him. He takes the lead.' },
  { id: 'elara', name: 'Sister Elara', role: 'Archivist & conservator', skill: 4, recruitSite: 'monastery', recruitChance: 0.02,  recruitIntro: 'Found cataloguing a collapsed library alone, by candlelight. She had been there three days. She joins us to ensure the manuscripts are properly preserved.' },
];

export const XP_THRESH = [0, 0, 80, 220, 500];
export const MAX_SK = 4;

export const SKILL_LABELS = ['', 'Novice', 'Field Work', 'Expert', 'Master'];
