import type { Question, SectionMeta } from '../../types/app.types'

export const consumptionMeta: SectionMeta = {
  id: 'consumption',
  label: 'Consumption',
  icon: 'mdi-shopping-outline',
  description: 'The things you buy carry an environmental cost long before they reach you. From printing habits and clothing to device longevity and circular choices, it all adds up.',
  maxRaw: 20,
  scaledMax: 40,
}

export const consumptionQuestions: Question[] = [
  {
    id: 'printing_habits',
    text: 'Do you print documents, notes, and reference materials, or do you go digital?',
    whyItMatters:
      'Each A4 sheet carries approximately 10 g CO₂eq in manufacturing, from forestry and pulp processing to final paper production. Digital alternatives are universally available and cost nothing. Consistently going digital can eliminate hundreds of sheets\' worth of embedded emissions per year.',
    options: [
      { label: 'Always digital. I never print', points: 5 },
      { label: 'Mostly digital. I print only when truly required', points: 4 },
      { label: 'Mix of digital and print, roughly equal', points: 3 },
      { label: 'Mostly print. Digital is the exception', points: 2 },
      { label: 'Always print. I print everything by default', points: 1 },
    ],
  },
  {
    id: 'clothing_purchases',
    text: 'In the past month, roughly how many unplanned purchases of clothes or accessories did you make?',
    whyItMatters:
      'Production, from fibre growing and spinning to dyeing and assembly, accounts for over 75% of a garment\'s lifecycle carbon footprint. Extending a garment\'s useful life by just nine months reduces its carbon, water, and waste footprint by 20–30%. The global fashion industry produces approximately 1.2 billion tonnes of CO₂e per year, more than international aviation and shipping combined.',
    options: [
      { label: 'Zero. No unplanned clothing purchases', points: 5 },
      { label: 'Once. One unplanned purchase', points: 4 },
      { label: 'Two to three unplanned purchases', points: 3 },
      { label: 'Four to six unplanned purchases', points: 2 },
      { label: 'More than six. Frequent unplanned purchases', points: 1 },
    ],
  },
  {
    id: 'device_longevity',
    text: 'How long do you typically use your phone before replacing it?',
    whyItMatters:
      'Making a smartphone generates approximately 70–80 kg CO₂eq, most of that at production, not during use. Keeping a phone for four years instead of two roughly halves its annual carbon cost. When the battery degrades, replacing it rather than the whole device extends life by one to two years and avoids the full manufacturing emissions of a new phone.',
    options: [
      { label: 'Until it completely stops working. I repair rather than replace', points: 5 },
      { label: '4 or more years', points: 4 },
      { label: '2 to 3 years', points: 3 },
      { label: '1 to 2 years', points: 2 },
      { label: 'Under a year. I upgrade with each new model', points: 1 },
    ],
  },
  {
    id: 'circular_economy',
    text: 'In the past three months, how many times did you borrow, rent, or buy secondhand instead of buying new?',
    whyItMatters:
      'Borrowing or buying secondhand eliminates the manufacturing emissions of every new item avoided. Keeping products in use longer and circulating them between users is one of the highest-leverage consumption actions available. Libraries, peer lending, secondhand markets, and rental services all make this easier than it\'s ever been.',
    options: [
      { label: 'More than five times. This is my consistent default', points: 5 },
      { label: 'Three to five times', points: 4 },
      { label: 'Once or twice', points: 3 },
      { label: 'None. I thought about it but still bought new', points: 2 },
      { label: 'None. I always buy new without considering alternatives', points: 1 },
    ],
  },
]
