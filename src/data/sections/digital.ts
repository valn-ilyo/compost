import type { Question, SectionMeta } from '../../types/app.types'

export const digitalMeta: SectionMeta = {
  id: 'digital',
  label: 'Digital',
  icon: 'mdi-monitor-cellphone',
  description: "The internet produces roughly as much CO2 as the global aviation industry, and it's still growing. Your streaming, browsing, and device habits all add up.",
  maxRaw: 25,
  scaledMax: 25,
}

export const digitalQuestions: Question[] = [
  {
    id: 'streaming_habits',
    text: 'When you stream videos — YouTube, Netflix, social media — what quality do you typically use and for how long each day?',
    whyItMatters:
      'Video streaming is the single largest driver of individual digital carbon footprint. Streaming in HD (1080p) transfers approximately 3 GB per hour versus 0.15 GB per hour at SD (480p) — a 20× difference in data transfer and corresponding energy consumption. Streaming duration compounds this: four hours of daily 4K streaming generates significantly more data centre energy than the same time in SD.',
    options: [
      { label: 'Under 1 hour per day at SD or audio-only', points: 5 },
      { label: '1–2 hours per day at SD quality', points: 4 },
      { label: '1–2 hours per day at HD quality', points: 3 },
      { label: '3–4 hours per day at HD quality', points: 2 },
      { label: 'More than 4 hours per day, HD or 4K', points: 1 },
    ],
  },
  {
    id: 'cloud_hygiene',
    text: 'How do you manage photos, videos, and files you no longer need on your devices and cloud accounts?',
    whyItMatters:
      'Cloud-stored data requires continuous server energy to maintain, replicate, and protect. Every photo, video, or document stored indefinitely — whether needed or not — draws a small but continuous share of data centre energy. Data centres consumed an estimated 200–250 TWh globally in 2022. Unnecessary cloud accumulation is an invisible but preventable energy cost.',
    options: [
      { label: 'I regularly review and delete unused files, photos, and cloud backups', points: 5 },
      { label: 'I delete items occasionally when I notice storage is getting full', points: 4 },
      { label: 'I rarely delete anything — storage accumulates over time', points: 3 },
      { label: 'I never delete — I keep everything indefinitely', points: 2 },
      { label: 'I have multiple cloud accounts and back up everything automatically without review', points: 1 },
    ],
  },
  {
    id: 'email_hygiene',
    text: 'How do you manage your email inbox and messaging attachments?',
    whyItMatters:
      'Each stored email with an attachment occupies server space and consumes energy indefinitely. The average person sends and receives dozens of emails per day; if retained indefinitely without review, cumulative storage grows significantly over years. Unsubscribing from unused mailing lists prevents ongoing unnecessary email generation and server storage load.',
    options: [
      { label: 'I regularly archive, delete, and unsubscribe from mailing lists', points: 5 },
      { label: 'I delete obvious spam and unnecessary emails periodically', points: 4 },
      { label: 'I let emails accumulate but delete occasionally', points: 3 },
      { label: 'I rarely delete emails — I keep most of them', points: 2 },
      { label: 'I never manage my inbox — large unread email accumulation', points: 1 },
    ],
  },
  {
    id: 'intentional_use',
    text: 'How would you describe your device use — is it intentional, or do you find yourself scrolling passively for long periods?',
    whyItMatters:
      'Passive, habitual screen time — particularly social media scrolling — generates continuous data requests, content loading, and network calls, each involving transmission and server processing energy. Intentional, purpose-driven device use reduces total data transmission compared to passive, algorithm-driven scrolling of high-bandwidth video content.',
    options: [
      { label: 'Intentional — I use devices for specific purposes and close apps when done', points: 5 },
      { label: 'Mostly intentional, with occasional passive scrolling', points: 4 },
      { label: 'Mix — intentional use but regular passive scrolling sessions', points: 3 },
      { label: 'Often passive — I regularly scroll without a specific purpose', points: 2 },
      { label: 'Mostly passive — device use is largely habitual and uncontrolled', points: 1 },
    ],
  },
  {
    id: 'device_repair',
    text: 'When your phone or laptop has a problem — cracked screen, slow performance, battery degradation — what do you typically do?',
    whyItMatters:
      'Manufacturing a smartphone generates approximately 70–80 kg CO₂eq, with the production phase accounting for around 80% of total device lifecycle emissions. Repair and maintenance extend device life and amortise this manufacturing carbon over more years of use. Replacing a battery rather than the whole device typically costs a fraction of a new phone and avoids its full manufacturing emissions.',
    options: [
      { label: 'Repair it — I always try repair before any other option', points: 5 },
      { label: 'Usually repair minor issues; replace only when unrepairable', points: 4 },
      { label: 'Try repair once; replace if it is not a quick fix', points: 3 },
      { label: 'Replace it — repair seems too complicated or expensive', points: 2 },
      { label: 'Replace immediately — I upgrade at every opportunity', points: 1 },
    ],
  },
]
