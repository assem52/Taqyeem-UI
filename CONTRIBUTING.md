# Contributing

## Workflow

1. Branch from `main` (`feature/…`, `fix/…`, `docs/…`).
2. Implement UI against the running API (`VITE_API_BASE_URL`).
3. Run `npm run lint` and `npm run build`.
4. Open a PR; request review; merge into `main`.

## Commit messages

Prefer: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.

## Environment

- Copy `.env.example` → `.env`.
- Prefer `/login` over `VITE_MOCK_STUDENT_ID` / `VITE_ADMIN_TOKEN`.
- Never commit real tokens or production API URLs with secrets.

## Screenshots

Product shots for the README live under `docs/screenshots/`. Keep filenames stable or update README links.
