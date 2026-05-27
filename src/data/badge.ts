import type { Badge, SectionMeta } from "../types/app";

// ─── Threshold ────────────────────────────────────────────────────────────────
// A section is "weak" when its scaled score is below this fraction of its max.
export const WEAK_THRESHOLD = 0.5;

// ─── Step 1 — getSortedSections ───────────────────────────────────────────────

/**
 * Sort section results weakest → strongest.
 * Tiebreaker 1: scaledMax descending (higher-weight section first).
 * Tiebreaker 2: stable sort preserves SECTIONS declaration order.
 */
export function getSortedSections(
  sectionResults: Array<{ meta: SectionMeta; scaled: number }>,
): Array<{ meta: SectionMeta; scaled: number }> {
  return [...sectionResults].sort((a, b) => {
    const fracA = a.scaled / a.meta.scaledMax;
    const fracB = b.scaled / b.meta.scaledMax;
    if (fracA !== fracB) return fracA - fracB;
    if (a.meta.scaledMax !== b.meta.scaledMax) return b.meta.scaledMax - a.meta.scaledMax;
    return 0;
  });
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export const BADGES: Badge[] = [
  {
    id: "starting-out",
    label: "Starting Out",
    minScore: 0,
    maxScore: 30,
    taglines: {
      default:
        "Every journey starts somewhere. The fact you are measuring is already the first step.",
      focused: {
        transport:
          "Transport is carrying most of your footprint right now. That one change could move the needle more than anything else.",
        food: "Food choices are where most of your impact lives. Even small shifts in diet go further than most people expect.",
        energy:
          "Energy habits are your biggest opportunity. Home and workplace use adds up faster than it feels like it should.",
        consumption:
          "What you buy is outweighing everything else right now. Slowing down purchases is the fastest lever you have.",
        waste:
          "Most of what you throw away has somewhere better to go. Waste habits are worth addressing early.",
        water:
          "Water use is slipping in ways that are easy to fix. Small changes here tend to have an outsized effect.",
        digital:
          "Digital habits are adding more than you might expect. A few changes there would make an immediate difference.",
      },
      split:
        "A couple of areas are pulling your score down. Picking one to focus on first tends to work better than trying to change everything at once.",
      broad:
        "A lot of areas need attention, which actually makes this the easiest stage to improve quickly. Small changes across the board add up fast.",
    },
  },

  {
    id: "becoming-aware",
    label: "Becoming Aware",
    minScore: 31,
    maxScore: 50,
    taglines: {
      default:
        "Awareness is there. The gap between knowing and doing is where most people get stuck. Closing it is the whole game now.",
      focused: {
        transport:
          "Good instincts developing across most areas. Transport is the one gap doing most of the damage to your score.",
        food: "Solid progress taking shape. Food choices are the area where your habits have not caught up yet.",
        energy:
          "Good awareness across the board. Energy use is the one thing still holding your score back.",
        consumption:
          "Your habits are improving. Consumption is the area that still needs the most work.",
        waste: "Growing awareness showing through. Waste handling is the gap left to close.",
        water:
          "Good progress on most fronts. Water efficiency is the one habit yet to form properly.",
        digital:
          "Awareness is building well. Digital habits are the one area that still needs real attention.",
      },
      split:
        "Two areas are dragging the rest of your score down. Awareness is there, but translating it into consistent habit is the next step.",
      broad:
        "You are more aware than your score suggests. The challenge now is narrowing your focus rather than trying to improve everywhere at once.",
    },
  },

  {
    id: "building-habits",
    label: "Building Habits",
    minScore: 51,
    maxScore: 65,
    taglines: {
      default:
        "The habits are sticking. You are past the easy wins. The gains from here take more intention but they last longer.",
      focused: {
        transport:
          "Real habits forming across most of your life. Transport is the one area that has not caught up with the rest.",
        food: "Strong foundations taking hold. Food is the habit that still needs the most consistency.",
        energy: "Most of your habits are locking in. Energy use is the remaining area to work on.",
        consumption:
          "Good progress across the board. Consumption is the one habit still to address.",
        waste: "Solid across most sections. Waste is where your habits are still developing.",
        water:
          "Good consistency showing through. Water efficiency is the one area left to bring in line.",
        digital: "Habits are forming well. Digital is the one section still lagging behind.",
      },
      split:
        "Two areas are keeping your score from climbing higher. The foundations are there, and consistency in those gaps is all that is left.",
      broad:
        "Good habits are forming, but they are patchy. Depth in a few areas will take you further than spreading your effort thin.",
    },
  },

  {
    id: "green-leader",
    label: "Green Leader",
    minScore: 66,
    maxScore: 80,
    taglines: {
      default:
        "Strong, consistent habits across the board. You are well ahead of where most people land.",
      focused: {
        transport:
          "Strong habits across almost everything. Transport is the one piece that does not match the rest of your profile.",
        food: "A strong profile with one gap. Food choices are the habit still to refine.",
        energy: "Leading in most areas. Energy is the one blind spot left.",
        consumption:
          "Almost everything dialled in. Consumption habits are the one thing still to bring up to your own standard.",
        waste:
          "Excellent across the board. Waste is the one area that does not reflect how well you are doing elsewhere.",
        water: "Strong performance throughout. Water efficiency is the habit left to lock in.",
        digital:
          "Impressive habits overall. Digital is the one section that has not caught up with the rest.",
      },
      split:
        "You are leading in most areas but two gaps are holding the overall score back. Closing either one would move you into the next tier.",
      broad:
        "Strong overall but still spread thin in a few places. Shoring up those gaps is what separates a good profile from a great one.",
    },
  },

  {
    id: "eco-champion",
    label: "Eco Champion",
    minScore: 81,
    maxScore: 90,
    taglines: {
      default:
        "Your habits are genuinely making a difference. This is the level most people aim for and never quite reach.",
      focused: {
        transport:
          "Exceptional commitment almost everywhere. Transport is the one remaining area where your habits can still go further.",
        food: "A near-complete profile. Food is the one final habit to bring to the same level as everything else.",
        energy: "Champion-level habits across most sections. Energy is the one thing left to push.",
        consumption:
          "Remarkable consistency throughout. Consumption is the one remaining gap in an otherwise strong profile.",
        waste:
          "Outstanding across almost every section. Waste is the one thing standing between you and an exemplary profile.",
        water: "Exceptional habits across the board. Water is the one area with room left to grow.",
        digital: "Extraordinary commitment throughout. Digital habits are the final piece.",
      },
      split:
        "Two areas are all that separate you from an exemplary profile. At this level, those gaps are visible and worth closing.",
      broad:
        "Exceptional habits overall, though a few areas are still catching up. At this level, the remaining gaps matter more than they might look.",
    },
  },

  {
    id: "sustainability-exemplar",
    label: "Sustainability Exemplar",
    minScore: 91,
    maxScore: 100,
    taglines: {
      default: "You are living the standard others should aspire to. Genuinely.",
      focused: {
        transport:
          "An exemplary profile in almost every respect. Transport is the one final detail to perfect.",
        food: "Outstanding across the board. Food choices are the last refinement in an otherwise complete picture.",
        energy:
          "Near-flawless habits throughout. Energy is the one last thing to bring to the same standard.",
        consumption:
          "An exceptional profile. Consumption is the final habit to bring in line with everything else.",
        waste: "Remarkable commitment across every area. Waste is the one remaining detail.",
        water: "An outstanding profile in every dimension. Water is the last refinement.",
        digital:
          "An exemplary commitment throughout. Digital is the final piece of a near-perfect picture.",
      },
      split:
        "Two small gaps in an otherwise exceptional profile. At this level, closing them is less about impact and more about integrity.",
      broad:
        "Exemplary by almost any measure. A few areas are still developing, and bringing those in line would complete the picture.",
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getBadge(score: number): Badge {
  return BADGES.find((b) => score >= b.minScore && score <= b.maxScore) ?? BADGES[0]!;
}

/**
 * Returns a contextual tagline based on the badge level and the spread of
 * underperforming sections (those below WEAK_THRESHOLD).
 *
 * @param badge         - result of getBadge()
 * @param weakSections  - section ids where (scaled / scaledMax) < WEAK_THRESHOLD,
 *                        ordered weakest → strongest (from getSortedSections)
 */
export function getTagline(badge: Badge, weakSections: string[]): string {
  if (weakSections.length === 0) {
    return badge.taglines.default;
  }

  if (weakSections.length === 1) {
    const sectionId = weakSections[0] as keyof Badge["taglines"]["focused"];
    return badge.taglines.focused[sectionId] ?? badge.taglines.default;
  }

  if (weakSections.length === 2) {
    return badge.taglines.split;
  }

  return badge.taglines.broad;
}
