// ============================================================
// FIELD EVENTS — random events that fire between digs
// ============================================================

export const FIELD_EVENT_MIN_MS = 3 * 60 * 1000;
export const FIELD_EVENT_MAX_MS = 8 * 60 * 1000;

export const FIELD_EVENTS = [

  // ── Good — straightforward upsides ────────────────────

  {
    id: 'museum_enquiry',
    title: 'Museum Enquiry',
    icon: '🏛',
    body: () => `The regional museum has sent a letter expressing interest in your recent finds. They offer a modest consulting fee in exchange for a site briefing.`,
    choices: [
      { label: 'Accept (+25g)',  apply: S => { S.gold += 25; return 'You attended the briefing. The curator was enthusiastic.'; } },
      { label: 'Decline',       apply: S => { return 'You declined. The excavation takes priority.'; } },
    ],
  },
  {
    id: 'grant_funding',
    title: 'Research Grant',
    icon: '📋',
    body: () => `A university archaeology department has approved a small research grant for your expedition based on your published findings.`,
    choices: [
      { label: 'Accept (+40g)', apply: S => { S.gold += 40; return 'Funds received. The department wishes you well.'; } },
      { label: 'Decline',       apply: S => { return 'Declined. Independent work suits you better.'; } },
    ],
  },
  {
    id: 'conservation_request',
    title: 'Conservation Request',
    icon: '🔬',
    body: () => `A conservation lab has offered to clean and document one of your pieces at no charge, in exchange for permission to photograph it for their records.`,
    choices: [
      { label: 'Accept (+15 rep)', apply: S => { S.prestige = (S.prestige || 0) + 15; return 'The piece came back in excellent condition. Your reputation grows.'; } },
      { label: 'Decline',          apply: S => { return 'You kept the piece. Some things are better left undocumented.'; } },
    ],
  },
  {
    id: 'good_weather',
    title: 'Favourable Conditions',
    icon: '☀',
    body: () => `Unusually dry weather has made the sites far more accessible than expected. The team is in good spirits and productivity is up.`,
    choices: [
      { label: 'Push the advantage (+luck)', apply: S => { S.bonusLuck = (S.bonusLuck || 0) + 0.4; return 'The team worked through the day. A productive stretch.'; } },
      { label: 'Rest the team',              apply: S => { return 'You called an early finish. Everyone needed it.'; } },
    ],
  },
  {
    id: 'local_press',
    title: 'Local Press Interest',
    icon: '📰',
    body: () => `A regional newspaper has asked to run a piece on your expedition. A short interview would raise the profile of your work considerably.`,
    choices: [
      { label: 'Give interview (+20 rep)', apply: S => { S.prestige = (S.prestige || 0) + 20; return 'The article ran on the front page. Donations arrived within the week.'; } },
      { label: 'No comment',               apply: S => { return 'You declined. Let the finds speak for themselves.'; } },
    ],
  },
  {
    id: 'volunteer_help',
    title: 'Volunteer Offer',
    icon: '👷',
    body: () => `A group of local archaeology students has offered to assist with site clearing for a week in exchange for credit on any published report.`,
    choices: [
      { label: 'Accept (+luck)', apply: S => { S.bonusLuck = (S.bonusLuck || 0) + 0.3; return 'The students were diligent. The site cleared faster than expected.'; } },
      { label: 'Decline',        apply: S => { return 'You thanked them and sent them on their way. Fewer hands, fewer problems.'; } },
    ],
  },

  // ── Mixed — real trade-offs ────────────────────────────

  {
    id: 'rival_tip',
    title: 'A Tip from a Rival',
    icon: '📬',
    body: () => `An anonymous note arrived at camp — a grid reference, scrawled in familiar handwriting. Someone wants you to look at something. Or somewhere they would rather you weren't.`,
    choices: [
      { label: 'Investigate (50/50 gamble)',
        apply: S => {
          if (Math.random() < 0.5) {
            S.bonusLuck = (S.bonusLuck || 0) + 0.6;
            return 'You followed it. A genuinely productive lead. Worth the trip.';
          } else {
            S.gold = Math.max(0, S.gold - 20);
            return "A waste of time and fuel. You've been had. -20g.";
          }
        }
      },
      { label: 'Ignore it', apply: S => 'You threw it in the fire. Could have been something.' },
    ],
  },
  {
    id: 'private_collector',
    title: 'Private Collector',
    icon: '💼',
    body: () => `A well-dressed visitor arrived at camp. They want a piece — above market rate. No paperwork, no questions.`,
    choices: [
      { label: 'Take the offer (+35g, -10 rep)',
        apply: S => {
          S.gold += 35;
          S.prestige = Math.max(0, (S.prestige || 0) - 10);
          return 'The transaction was swift. No receipt was offered. Word gets around.';
        }
      },
      { label: 'Turn them away (+10 rep)', apply: S => { S.prestige = (S.prestige || 0) + 10; return 'You showed them out. Some things should stay in public hands.'; } },
    ],
  },
  {
    id: 'equipment_fault',
    title: 'Equipment Fault',
    icon: '🔧',
    body: () => `One of your instruments has developed a fault in the field. Pay to fix it properly, or push on and risk worse damage.`,
    choices: [
      { label: 'Pay for repair (-18g)', apply: S => { S.gold = Math.max(0, S.gold - 18); return 'Repaired properly. Back in service by afternoon.'; } },
      { label: 'Push on (gamble)',
        apply: S => {
          if (Math.random() < 0.4) {
            return 'You improvised. It held. Lucky.';
          } else {
            S.gold = Math.max(0, S.gold - 35);
            return 'It failed completely mid-dig. Emergency replacement cost more. -35g.';
          }
        }
      },
    ],
  },
  {
    id: 'contested_site',
    title: 'Contested Ground',
    icon: '⚑',
    body: () => `A competing team has set up on the edge of your licensed area, working dangerously close to your primary dig. They have permits too — barely.`,
    choices: [
      { label: 'File a complaint (-20g, +15 rep)',
        apply: S => {
          S.gold = Math.max(0, S.gold - 20);
          S.prestige = (S.prestige || 0) + 15;
          return 'You filed with the authority. The complaint was upheld after three days. Costly but clean.';
        }
      },
      { label: 'Confront them (gamble)',
        apply: S => {
          if (Math.random() < 0.5) {
            S.bonusLuck = (S.bonusLuck || 0) + 0.3;
            return 'They backed down. You secured the area.';
          } else {
            S.prestige = Math.max(0, (S.prestige || 0) - 20);
            return 'It became a public dispute. Your reputation took a hit. -20 rep.';
          }
        }
      },
    ],
  },

  // ── Bad — no good option, just damage control ──────────

  {
    id: 'permit_revoked',
    title: 'Permit Suspended',
    icon: '🚫',
    body: () => `The regional authority has suspended your excavation permit pending a routine review. The fee to expedite reinstatement is non-negotiable.`,
    choices: [
      { label: 'Pay the fee (-30g)',     apply: S => { S.gold = Math.max(0, S.gold - 30); return 'Paid. Permit reinstated within 48 hours. An expensive inconvenience.'; } },
      { label: 'Wait for review (-rep)', apply: S => { S.prestige = Math.max(0, (S.prestige || 0) - 15); return 'You waited. The review dragged on. Your standing with the authority suffered.'; } },
    ],
  },
  {
    id: 'theft_at_camp',
    title: 'Theft at Camp',
    icon: '🔓',
    body: () => `You returned to camp to find the supply tent broken into. Equipment is missing. Whoever it was knew exactly what they were looking for.`,
    choices: [
      { label: 'Replace the equipment (-25g)', apply: S => { S.gold = Math.max(0, S.gold - 25); return 'You sourced replacements at short notice. Expensive, but work continues.'; } },
      { label: 'Report it and wait (-luck)',   apply: S => { S.bonusLuck = (S.bonusLuck || 0) - 0.4; return 'You filed a report. Nothing came of it. The missing kit slowed the next dig.'; } },
    ],
  },
  {
    id: 'bad_weather',
    title: 'Severe Weather',
    icon: '⛈',
    body: () => `A storm rolled in overnight and damaged part of the active site. Work has halted. Recovery will cost time or money — probably both.`,
    choices: [
      { label: 'Hire local help (-20g)',   apply: S => { S.gold = Math.max(0, S.gold - 20); return 'You brought in help. The site was cleared by morning.'; } },
      { label: 'Handle it yourselves (-luck)', apply: S => { S.bonusLuck = (S.bonusLuck || 0) - 0.3; return 'Two days lost clearing the damage. The team is exhausted. Next dig suffers.'; } },
    ],
  },
  {
    id: 'false_attribution',
    title: 'Attribution Dispute',
    icon: '⚖',
    body: () => `A researcher has publicly claimed that one of your published finds was misidentified and the credit belongs to a prior expedition. The claim has traction. Either way, this costs you.`,
    choices: [
      { label: 'Issue a rebuttal (-15 rep)',
        apply: S => { S.prestige = Math.max(0, (S.prestige || 0) - 15); return "You responded publicly. The dispute dragged on. Mud sticks, even when you're right."; }
      },
      { label: 'Stay silent (-25 rep)',
        apply: S => { S.prestige = Math.max(0, (S.prestige || 0) - 25); return 'You said nothing. The narrative set without you. A costly silence.'; }
      },
    ],
  },
  {
    id: 'structural_collapse',
    title: 'Partial Collapse',
    icon: '⚠',
    body: () => `A section of the active dig has partially collapsed. No one was hurt, but the area must be shored up before work can resume. This will not be cheap either way.`,
    choices: [
      { label: 'Bring in engineers (-40g)',
        apply: S => { S.gold = Math.max(0, S.gold - 40); return 'Engineers secured the site within a day. Work resumed, but the budget took a serious hit.'; }
      },
      { label: 'Shore it up yourselves (-20g, -luck)',
        apply: S => {
          S.gold = Math.max(0, S.gold - 20);
          S.bonusLuck = (S.bonusLuck || 0) - 0.3;
          return 'You managed without outside help. The structure holds, but the team is rattled. Next dig suffers.';
        }
      },
    ],
  },
  {
    id: 'customs_seizure',
    title: 'Customs Seizure',
    icon: '📦',
    body: () => `Authorities have flagged a recent shipment of catalogued finds as potentially unlicensed. The items are held pending review. The release fee is immediate either way.`,
    choices: [
      { label: 'Pay the release fee (-35g)',
        apply: S => { S.gold = Math.max(0, S.gold - 35); return 'Paid. Items released. The paperwork was in order — they were just fishing.'; }
      },
      { label: 'Contest it (-20g, -20 rep)',
        apply: S => {
          S.gold = Math.max(0, S.gold - 20);
          S.prestige = Math.max(0, (S.prestige || 0) - 20);
          return 'You contested the seizure. You were right, but the process was slow and public. The damage lingered.';
        }
      },
    ],
  },
  {
    id: 'team_dispute',
    title: 'Team Dispute',
    icon: '💬',
    body: () => `Two members of the team have come to a serious disagreement over excavation method. Work has effectively stopped until it's resolved. There is no clean answer here.`,
    choices: [
      { label: 'Side with one (-luck, team unhappy)',
        apply: S => { S.bonusLuck = (S.bonusLuck || 0) - 0.3; return 'You made the call. Work resumed, but the atmosphere is tense. The next dig will show it.'; }
      },
      { label: 'Force a compromise (-20g, delays)',
        apply: S => { S.gold = Math.max(0, S.gold - 20); return 'You brought in a mediator. Expensive and slow, but the team emerged intact.'; }
      },
    ],
  },
  {
    id: 'forged_provenance',
    title: 'Forged Provenance',
    icon: '📜',
    body: () => `An item recently sold through market channels has been flagged as having questionable provenance documentation — paperwork that may have been altered before it reached you. The buyer is demanding a refund.`,
    choices: [
      { label: 'Refund the buyer (-30g)',
        apply: S => { S.gold = Math.max(0, S.gold - 30); return 'You issued the refund without argument. Expensive, but your integrity is intact.'; }
      },
      { label: 'Dispute the claim (-25 rep)',
        apply: S => { S.prestige = Math.max(0, (S.prestige || 0) - 25); return 'You pushed back. The dispute became public. Even an innocent party looks guilty in these situations.'; }
      },
    ],
  },
];
