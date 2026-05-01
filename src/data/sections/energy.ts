import type { Question, SectionMeta } from '../../types/app.types'

export const energyMeta: SectionMeta = {
  id: 'energy',
  label: 'Energy',
  icon: 'mdi-lightning-bolt-outline',
  description: 'Residential and workplace electricity use accounts for around a fifth of global energy-related CO2 emissions. Your daily habits at home and at work matter.',
  maxRaw: 25,
  scaledMax: 50,
}

export const energyQuestions: Question[] = [
  {
    id: 'lights_off',
    text: 'Do you switch off fans, lights, and appliances when you leave a room?',
    whyItMatters:
      'Each 100W device left on unnecessarily for one extra hour per day adds approximately 36.5 kWh to annual consumption. Consistent switching off is the single most impactful and accessible daily energy habit — requiring no equipment, no cost, and no expertise. In countries with coal-heavy electricity grids, every unit saved has a direct emissions benefit.',
    options: [
      { label: 'Always — it is a firm, daily habit', points: 5 },
      { label: 'Usually', points: 4 },
      { label: 'Sometimes — I forget occasionally', points: 3 },
      { label: 'Rarely', points: 2 },
      { label: 'Never', points: 1 },
    ],
  },
  {
    id: 'standby_power',
    text: 'Do you unplug chargers and power strips when devices are fully charged or not in use?',
    whyItMatters:
      'Devices left plugged in when not in use — chargers, power strips, televisions on standby — account for an estimated 5–10% of household electricity consumption. A phone charger left plugged in continuously draws standby power even when no device is connected. These phantom loads are completely preventable.',
    options: [
      { label: 'Always — I unplug immediately when charging is done', points: 5 },
      { label: 'Usually', points: 4 },
      { label: 'Sometimes', points: 3 },
      { label: 'Rarely — chargers stay plugged in', points: 2 },
      { label: 'Never — devices stay plugged in continuously', points: 1 },
    ],
  },
  {
    id: 'natural_light',
    text: 'Do you use natural daylight rather than switching on electric lights during the day?',
    whyItMatters:
      'Natural light produces zero emissions and costs nothing. Defaulting to electric lighting when daylight is available is a direct, avoidable energy cost — particularly in homes and offices with windows that are routinely left curtained. Natural light also supports circadian rhythm and reduces eye strain.',
    options: [
      { label: 'Always — I open curtains and sit near windows', points: 5 },
      { label: 'Usually', points: 4 },
      { label: 'Sometimes', points: 3 },
      { label: 'Rarely — I prefer electric light', points: 2 },
      { label: 'Never', points: 1 },
    ],
  },
  {
    id: 'shared_space_energy',
    text: 'In shared spaces — offices, common rooms, meeting rooms — do you switch off fans and lights when you leave?',
    whyItMatters:
      'Shared-space energy waste is disproportionately high in workplaces and institutions where diffusion of responsibility means nobody switches off. A single meeting room or office floor left lit and ventilated overnight can consume as much energy as a household does in a day. The last person out has the highest-leverage opportunity.',
    options: [
      { label: 'Always — I actively check before leaving', points: 5 },
      { label: 'Usually', points: 4 },
      { label: 'Sometimes', points: 3 },
      { label: 'Rarely — I assume someone else will', points: 2 },
      { label: 'Never', points: 1 },
    ],
  },
  {
    id: 'power_saving_mode',
    text: 'Do you use power-saving or auto-brightness settings on your phone and laptop?',
    whyItMatters:
      'Auto-brightness alone can reduce screen energy use by 20–30% compared to maximum brightness. Power-saving mode limits background processes and network polling, reducing consumption further. These settings take thirty seconds to enable and reduce device energy use every day without any further effort — making them one of the highest-return-on-effort energy actions available.',
    options: [
      { label: 'Always — power-saving and auto-brightness are permanently enabled', points: 5 },
      { label: 'Usually — enabled most of the time', points: 4 },
      { label: 'Sometimes — I enable them when battery is low but not as a default', points: 3 },
      { label: 'Rarely — I keep brightness high and do not use power-saving', points: 2 },
      { label: 'Never — I do not use these settings', points: 1 },
    ],
  },
]
