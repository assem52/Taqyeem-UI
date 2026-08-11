# Project overview — Taqyem Web

Web client for the Taqyem assessment platform. Full product narrative, AI behavior, and API architecture live in the **backend** repository:

- `docs/PROJECT_OVERVIEW.md`
- `docs/ARCHITECTURE.md`
- `docs/AI_QUESTION_GENERATION.md`

## This repository

- React 19 + Vite SPA for **admin** and **learner** roles
- RTK Query against the NestJS API
- Screenshots: [`docs/screenshots/`](./screenshots/)
- Setup: root [`README.md`](../README.md)

## Fresh clone (web)

```bash
npm install
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:3000
npm run dev
```

Requires a running API with seed data (see backend README demo accounts).
