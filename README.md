# Compost

**Find out what your daily habits actually cost the planet.**

Compost is a Progressive Web App that estimates your personal environmental footprint across seven behavioural domains — transport, food, energy, consumption, waste, water, and digital use — and helps you build the habits to improve it.

> Built as an academic project at **St. Anthony's College, Shillong**, supervised by Fr. Joby Joseph (Vice Principal) and Dr. Medari Janai Tham (Associate Professor).

---

## Features

- **Structured self-assessment** across seven sections, each weighted by its share of typical personal greenhouse gas emissions
- **Normalised score (0–100)** with six badge tiers calibrated to an urban Indian context
- **Insights tab** — five algorithmically selected questions surfaced from your weakest areas, plus one positive affirmation slot
- **SDG alignment** — see which UN Sustainable Development Goals your profile touches
- **Habit tracking** with streaks, freeze tokens, and mastery milestones; curated habit library mapped to assessment questions
- **Append-only ledger architecture** — all habit activity is stored as immutable events; local state is derived, never mutated directly
- **Offline-first with sync queue** — writes are enqueued locally and drained automatically on reconnect; four-state sync indicator (offline → hydrating → syncing → synced)
- **Realtime sync** via Supabase Realtime — habit slots, logs, and pause events propagate across devices without a refresh
- **Push notifications** — opt-in daily reminders routed through a Web Push service worker
- **Cross-device sync** via Supabase (Google OAuth, no password required)
- **Admin analytics dashboard** — cohort-level statistics (band distribution, section averages, habit adoption, gender breakdown) behind an is_admin guard
- **In-app documentation** — Guide, Methodology, and Credits tabs covering scoring rationale, data sources, and the research behind the habit milestones
- **Installable PWA** — add to home screen on any platform

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API) |
| UI library | Vuetify 4 (Material Design 3) |
| State | Pinia + pinia-plugin-persistedstate v4 |
| Auth & database | Supabase (Google OAuth, PostgreSQL, Realtime) |
| Utilities | VueUse, @vueuse/motion |
| Build | Vite 8 + vite-plugin-pwa (Workbox, injectManifest) |
| Language | TypeScript |
| Icons | Material Design Icons (@mdi/font) |
| Linting | oxlint + ESLint |
| Formatting | oxfmt |
| Deploy | GitHub Actions → GitHub Pages |

---

## Getting Started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- A Supabase project with Google OAuth configured

### Environment variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
```

`VITE_VAPID_PUBLIC_KEY` is only required if you want push notification support.

### Commands

```sh
npm install --legacy-peer-deps
npm run dev          # local dev server
npm run build        # clean + generate PWA assets + type-check + Vite build
npm run preview      # preview the production build locally
npm run lint         # oxlint + ESLint (both with --fix)
npm run format       # oxfmt over src/
npm run ship-it      # build then deploy to GitHub Pages
```

---

## Project Structure

```
src/
├── assets/              # Static assets (SVG illustrations)
├── components/
│   ├── app/             # App shell: AppBar variants, AppNavigation, AppSnackbar
│   ├── assessment/      # AssessmentCheckInTab, AssessmentInsightsTab
│   ├── climate/         # ClimateClock, ClimateHeadlines
│   ├── docs/            # In-app documentation (Guide, Methodology, Credits)
│   ├── habit/           # HabitCard, HabitLibrary, HabitListItem, AllLoggedCard
│   ├── icons/           # Custom icon components (IconSac)
│   ├── insights/        # InsightsPanel, InsightsScoreHero, InsightsBreakdownBars, …
│   ├── mastery/         # MasteryCheckInSheet, MasterySwapSheet, MasteryFreezeInfo, …
│   ├── notification/    # NotificationPromptBanner
│   ├── profile/         # ProfileForm
│   └── pwa/             # PwaInstallBanner
├── composables/         # Reusable Composition API logic (useClimateClock, useMastery*, …)
├── data/                # Static content: habits, badges, assessment questions, SDGs
│   ├── sections/        # Per-section question definitions
│   └── insights/        # Per-section, per-score-tier insight text (37 questions × 5 tiers)
├── layouts/             # App shell layout (AppLayout)
├── router/              # Vue Router configuration with auth guards
├── services/            # External service clients (supabase, feedbackForm)
├── stores/              # Pinia stores
│   ├── assessment.store.ts
│   ├── clock-data.store.ts
│   ├── clock-visible.store.ts
│   ├── mastery.store.ts
│   ├── profile.store.ts
│   ├── sync.store.ts
│   └── theme.store.ts
├── styles/              # Global SCSS and Vuetify theme tokens
├── types/               # TypeScript declarations (app.types.ts, database.types.ts)
├── utils/               # Pure utilities (clock, habit-date, scoring, theme)
└── views/               # Route-level view components (includes AdminView)
```

---

## License

MIT. See [`LICENSE`](./LICENSE) for the full text.
