// ============================================================
// DIG SITES & EVENTS
// ============================================================

export const SITES = [
  { id: 'roman',     name: 'Roman ruins',      duration: 60,   luck: 1,   cost: 0,    xp: 5,   desc: 'A crumbling forum outside the city walls.' },
  { id: 'egypt',     name: 'Desert tomb',      duration: 150,  luck: 1.5, cost: 80,   xp: 12,  desc: 'Sun-baked burial chambers beneath the sands.' },
  { id: 'jungle',    name: 'Jungle temple',    duration: 300,  luck: 2,   cost: 220,  xp: 22,  desc: 'Overgrown stone altar deep in the forest.' },
  { id: 'sunken',    name: 'Sunken wreck',     duration: 600,  luck: 3,   cost: 550,  xp: 45,  desc: 'An ancient trading vessel on the seabed.' },
  { id: 'monastery', name: 'Alpine monastery', duration: 1200, luck: 3.5, cost: 1100, xp: 80,  desc: 'A remote stone abbey above the snowline, largely undisturbed.' },
];

export const EVENTS = [
  {
    id: 'lucky',   chance: 0.08, icon: '✦', title: 'Lucky Strike',
    desc:  (a, s) => `The ground gave way to a hidden cache. An extra find for ${a.name}.`,
    apply: l => { l.push(l[Math.floor(Math.random() * l.length)]); return l; },
  },
  {
    id: 'cavein',  chance: 0.06, icon: '⚠', title: 'Cave-in',
    desc:  (a, s) => `A section collapsed at ${s.name}. ${a.name} had to abandon one item to escape safely.`,
    apply: l => { if (l.length > 1) l.splice(Math.floor(Math.random() * l.length), 1); return l; },
  },
  {
    id: 'rival',   chance: 0.05, icon: '⚑', title: 'Rival Team',
    desc:  (a, s) => `A competing expedition was working the same area. ${a.name} lost one item in the dispute.`,
    apply: l => { if (l.length > 1) l.splice(Math.floor(Math.random() * l.length), 1); return l; },
  },
  {
    id: 'perfect', chance: 0.07, icon: '☀', title: 'Perfect Conditions',
    desc:  (a, s) => `Ideal conditions at ${s.name}. ${a.name} worked faster and found a bonus item.`,
    apply: l => { l.push(l[Math.floor(Math.random() * l.length)]); return l; },
  },
];
