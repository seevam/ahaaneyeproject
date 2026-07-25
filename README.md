# aahaneye — Impact an Eye Every Day 👁️

A mobile app that helps patients manage daily eye medication reminders. Built for people using multiple prescription eye drops, it tracks doses, schedules reminders with the correct 5-minute gap between drops, and keeps a caregiver and patient in sync.

---

## Project structure

```
aahaneye/
├── apps/
│   ├── api/          # Express + Drizzle ORM REST API (Node.js)
│   └── mobile/       # Expo (React Native) mobile app
├── packages/
│   └── shared/       # Shared TypeScript types (used by both apps)
├── docker-compose.yml
└── package.json      # Root npm workspace
```

This is an **npm workspace monorepo**. A single `npm install` at the root installs dependencies for all packages.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Mobile | Expo SDK 54 · React Native 0.81 · Expo Router · NativeWind v4 |
| API | Node.js · Express · TypeScript · Drizzle ORM |
| Database | PostgreSQL 16 |
| Cache / Jobs | Redis 7 |
| Auth | Custom JWT (phone number only — no OTP) |
| i18n | i18next — English, Hindi, Tamil |
| State | Zustand · TanStack Query |

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20 LTS or later | [nodejs.org](https://nodejs.org) |
| npm | 10+ (bundled with Node 20) | — |
| Docker Desktop | any recent | [docker.com](https://www.docker.com/products/docker-desktop) |
| Expo Go app | latest | [iOS](https://apps.apple.com/app/expo-go/id982107779) · [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) |

> **Xcode / Android Studio are NOT required** to run on a physical device with Expo Go.

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/seevam/ahaaneyeproject.git
cd ahaaneyeproject
npm install
```

### 2. Configure environment variables

**API**

```bash
cp apps/api/.env.example apps/api/.env
```

Open `apps/api/.env` and set at minimum:

```env
DATABASE_URL=postgresql://eyecare:eyecare@localhost:5433/eyecare
REDIS_URL=redis://localhost:6379
API_PORT=3000
NODE_ENV=development
JWT_SECRET=any-random-string-for-local-dev
```

> For production, generate a strong secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

**Mobile** (only needed if you change the API URL)

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

The default `http://localhost:3000` works for iOS Simulator and Android Emulator.  
For a **physical device**, replace it with your machine's local IP address:

```env
# Find your IP: ifconfig | grep "inet " (macOS) or ip addr show (Linux)
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

> The `apiUrl` in `apps/mobile/app.json` (`extra.apiUrl`) is the fallback used when the env var is absent.

### 3. Start the database and Redis

```bash
docker compose up -d
```

This starts:
- PostgreSQL on port **5433** (not 5432, to avoid conflicts with a local Postgres install)
- Redis on port **6379**

Verify they're running:

```bash
docker compose ps
```

### 4. Push the database schema

```bash
npm run db:push -w apps/api
```

This uses Drizzle Kit to apply the schema directly to the local database (no migration files needed for development).

To open Drizzle Studio (a visual database browser):

```bash
npm run db:studio -w apps/api
```

### 5. Start the API

```bash
npm run api
# or: npm run dev -w apps/api
```

The API starts on `http://localhost:3000`. Test it:

```bash
curl http://localhost:3000/health
# → {"status":"ok","timestamp":"..."}
```

### 6. Start the mobile app

```bash
npm run mobile
# or: npm run start -w apps/mobile
```

Expo Metro bundler starts and shows a QR code in your terminal. Open **Expo Go** on your phone and scan it.

> **First launch tip:** If you see a blank screen or a stale bundle, press `r` in the terminal to reload, or use `--clear` to wipe the Metro cache:
> ```bash
> npx expo start --clear -w apps/mobile
> ```

---

## Running both simultaneously

Open two terminal tabs:

```bash
# Tab 1
npm run api

# Tab 2
npm run mobile
```

---

## API routes reference

All routes are prefixed with `/api/v1`.

### Auth

| Method | Route | Body | Description |
|--------|-------|------|-------------|
| `POST` | `/auth/register` | `{ name, phone }` | Create account (idempotent on phone) |
| `POST` | `/auth/login` | `{ phone }` | Sign in — returns JWT |
| `GET` | `/auth/me` | — *(auth required)* | Current user profile |

Phone numbers are stored in E.164 format (e.g. `+919876543210`). The mobile app prepends `+91` automatically.

The JWT is valid for **90 days** and must be sent as `Authorization: Bearer <token>` on protected routes.

### Patients, Reminders, Reports

```
POST   /api/v1/patients
GET    /api/v1/patients
GET    /api/v1/patients/:id

POST   /api/v1/patients/:patientId/reminders
GET    /api/v1/patients/:patientId/reminders
GET    /api/v1/patients/:patientId/reminders/:id

GET    /api/v1/patients/:patientId/reports
GET    /api/v1/patients/:patientId/instances
```

---

## Useful commands

```bash
# Typecheck everything
npm run typecheck

# Run API tests
npm test -w apps/api

# Lint
npm run lint

# Format code
npm run format

# Generate Drizzle migration files (optional — db:push is faster for local dev)
npm run db:generate -w apps/api

# Stop Docker services
docker compose down

# Wipe database and start fresh
docker compose down -v && docker compose up -d && npm run db:push -w apps/api
```

---

## Project notes

- **No OTP verification** — users sign up with name + phone only; the backend issues a JWT immediately. This is intentional for the v1 private beta.
- **Expo Go compatible** — the Metro config stubs native modules (`ExpoCryptoAES`, `ExpoSecureStore`) that are unavailable in Expo Go. A production build via EAS will use real implementations.
- **Stories tab** — hidden in v1 (`href: null`). It exists in the codebase for v2.
- **Multilingual** — English, Hindi, and Tamil are fully supported via i18next. Device locale is auto-detected on first launch.
- **5-minute gap** — the reminder scheduler defaults to a 5-minute gap between consecutive eye drop reminders, matching standard ophthalmology guidance.

---

## Troubleshooting

**`Cannot find native module 'ExpoCryptoAES'`**  
You're running an old bundle. Press `r` to reload, or restart with `--clear`.

**API not reachable from physical device**  
Set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` to your machine's LAN IP (not `localhost`).

**Database connection refused**  
Make sure Docker is running: `docker compose up -d`. The DB is on port **5433**, not 5432.

**`JWT_SECRET` warning**  
The default `dev-secret-change-in-production` is fine for local development. Set a real secret before any production deployment.

---

## License

Private — all rights reserved.
