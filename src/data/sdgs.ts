import type { SDG, SdgChip } from "../types/app.types";
export type { SdgChip };

export const SDGS: SDG[] = [
  {
    id: "sdg-2",
    number: 2,
    name: "Zero Hunger",
    sectionIds: ["food"],
  },
  {
    id: "sdg-3",
    number: 3,
    name: "Good Health and Wellbeing",
    sectionIds: ["food", "water"],
  },
  {
    id: "sdg-6",
    number: 6,
    name: "Clean Water and Sanitation",
    sectionIds: ["water"],
  },
  {
    id: "sdg-7",
    number: 7,
    name: "Affordable and Clean Energy",
    sectionIds: ["energy"],
  },
  {
    id: "sdg-9",
    number: 9,
    name: "Industry, Innovation and Infrastructure",
    sectionIds: ["digital"],
  },
  {
    id: "sdg-11",
    number: 11,
    name: "Sustainable Cities and Communities",
    sectionIds: ["transport"],
  },
  {
    id: "sdg-12",
    number: 12,
    name: "Responsible Consumption and Production",
    sectionIds: ["waste", "consumption", "food"],
  },
  {
    id: "sdg-13",
    number: 13,
    name: "Climate Action",
    sectionIds: ["energy", "transport"],
  },
  {
    id: "sdg-14",
    number: 14,
    name: "Life Below Water",
    sectionIds: ["waste"],
  },
  {
    id: "sdg-15",
    number: 15,
    name: "Life on Land",
    sectionIds: ["waste", "consumption"],
  },
];

/**
 * Returns SDGs relevant to a given section, deduplicated.
 */
export function getSdgsForSection(sectionId: string): SDG[] {
  return SDGS.filter((sdg) => sdg.sectionIds.includes(sectionId));
}

/**
 * Given a map of sectionId → performance tier colour token,
 * returns a flat deduplicated list of SDGs with their colour attached.
 * Deduplication favours the worse colour (error > warning > info > success).
 */
const TIER_RANK: Record<string, number> = {
  error: 0,
  warning: 1,
  info: 2,
  success: 3,
};

export function buildSdgChips(
  sectionColorMap: Record<string, string>, // sectionId → 'error' | 'warning' | 'info' | 'success'
): SdgChip[] {
  const seen = new Map<string, SdgChip>();
  for (const [sectionId, color] of Object.entries(sectionColorMap)) {
    const sdgs = getSdgsForSection(sectionId);
    for (const sdg of sdgs) {
      const existing = seen.get(sdg.id);
      if (!existing || (TIER_RANK[color] ?? Infinity) < (TIER_RANK[existing.color] ?? Infinity)) {
        seen.set(sdg.id, { sdg, color });
      }
    }
  }
  return [...seen.values()].sort((a, b) => a.sdg.number - b.sdg.number);
}
