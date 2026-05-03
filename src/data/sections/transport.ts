import type { Question, SectionMeta } from '../../types/app.types'

export const transportMeta: SectionMeta = {
  id: 'transport',
  label: 'Transport',
  icon: 'mdi-bus-multiple',
  description: 'How you get around is typically the largest or second-largest component of your personal carbon footprint. Your daily travel choices carry serious weight.',
  maxRaw: 25,
  scaledMax: 75,
}

export const transportQuestions: Question[] = [
  {
    id: 'commute_mode',
    text: 'How do you usually travel to your workplace, institution, or daily destination on a typical weekday?',
    whyItMatters:
      'Personal vehicles dominate transport emissions globally. Cars and two-wheelers account for approximately 75% of all passenger-transport CO₂ emissions, despite shared modes carrying roughly 20% of passengers at only 7% of those emissions. The mode you choose every weekday is the single most repeated transport decision you make.',
    options: [
      { label: 'Walk or cycle', points: 5 },
      { label: 'Shared taxi or public bus', points: 4 },
      { label: 'Organised group transport (company bus, pool vehicle)', points: 3 },
      { label: 'Personal motorbike or scooter', points: 2 },
      { label: 'Private car, single-occupancy', points: 1 },
    ],
  },
  {
    id: 'commute_distance',
    text: 'Approximately how far is your home from your primary daily destination?',
    whyItMatters:
      'Distance shapes the total carbon budget of every trip you make. People who live on-site or within walking distance have near-zero commute emissions. Longer distances make active travel difficult and increase dependence on motorised transport.',
    options: [
      { label: 'I live on-site or within the same building (no commute)', points: 5 },
      { label: 'Less than 2 km (walkable or cyclable)', points: 4 },
      { label: '2 to 5 km', points: 3 },
      { label: '5 to 15 km', points: 2 },
      { label: 'More than 15 km', points: 1 },
    ],
  },
  {
    id: 'commute_frequency',
    text: 'How many days a week do you travel to your workplace or regular destination?',
    whyItMatters:
      'Frequency multiplies the emissions of any given mode choice. Daily motorised commuting compounds the impact of using a private vehicle. People who work remotely, live on-site, or travel infrequently have structurally lower transport footprints regardless of mode.',
    options: [
      { label: 'I work or live on-site (no regular commute needed)', points: 5 },
      { label: '1 to 2 days a week (mostly remote or local)', points: 4 },
      { label: '3 to 4 days a week', points: 3 },
      { label: '5 to 6 days a week by shared or public transport', points: 2 },
      { label: '5 to 6 days a week by personal vehicle', points: 1 },
    ],
  },
  {
    id: 'short_trips',
    text: 'For short local trips under 2 km, what do you usually do?',
    whyItMatters:
      'Short motorised trips from a cold engine can produce up to twice the per-kilometre CO₂ of a longer journey. Walking eliminates emissions entirely and is time-competitive with a vehicle in most urban settings for distances under 2 km. These are among the most avoidable transport emissions in daily life.',
    options: [
      { label: 'Walk, always', points: 5 },
      { label: 'Walk most of the time', points: 4 },
      { label: 'Mix of walking and shared transport', points: 3 },
      { label: 'Take shared transport', points: 2 },
      { label: 'Take a private vehicle regardless of distance', points: 1 },
    ],
  },
  {
    id: 'discretionary_mode',
    text: 'When travelling locally for errands or visits, do you generally choose shared transport over a private vehicle?',
    whyItMatters:
      'Your mode preference for discretionary travel, not just the daily commute, predicts your total personal transport emissions. Consistent shared-mode use across all trip types, not just peak-hour commuting, keeps the full footprint low.',
    options: [
      { label: 'Always. I actively choose shared transport', points: 5 },
      { label: 'Usually', points: 4 },
      { label: 'About half and half', points: 3 },
      { label: 'Rarely. I prefer private', points: 2 },
      { label: 'Never. Always a private vehicle', points: 1 },
    ],
  },
]
