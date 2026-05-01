import type { Question, SectionMeta } from "../../types/app.types";

export const waterMeta: SectionMeta = {
  id: "water",
  label: "Water",
  icon: "mdi-waves",
  description:
    "Fresh water is finite and unevenly distributed. How efficiently you use it at home has a direct impact on one of the planet's most pressured resources.",
  maxRaw: 30,
  scaledMax: 25,
};

export const waterQuestions: Question[] = [
  {
    id: "bathing_method",
    text: "How do you usually bathe?",
    whyItMatters:
      "Bathing is the single largest discretionary domestic water use. A bucket bath uses 15–20 litres; a 10-minute shower uses 60–80 litres; a full bathtub uses 150–300 litres. This single choice accounts for the largest share of your daily water footprint.",
    options: [
      { label: "Bucket bath — always", points: 5 },
      { label: "Short shower — under 5 minutes", points: 4 },
      { label: "Regular shower — 5 to 10 minutes", points: 3 },
      { label: "Long shower — over 10 minutes", points: 2 },
      { label: "Very long shower or bathtub", points: 1 },
    ],
  },
  {
    id: "tap_behaviour",
    text: "Do you turn off the tap while soaping up or brushing your teeth?",
    whyItMatters:
      "A standard tap flows at ~6 litres per minute. Leaving it running for 2 minutes while brushing teeth wastes ~12 litres — nearly a full bucket bath. Across a household of four brushing twice daily, that is over 17,000 litres wasted per year from tooth brushing alone.",
    options: [
      { label: "Always — I turn the tap off", points: 5 },
      { label: "Usually", points: 4 },
      { label: "Sometimes", points: 3 },
      { label: "Rarely", points: 2 },
      { label: "Never — I leave the tap running", points: 1 },
    ],
  },
  {
    id: "dishwashing_method",
    text: "When washing dishes or preparing food, do you use a filled basin or bucket rather than a running tap?",
    whyItMatters:
      "A running tap during a 5-minute dishwash uses ~30 litres. Washing in a filled basin uses 5–10 litres for the same load — a saving of 65–80%. Unlike brief tap-off moments during brushing, dishwashing involves sustained water use over several minutes, making the absolute volume at stake significantly larger.",
    options: [
      { label: "Always use a filled basin or bucket", points: 5 },
      { label: "Usually use a basin; occasionally run the tap", points: 4 },
      { label: "Mix of basin and running tap", points: 3 },
      { label: "Mostly running tap; basin occasionally", points: 2 },
      { label: "Always leave the tap running throughout", points: 1 },
    ],
  },
  {
    id: "laundry_method",
    text: "When you do laundry by hand or machine, how do you manage water use?",
    whyItMatters:
      "A washing machine uses 50–70 litres per cycle regardless of load size — a half load doubles the per-garment water cost. Hand washing under a running tap for 10 minutes uses ~60 litres for just a few items. Bucket hand washing in batches is the most water-efficient method overall.",
    options: [
      {
        label: "Hand wash in a bucket, batching clothes together — and reuse rinse water",
        points: 5,
      },
      { label: "Machine wash — always a full load", points: 4 },
      { label: "Hand wash in a bucket, one or two items at a time", points: 3 },
      { label: "Machine wash with partial loads regularly", points: 2 },
      { label: "Hand wash under a running tap throughout", points: 1 },
    ],
  },
  {
    id: "drinking_water_source",
    text: "Where does your drinking water typically come from?",
    whyItMatters:
      "Producing one litre of commercially bottled water requires ~3 litres of water in manufacturing and significantly more energy than treating tap water. At 2 litres per day, single-use bottles add up to ~730 bottles per year. Where tap water is safe and tested, it is the most environmentally sound option.",
    options: [
      { label: "Direct tap or municipal supply (tested or BIS-certified safe)", points: 5 },
      { label: "Filtered tap water — home purifier, RO, or UV", points: 4 },
      { label: "Reusable bottle filled at institution or public point", points: 3 },
      { label: "Packaged water in large reusable jugs (20L)", points: 2 },
      { label: "Single-use bottled water (500ml or 1L)", points: 1 },
    ],
  },
  {
    id: "leak_reporting",
    text: "If you notice a dripping tap, leaking pipe, or running water being wasted in your home or shared building, what do you do?",
    whyItMatters:
      "A single dripping tap wastes 15–20 litres per day — over 5,000 litres per year. Most leaks in shared buildings persist for weeks or months because occupants assume someone else will act. Reporting and following up is the only action that actually stops the waste.",
    options: [
      { label: "Report immediately and follow up to confirm it is fixed", points: 5 },
      { label: "Report it once to the right person", points: 4 },
      { label: "Mention it informally to someone nearby", points: 3 },
      { label: "Notice it but do not report it", points: 2 },
      { label: "Do not notice or pay attention to leaks", points: 1 },
    ],
  },
];
