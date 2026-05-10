import type { QuestionInsight } from "@/types/app";

export const WATER_INSIGHTS: QuestionInsight[] = [
  // bathing_method
  {
    sectionId: "water",
    questionId: "bathing_method",
    score: 5,
    icon: "mdi-shower-head",
    text: "Bucket bathing consistently uses 15 to 20 litres per wash versus 60 to 80 for a 10-minute shower. That difference is fixed and daily.",
  },
  {
    sectionId: "water",
    questionId: "bathing_method",
    score: 4,
    icon: "mdi-shower-head",
    text: "A shower under 5 minutes is a controlled habit. The gap to score 5 is method: a bucket bath uses roughly half the water of even a 5-minute shower.",
  },
  {
    sectionId: "water",
    questionId: "bathing_method",
    score: 3,
    icon: "mdi-shower-head",
    text: "Showering 5 to 10 minutes means water use is above the bucket baseline. Set a 5-minute timer before stepping in. When it rings, turn off. Work toward one bucket bath per week.",
  },
  {
    sectionId: "water",
    questionId: "bathing_method",
    score: 2,
    icon: "mdi-shower-head",
    text: "Showering over 10 minutes is among the highest personal water uses available. Set a 7-minute timer and reduce by one minute per week until you reach 5 or less.",
  },
  {
    sectionId: "water",
    questionId: "bathing_method",
    score: 1,
    icon: "mdi-shower-head",
    text: "No awareness of shower duration means water use is unchecked. Set a timer before your next shower, any duration. Knowing how long you take is the first corrective step.",
  },

  // tap_behaviour
  {
    sectionId: "water",
    questionId: "tap_behaviour",
    score: 5,
    icon: "mdi-water-off",
    text: "Turning off the tap whenever you're not actively rinsing eliminates idle flow entirely. At 6 litres per minute, none of that water is wasted under this habit.",
  },
  {
    sectionId: "water",
    questionId: "tap_behaviour",
    score: 4,
    icon: "mdi-water-off",
    text: "Usually turning off the tap is close to complete. The gap is the occasions you leave it running. Make the rule unconditional: soap or brush in hand, tap off, no exceptions this week.",
  },
  {
    sectionId: "water",
    questionId: "tap_behaviour",
    score: 3,
    icon: "mdi-water-off",
    text: "Sometimes turning off the tap means idle flow still occurs regularly. Make it a physical rule: the moment your hand touches the toothbrush or soap, the tap is already off.",
  },
  {
    sectionId: "water",
    questionId: "tap_behaviour",
    score: 2,
    icon: "mdi-water-off",
    text: "Rarely turning off the tap means idle flow runs through most of every brushing and washing session. At your next brushing session, turn off the tap as soon as you start. That one session starts the habit.",
  },
  {
    sectionId: "water",
    questionId: "tap_behaviour",
    score: 1,
    icon: "mdi-water-off",
    text: "Tap running throughout brushing and washing means up to 4,000 litres per year per person is wasted at this single moment. Turn the tap off tonight before bed when you brush. Wet the brush, then off.",
  },

  // dishwashing_method
  {
    sectionId: "water",
    questionId: "dishwashing_method",
    score: 5,
    icon: "mdi-bowl-outline",
    text: "Always using a filled basin means dishwashing uses 5 to 10 litres per session instead of up to 30. That saving occurs at every wash.",
  },
  {
    sectionId: "water",
    questionId: "dishwashing_method",
    score: 4,
    icon: "mdi-bowl-outline",
    text: "Usually using a basin is close to the target. The remaining occasions with a running tap are the gap. Make filling the basin the first action before touching any dish, non-negotiable.",
  },
  {
    sectionId: "water",
    questionId: "dishwashing_method",
    score: 3,
    icon: "mdi-bowl-outline",
    text: "Mixing basin and running tap means the saving is inconsistent. Fill the basin before starting and commit to completing the full week using only that method.",
  },
  {
    sectionId: "water",
    questionId: "dishwashing_method",
    score: 2,
    icon: "mdi-bowl-outline",
    text: "Mostly using a running tap means each wash uses significantly more water than needed. Fill a bowl with soapy water first and wash everything in it. Use the running tap only to rinse at the end.",
  },
  {
    sectionId: "water",
    questionId: "dishwashing_method",
    score: 1,
    icon: "mdi-bowl-outline",
    text: "Always leaving the tap running throughout washing means up to 20 extra litres are used per session. Fill the sink or a large bowl before you start today.",
  },

  // laundry_method
  {
    sectionId: "water",
    questionId: "laundry_method",
    score: 5,
    icon: "mdi-washing-machine",
    text: "Full loads with rinse water reuse is the highest-efficiency laundry approach. Every drop of water used is maximised across the largest possible load.",
  },
  {
    sectionId: "water",
    questionId: "laundry_method",
    score: 4,
    icon: "mdi-washing-machine",
    text: "Always running full loads is strong. The next step is reusing the final rinse water for mopping or watering: that closes the last gap.",
  },
  {
    sectionId: "water",
    questionId: "laundry_method",
    score: 3,
    icon: "mdi-washing-machine",
    text: "Mixing full and partial loads means water use per garment varies widely. Check the load before starting: if it's not full, wait one more day. Partial loads use the same water as full ones.",
  },
  {
    sectionId: "water",
    questionId: "laundry_method",
    score: 2,
    icon: "mdi-washing-machine",
    text: "Small or single-item loads are the least efficient laundry habit. Place items in a basket and wait until it is full before washing. That one change cuts water and electricity use per garment significantly.",
  },
  {
    sectionId: "water",
    questionId: "laundry_method",
    score: 1,
    icon: "mdi-washing-machine",
    text: "Washing individual items under running water is the highest per-garment water use. Fill a bucket, collect a few items, and wash everything together. Do this once today to replace the running tap.",
  },

  // drinking_water_source
  {
    sectionId: "water",
    questionId: "drinking_water_source",
    score: 5,
    icon: "mdi-bottle-tonic-outline",
    text: "Using tap or filtered tap water consistently means you generate no plastic waste from drinking water and avoid the energy cost of bottled water production.",
  },
  {
    sectionId: "water",
    questionId: "drinking_water_source",
    score: 4,
    icon: "mdi-bottle-tonic-outline",
    text: "Mostly using tap with occasional bottled is close to the target. The gap is the travel situations. Keep a filled reusable bottle with you every time you leave home.",
  },
  {
    sectionId: "water",
    questionId: "drinking_water_source",
    score: 3,
    icon: "mdi-bottle-tonic-outline",
    text: "Equal tap and bottled means the refill habit isn't yet consistent. Fill your bottle as the last step before leaving home every morning. Place it next to your keys tonight.",
  },
  {
    sectionId: "water",
    questionId: "drinking_water_source",
    score: 2,
    icon: "mdi-bottle-tonic-outline",
    text: "Mostly bottled water generates hundreds of plastic bottles per year. Start refilling one bottle per morning before you leave. That one daily action replaces the first and most frequent bottled purchase.",
  },
  {
    sectionId: "water",
    questionId: "drinking_water_source",
    score: 1,
    icon: "mdi-bottle-tonic-outline",
    text: "Always using single-use bottled water is the highest-impact drinking water habit. Fill any bottle you own from the tap today and carry it. That one act starts the replacement.",
  },

  // leak_reporting
  {
    sectionId: "water",
    questionId: "leak_reporting",
    score: 5,
    icon: "mdi-pipe-leak",
    text: "Reporting immediately and following up means leaks are stopped rather than just noted. A dripping tap at 15 to 20 litres per day is fully preventable once reported and fixed.",
  },
  {
    sectionId: "water",
    questionId: "leak_reporting",
    score: 4,
    icon: "mdi-pipe-leak",
    text: "Reporting once is the most important step. The gap is follow-up: add a reminder for three days after reporting to check whether it was fixed.",
  },
  {
    sectionId: "water",
    questionId: "leak_reporting",
    score: 3,
    icon: "mdi-pipe-leak",
    text: "Informal mentions often don't reach the person who can act. A message to building management is what triggers a repair. One message, correctly addressed.",
  },
  {
    sectionId: "water",
    questionId: "leak_reporting",
    score: 2,
    icon: "mdi-pipe-leak",
    text: "Noticing but not reporting leaves the leak running. Find out who manages maintenance in your building and save their contact. The next time you notice a leak, you have nowhere to delay.",
  },
  {
    sectionId: "water",
    questionId: "leak_reporting",
    score: 1,
    icon: "mdi-pipe-leak",
    text: "Not paying attention to leaks means preventable water waste continues unaddressed. Notice one dripping tap or running pipe this week and report it to whoever is responsible for the building.",
  },
];
