import type { QuestionInsight } from "@/types/app.types";

export const TRANSPORT_INSIGHTS: QuestionInsight[] = [
  // commute_mode
  {
    sectionId: "transport",
    questionId: "commute_mode",
    score: 5,
    icon: "mdi-walk",
    text: "Walking or cycling eliminates commute emissions entirely and requires no trade-off. That choice compounds across every working day of the year.",
  },
  {
    sectionId: "transport",
    questionId: "commute_mode",
    score: 4,
    icon: "mdi-bus",
    text: "Shared transport is a strong choice. If any part of your route is walkable or cyclable, replacing that segment removes the remaining footprint.",
  },
  {
    sectionId: "transport",
    questionId: "commute_mode",
    score: 3,
    icon: "mdi-account-group-outline",
    text: "Group transport reduces per-person emissions but still depends on a vehicle. Check whether a public bus serves the same route: it runs regardless of your participation, so your seat adds almost nothing to the total.",
  },
  {
    sectionId: "transport",
    questionId: "commute_mode",
    score: 2,
    icon: "mdi-motorbike",
    text: "A single-occupancy motorbike carries a meaningful per-trip footprint. Identify one day this week where shared transport covers your route and use it.",
  },
  {
    sectionId: "transport",
    questionId: "commute_mode",
    score: 1,
    icon: "mdi-car-off",
    text: "A private car alone is the highest-emission commute option. Find the shared transport route for your destination and take it once this week.",
  },

  // commute_distance — noHabit: distance is a fixed fact, not a repeatable behaviour.
  {
    sectionId: "transport",
    questionId: "commute_distance",
    score: 5,
    noHabit: true,
    icon: "mdi-home-outline",
    text: "Living on-site removes commute emissions entirely. That's the structural ceiling of commute impact reduction, and you're already there.",
  },
  {
    sectionId: "transport",
    questionId: "commute_distance",
    score: 4,
    noHabit: true,
    icon: "mdi-walk",
    text: "Under 2 km is walkable or cyclable for most people. If you're not already doing this on every trip, that's the one remaining gap.",
  },
  {
    sectionId: "transport",
    questionId: "commute_distance",
    score: 3,
    noHabit: true,
    icon: "mdi-bicycle",
    text: "2 to 5 km is within cycling range and well within shared transport range. If you're using a private vehicle for this distance, replace it with one of those two options starting today.",
  },
  {
    sectionId: "transport",
    questionId: "commute_distance",
    score: 2,
    noHabit: true,
    icon: "mdi-bus",
    text: "5 to 15 km requires planning but is served by shared transport in most areas. Map your route once and use it on your next commute.",
  },
  {
    sectionId: "transport",
    questionId: "commute_distance",
    score: 1,
    noHabit: true,
    icon: "mdi-map-marker-distance",
    text: "Over 15 km commutes carry the highest transport footprints. Find the shared transport option for your route, whether bus, train, or carpool, and use it for one trip this week.",
  },

  // commute_frequency
  {
    sectionId: "transport",
    questionId: "commute_frequency",
    score: 5,
    icon: "mdi-home-outline",
    text: "No regular commute is the structural baseline that removes daily transport emissions from your footprint. Nothing you can do on commute days matches this.",
  },
  {
    sectionId: "transport",
    questionId: "commute_frequency",
    score: 4,
    icon: "mdi-calendar-check",
    text: "One to two commute days per week is already low. The remaining impact comes from mode: make sure those trips use shared or active transport.",
  },
  {
    sectionId: "transport",
    questionId: "commute_frequency",
    score: 3,
    icon: "mdi-calendar-week",
    text: "Three to four days of commuting is above average. Mode determines the footprint on each of those days. Switch to shared transport on every commute day.",
  },
  {
    sectionId: "transport",
    questionId: "commute_frequency",
    score: 2,
    icon: "mdi-bus",
    text: "Five to six commute days is a daily pattern. Use shared transport on at least three of those days this week.",
  },
  {
    sectionId: "transport",
    questionId: "commute_frequency",
    score: 1,
    icon: "mdi-car-off",
    text: "Daily commuting by private vehicle is the highest-impact transport pattern. Replace one commute day with shared transport this week.",
  },

  // short_trips
  {
    sectionId: "transport",
    questionId: "short_trips",
    score: 5,
    icon: "mdi-walk",
    text: "Walking every short trip eliminates that segment of your footprint and requires no planning. The habit is already right.",
  },
  {
    sectionId: "transport",
    questionId: "short_trips",
    score: 4,
    icon: "mdi-walk",
    text: "Walking most of the time is close to the ceiling. The gap is the trips where you choose otherwise: commit to walking for any trip under 2 km, no exceptions.",
  },
  {
    sectionId: "transport",
    questionId: "short_trips",
    score: 3,
    icon: "mdi-map-marker-path",
    text: "Short trips by shared transport are not zero-emission. For distances under 2 km, walking is faster than waiting and costs nothing. Remove the decision: walk every time.",
  },
  {
    sectionId: "transport",
    questionId: "short_trips",
    score: 2,
    icon: "mdi-bus",
    text: "Shared transport for sub-2 km trips adds transport emissions where none are needed. Walk the next three short trips before reconsidering any other option.",
  },
  {
    sectionId: "transport",
    questionId: "short_trips",
    score: 1,
    icon: "mdi-car-off",
    text: "A private vehicle for sub-2 km distances is the least efficient option available. Walk one errand today. Distance under 2 km, on foot, no exception.",
  },

  // discretionary_mode
  {
    sectionId: "transport",
    questionId: "discretionary_mode",
    score: 5,
    icon: "mdi-bus",
    text: "Actively choosing shared transport for every local trip removes private vehicle use from your local travel footprint entirely.",
  },
  {
    sectionId: "transport",
    questionId: "discretionary_mode",
    score: 4,
    icon: "mdi-bus",
    text: "Using shared transport on most trips is strong. The remaining gap is the occasions where you default to private. Identify those specific trips and plan the shared alternative in advance.",
  },
  {
    sectionId: "transport",
    questionId: "discretionary_mode",
    score: 3,
    icon: "mdi-car-multiple",
    text: "Half private and half shared means the habit isn't yet default. Pick shared transport as the rule, private as the exception. Start by committing shared for the next seven days.",
  },
  {
    sectionId: "transport",
    questionId: "discretionary_mode",
    score: 2,
    icon: "mdi-car-off",
    text: "Rarely choosing shared transport means the default is private. That default needs to reverse. Take shared transport for your next local errand regardless of convenience.",
  },
  {
    sectionId: "transport",
    questionId: "discretionary_mode",
    score: 1,
    icon: "mdi-car-off",
    text: "Always using a private vehicle for local travel is a daily pattern with a direct fix. Find the shared transport option for your most common local trip and use it once this week.",
  },
];
