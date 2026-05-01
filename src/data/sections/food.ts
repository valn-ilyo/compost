import type { Question, SectionMeta } from '../../types/app.types'

export const foodMeta: SectionMeta = {
  id: 'food',
  label: 'Food & Diet',
  icon: 'mdi-food-apple-outline',
  description: 'What you eat and how much you waste are two of the highest-impact daily choices you make. Diet and food habits shape a significant slice of your footprint.',
  maxRaw: 25,
  scaledMax: 75,
}

export const foodQuestions: Question[] = [
  {
    id: 'diet_type',
    text: 'What best describes your usual diet? Choose your most typical pattern — not your best or worst day.',
    whyItMatters:
      'Animal-sourced foods contribute 56–58% of food-related greenhouse gas emissions despite providing only 37% of global protein. Beef from dedicated beef herds produces approximately 35 kg CO₂eq per 100g protein — around 90 times the footprint of peas. A full dietary shift away from animal products could reduce food-system emissions by approximately 49% globally.',
    options: [
      { label: 'Mostly plant-based or vegan', points: 5 },
      { label: 'Vegetarian — no meat or fish', points: 4 },
      { label: 'Mixed — plant-based most days, meat or fish a few times a week', points: 3 },
      { label: 'Non-vegetarian most meals', points: 2 },
      { label: 'Heavy red meat — beef or pork almost every day', points: 1 },
    ],
  },
  {
    id: 'plate_waste',
    text: 'How often do you leave food uneaten on your plate or throw cooked food away?',
    whyItMatters:
      'Roughly one-third of all food produced globally is lost or wasted — approximately 1.3 billion tonnes per year. The carbon footprint of wasted food is approximately 3.3 billion tonnes of CO₂eq per year, making it the world\'s third-largest emitter if counted as a country. Every meal wasted carries the full embedded emissions of its production.',
    options: [
      { label: 'Almost never — I take only what I will eat', points: 5 },
      { label: 'Rarely — once or twice a week at most', points: 4 },
      { label: 'Sometimes — three to four times a week', points: 3 },
      { label: 'Often — nearly every day', points: 2 },
      { label: 'Very often — I regularly discard half-eaten food', points: 1 },
    ],
  },
  {
    id: 'leftovers',
    text: 'What do you typically do with cooked leftovers?',
    whyItMatters:
      'Saving and consuming leftovers prevents the full embedded emissions, water, and land of food production from being wasted. In many South and Southeast Asian countries, the cultural practice of saving leftovers already represents a significant built-in sustainability advantage — this question rewards and reinforces it.',
    options: [
      { label: 'Save and eat later — always', points: 5 },
      { label: 'Usually save them', points: 4 },
      { label: 'Sometimes save, sometimes discard', points: 3 },
      { label: 'Usually discard', points: 2 },
      { label: 'Always throw away', points: 1 },
    ],
  },
  {
    id: 'packaged_food',
    text: 'How often do you buy packaged snacks, instant noodles, or bottled drinks rather than fresh or home-prepared food?',
    whyItMatters:
      'Packaged food carries a dual environmental cost: the food production footprint and the packaging waste footprint. Food processing and packaging together account for approximately 6% of total food-system emissions — a share that compounds with the agricultural production footprint of the contents, plus unrecyclable packaging entering the waste stream.',
    options: [
      { label: 'Never — I bring home-prepared or fresh unpackaged food', points: 5 },
      { label: '1 to 2 times a week', points: 4 },
      { label: '3 to 4 times a week', points: 3 },
      { label: 'Once or twice daily', points: 2 },
      { label: 'Multiple times every day', points: 1 },
    ],
  },
  {
    id: 'local_food',
    text: 'In a typical week, how many of your food purchases are local, seasonal, or unpackaged fresh alternatives?',
    whyItMatters:
      'Locally and seasonally sourced food has a substantially lower transport and storage emissions footprint than imported or out-of-season equivalents. Transport accounts for approximately 6% of food-system emissions — a minority share that compounds with the processing and packaging footprint of imported foods. Fresh, local, unpackaged produce also generates less plastic waste.',
    options: [
      { label: 'Most or all — local, seasonal, or fresh and unpackaged', points: 5 },
      { label: 'More than half my food choices', points: 4 },
      { label: 'About half — roughly 50/50', points: 3 },
      { label: 'Fewer than half — mostly packaged or imported options', points: 2 },
      { label: 'Almost none — I rarely or never buy local or seasonal produce', points: 1 },
    ],
  },
]
