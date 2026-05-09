import type { QuestionInsight } from "@/types/app.types";

export const CONSUMPTION_INSIGHTS: QuestionInsight[] = [
  // printing_habits
  {
    sectionId: "consumption",
    questionId: "printing_habits",
    score: 5,
    icon: "mdi-printer-off",
    text: "Going fully digital means no paper, no ink, and no energy cost from printing. Every document stays in the system it was created in.",
  },
  {
    sectionId: "consumption",
    questionId: "printing_habits",
    score: 4,
    icon: "mdi-printer-off",
    text: 'Printing only when truly required is close to the ceiling. The gap is what "truly required" actually means. Challenge one more print decision per week by opening the file on screen first.',
  },
  {
    sectionId: "consumption",
    questionId: "printing_habits",
    score: 3,
    icon: "mdi-printer-off",
    text: "Printing roughly half the time means printing is still a reflex. Before your next print, open the file on screen first. Most documents don't need a physical copy once you look at them that way.",
  },
  {
    sectionId: "consumption",
    questionId: "printing_habits",
    score: 2,
    icon: "mdi-printer-off",
    text: "Printing as the default means paper and ink are consumed for documents that could stay digital. Start with your notes: open them on your phone at your next session.",
  },
  {
    sectionId: "consumption",
    questionId: "printing_habits",
    score: 1,
    icon: "mdi-printer-off",
    text: "Printing everything by default means every document generates paper and ink waste. Read one document on screen today instead of printing it.",
  },

  // clothing_purchases
  {
    sectionId: "consumption",
    questionId: "clothing_purchases",
    score: 5,
    icon: "mdi-hanger",
    text: "Zero unplanned purchases means your buying is fully intentional. Every item you own was chosen, not grabbed. That discipline removes demand for unnecessary production.",
  },
  {
    sectionId: "consumption",
    questionId: "clothing_purchases",
    score: 4,
    icon: "mdi-hanger",
    text: "One unplanned purchase is a small gap in an otherwise disciplined pattern. A written list prepared before you leave, not at the market, closes it.",
  },
  {
    sectionId: "consumption",
    questionId: "clothing_purchases",
    score: 3,
    icon: "mdi-hanger",
    text: "Two to three unplanned purchases means impulse buying is an occasional but consistent pattern. Apply a 24-hour rule: if you see something unplanned, note it and return the next day if you still want it.",
  },
  {
    sectionId: "consumption",
    questionId: "clothing_purchases",
    score: 2,
    icon: "mdi-hanger",
    text: "Four to six unplanned purchases in a month means the shopping habit lacks a boundary. Write your list the night before your next trip and buy only what is on it.",
  },
  {
    sectionId: "consumption",
    questionId: "clothing_purchases",
    score: 1,
    icon: "mdi-hanger",
    text: "More than six unplanned purchases is a frequent pattern. Write a list of three things you need before your next trip and buy only those three.",
  },

  // device_longevity
  {
    sectionId: "consumption",
    questionId: "device_longevity",
    score: 5,
    icon: "mdi-cellphone-check",
    text: "Using a device until it stops working, and repairing rather than replacing, spreads the manufacturing cost (roughly 70 to 80 kg CO₂ for a smartphone) across the maximum possible years.",
  },
  {
    sectionId: "consumption",
    questionId: "device_longevity",
    score: 4,
    icon: "mdi-cellphone-check",
    text: "Four or more years of use is well above average. When the next fault appears, check the repair cost first: extending the life by another year is usually achievable and significantly cheaper.",
  },
  {
    sectionId: "consumption",
    questionId: "device_longevity",
    score: 3,
    icon: "mdi-cellphone-check",
    text: "Two to three years is a common replacement cycle but not the most efficient. Before your next upgrade, get a repair quote: a battery replacement or screen fix often adds one to two years of use at low cost.",
  },
  {
    sectionId: "consumption",
    questionId: "device_longevity",
    score: 2,
    icon: "mdi-cellphone-check",
    text: "One to two years of use means most of the device's usable life is discarded. Get a repair quote on your current device before considering any replacement.",
  },
  {
    sectionId: "consumption",
    questionId: "device_longevity",
    score: 1,
    icon: "mdi-cellphone-check",
    text: "Replacing at every new model means devices are discarded with most of their life unused. Skip one upgrade cycle. Your current device almost certainly has more usable life remaining.",
  },

  // circular_economy
  {
    sectionId: "consumption",
    questionId: "circular_economy",
    score: 5,
    icon: "mdi-swap-horizontal",
    text: "Borrowing, renting, or buying secondhand consistently means the manufacturing footprint of those items is shared or reused rather than generated again.",
  },
  {
    sectionId: "consumption",
    questionId: "circular_economy",
    score: 4,
    icon: "mdi-swap-horizontal",
    text: "Three to five secondhand or borrowed purchases is a strong pattern. For the remaining new purchases, check secondhand first as a standing rule.",
  },
  {
    sectionId: "consumption",
    questionId: "circular_economy",
    score: 3,
    icon: "mdi-swap-horizontal",
    text: "One or two secondhand choices shows the option is available but not yet the default. Make secondhand the first check, not an afterthought, for every new purchase you consider.",
  },
  {
    sectionId: "consumption",
    questionId: "circular_economy",
    score: 2,
    icon: "mdi-swap-horizontal",
    text: "Thinking about it but buying new means awareness exists without action. Next time you need something, check one secondhand source before purchasing. That check is the habit.",
  },
  {
    sectionId: "consumption",
    questionId: "circular_economy",
    score: 1,
    icon: "mdi-swap-horizontal",
    text: "Always buying new without considering alternatives means every purchase generates its full manufacturing footprint. Search secondhand for the next item you need. One search, one time.",
  },
];
