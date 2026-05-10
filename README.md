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
- **Habit tracking** with streaks, freeze tokens, mastery, and a curated habit library mapped to assessment questions
- **Offline-first** — the app works without a connection; queued changes sync automatically when you reconnect
- **Cross-device sync** via Supabase (Google OAuth, no password required)
- **Installable PWA** — add to your home screen on any platform

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API) |
| UI library | Vuetify 4 (Material Design 3) |
| State | Pinia + pinia-plugin-persistedstate |
| Auth & database | Supabase (Google OAuth, PostgreSQL) |
| Utilities | VueUse, @vueuse/motion |
| Build | Vite 8 + vite-plugin-pwa (Workbox) |
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

### Install

```sh
npm install
```

### Develop

```sh
npm run dev
```

### Build

The build pipeline runs type-checking, PWA asset generation, and Vite in sequence:

```sh
npm run build
```

### Preview the production build

```sh
npm run preview
```

### Lint and format

```sh
npm run lint     # oxlint + ESLint (both with --fix)
npm run format   # oxfmt over src/
```

### Deploy to GitHub Pages

```sh
npm run ship-it  # build then gh-pages deploy
```

The GitHub Actions workflow in `.github/workflows/deploy.yml` runs this automatically on every push to `master`.

---

## Project Structure

```
src/
├── assets/          # Static assets (SVG illustrations)
├── components/
│   ├── docs/        # In-app documentation components (Guide, Methodology, Credits)
│   └── icons/       # Custom icon components
├── composables/     # Reusable Composition API logic
│   ├── useClimateClock.ts
│   ├── useMasteryActions.ts
│   ├── useMasteryCheckin.ts
│   ├── useMasteryRecommendations.ts
│   ├── useNotificationPrompt.ts
│   ├── usePwaInstall.ts
│   └── useTheme.ts
├── data/            # Static content — habits, badges, assessment questions, SDGs
│   ├── sections/    # Per-section question definitions
│   └── insights/    # Per-section insight text
├── layouts/         # App shell layout
├── lib/             # Utility modules (scoring, streak reconciler, Supabase client)
├── router/          # Vue Router configuration with auth guards
├── stores/          # Pinia stores (assessment, mastery, profile, sync, theme)
├── styles/          # Global SCSS and Vuetify theme tokens
├── types/           # TypeScript interfaces and shared constants
└── views/           # Route-level view components
```

---

## Documentation

Full in-app documentation is available at the `/docs` route, covering:

- **Guide** — getting started, assessment, habits and mastery, score and badges, insights, sync, privacy
- **Methodology** — scoring model, section weighting rationale, badge taxonomy, insights algorithm, limitations, references
- **Credits** — team, stack, license

See [`METHODOLOGY.md`](./METHODOLOGY.md) for the full methodology as a standalone document.

---

## IDE Setup

[VS Code](https://code.visualstudio.com/) with the [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension. Disable Vetur if installed.

**Recommended browser extensions for development:**

- Chrome/Edge/Brave: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) · [Enable Custom Object Formatters](http://bit.ly/object-formatters)
- Firefox: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/) · [Enable Custom Object Formatters](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

---

## License

MIT — see [`LICENSE`](./LICENSE) for the full text.
