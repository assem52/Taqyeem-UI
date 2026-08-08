# QnA Service — Frontend

React + Vite + RTK Query client for the student and admin quiz dashboards.

---

## Initial setup

```bash
npm install
cp .env.example .env   # then edit values
npm run start          # or: npm run dev
```

App runs at **http://localhost:5173** (Vite default).

Backend must be running at `VITE_API_BASE_URL` (default `http://localhost:3000`).

---

## Demo accounts

These are created by the **backend** seed (`npx prisma db seed`). Use them on `/login`:

| Role | Email | Password | Lands on |
| :--- | :--- | :--- | :--- |
| Student | `assem.test@example.com` | `Student123!` | `/` (student dashboard) |
| Admin | `admin@example.com` | `Admin123!` | `/admin/quizzes` |

Register a new student at `/register` (then verify using the token printed in the **backend** console in DEV).

---

## Environment (`.env`)

**Do not commit real `.env` files** (gitignored). Commit only `.env.example`.

| Variable | Required | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | Backend base URL |
| `VITE_MOCK_STUDENT_ID` | Optional | DEV fallback header if not logged in |
| `VITE_ADMIN_TOKEN` | Optional | DEV fallback; must match backend `ADMIN_API_TOKEN` |

After login, the app stores `token` + `role` in `localStorage` and sends `Authorization: Bearer …`.

---

## How teammates should share env values

1. **Preferred:** each person copies `.env.example` → `.env` and generates their own secrets:
   ```bash
   openssl rand -hex 32   # use for JWT_SECRET / ADMIN_API_TOKEN
   ```
2. **If the team wants matching local tokens** (so admin header fallback works the same for everyone): share `ADMIN_API_TOKEN` / `VITE_ADMIN_TOKEN` and `JWT_SECRET` in a **private** channel (Discord DM, Slack DM, 1Password / Bitwarden), **not** in GitHub issues/PRs/chat history that is public.
3. **Never** commit `.env` or paste production keys into the README.

---

## Useful routes

| Path | Who |
| :--- | :--- |
| `/login` | Everyone |
| `/register` | New students |
| `/` | Student dashboard |
| `/admin/quizzes` | Admin |
| `/invite/:token` | Invitation deep link (accepts enrollment when logged in) |
