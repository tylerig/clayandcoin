// ============================================================
// FIELD EVENTS — random events that fire between digs
// ============================================================

export const FIELD_EVENT_MIN_MS = 3 * 60 * 1000;  // 3 min minimum between events
export const FIELD_EVENT_MAX_MS = 8 * 60 * 1000;  // 8 min maximum

export const FIELD_EVENTS = [
  // ── Museum & Institutions ──────────────────────────────
  {
    id: 'museum_enquiry',
    title: 'Museum Enquiry',
    icon: '🏛',
    body: (S) => `The regional museum has sent a letter expressing interest in your recent finds. They offer a modest consulting fee in exchange for a site briefing.`,
    choices: [
      { label: 'Accept (+ 25g)', apply: S => { S.gold += 25; return 'You attended the briefing. The curator was enthusiastic.'; } },
      { label: 'Decline',        apply: S => { return 'You declined. The excavation takes priority.'; } },
    ],
  },
  {
    id: 'grant_funding',
    title: 'Research Grant',
    icon: '📋',
    body: (S) => `A university archaeology department has approved a small research grant for your expedition based on your published findings.`,
    choices: [
      { label: 'Accept (+ 40g)', apply: S => { S.gold += 40; return 'Funds received. The department wishes you well.'; } },
      { label: 'Decline',        apply: S => { return 'Declined. Independent work suits you better.'; } },
    ],
  },
  {
    id: 'conservation_request',
    title: 'Conservation Request',
    icon: '🔬',
    body: (S) => `A conservation lab has offered to clean and document one of your pieces at no charge, in exchange for permission to photograph it for their records.`,
    choices: [
      { label: 'Accept', apply: S => { S.prestige = (S.prestige || 0) + 15; return 'The piece came back in excellent condition. Your reputation grows.'; } },
      { label: 'Decline', apply: S => { return 'You kept the piece. Some things are better left undocumented.'; } },
    ],
  },

  // ── Rivals & Field Complications ──────────────────────
  {
    id: 'rival_tip',
    title: 'A Tip from a Rival',
    icon: '📬',
    body: (S) => `An anonymous note arrived at camp — a grid reference, scrawled in familiar handwriting. Someone wants you to look at something, or wants you out of the way.`,
    choices: [
      { label: 'Investigate (+ luck next dig)', apply: S => { S.bonusLuck = (S.bonusLuck || 0) + 0.5; return 'You followed the coordinates. Something interesting is there.'; } },
      { label: 'Ignore it',                     apply: S => { return 'You threw it in the fire. Probably nothing.'; } },
    ],
  },
  {
    id: 'permit_delay',
    title: 'Permit Complications',
    icon: '📄',
    body: (S) => `The regional authority has flagged an administrative issue with your excavation permits. Resolving it quickly costs a fee, or you can wait and lose time.`,
    choices: [
      { label: 'Pay to resolve (- 20g)', apply: S => { S.gold = Math.max(0, S.gold - 20); return 'Sorted. The paperwork cleared by morning.'; } },
      { label: 'Wait it out',            apply: S => { S.permitDelay = (S.permitDelay || 0) + 1; return 'You filed an appeal. Progress slows for now.'; } },
    ],
  },
  {
    id: 'equipment_fault',
    title: 'Equipment Fault',
    icon: '🔧',
    body: (S) => `One of your instruments has developed a fault — likely from the damp conditions. A local repair shop can fix it, but it costs time and money.`,
    choices: [
      { label: 'Pay for repair (- 15g)', apply: S => { S.gold = Math.max(0, S.gold - 15); return 'Repaired and back in service by afternoon.'; } },
      { label: 'Improvise',              apply: S => { return 'You patched it with what you had. It holds, for now.'; } },
    ],
  },

  // ── Community & Press ──────────────────────────────────
  {
    id: 'local_press',
    title: 'Local Press Interest',
    icon: '📰',
    body: (S) => `A regional newspaper has asked to run a piece on your expedition. A short interview would raise the profile of your work considerably.`,
    choices: [
      { label: 'Give interview', apply: S => { S.prestige = (S.prestige || 0) + 20; return 'The article ran on the front page. Donations arrived within the week.'; } },
      { label: 'No comment',     apply: S => { return 'You declined. Let the finds speak for themselves.'; } },
    ],
  },
  {
    id: 'volunteer_help',
    title: 'Volunteer Offer',
    icon: '👷',
    body: (S) => `A group of local archaeology students has offered to assist with site clearing for a week in exchange for credit on any published report.`,
    choices: [
      { label: 'Accept help', apply: S => { S.bonusLuck = (S.bonusLuck || 0) + 0.3; return 'The students were diligent. The site cleared faster than expected.'; } },
      { label: 'Decline',     apply: S => { return 'You thanked them and sent them on their way. Fewer hands, fewer problems.'; } },
    ],
  },
  {
    id: 'private_collector',
    title: 'Private Collector',
    icon: '💼',
    body: (S) => `A well-dressed visitor arrived at camp, claiming to represent a private collection. They made an offer on any piece you might be willing to part with — above market rate.`,
    choices: [
      { label: 'Take the offer (+ 35g)', apply: S => { S.gold += 35; return 'The transaction was swift. No receipt was offered.'; } },
      { label: 'Turn them away',         apply: S => { S.prestige = (S.prestige || 0) + 10; return 'You showed them out. Some things should stay in public hands.'; } },
    ],
  },

  // ── Weather & Environment ──────────────────────────────
  {
    id: 'good_weather',
    title: 'Favourable Conditions',
    icon: '☀',
    body: (S) => `Unusually dry weather has made the sites far more accessible than expected. The team is in good spirits and productivity is up.`,
    choices: [
      { label: 'Push the advantage', apply: S => { S.bonusLuck = (S.bonusLuck || 0) + 0.4; return 'The team worked through the day. A productive stretch.'; } },
      { label: 'Rest the team',      apply: S => { return 'You called an early finish. Everyone needed it.'; } },
    ],
  },
  {
    id: 'bad_weather',
    title: 'Adverse Weather',
    icon: '⛈',
    body: (S) => `Heavy rain has flooded part of the active site. The team has had to pull back and wait for conditions to improve.`,
    choices: [
      { label: 'Divert resources (- 10g)', apply: S => { S.gold = Math.max(0, S.gold - 10); return 'You hired local help to pump out the site. Work resumed by morning.'; } },
      { label: 'Wait it out',              apply: S => { return 'You waited. Two days lost, but the site was intact.'; } },
    ],
  },
];
