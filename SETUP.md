# Complete Setup Guide — aahaneye

This guide walks you through running the project on a brand-new machine from absolute zero.  
No prior experience with React Native, Docker, or Node.js is assumed.

---

## What you will have running by the end

| Service | What it does | Where it runs |
|---------|-------------|---------------|
| PostgreSQL | Stores all app data | `localhost:5433` (Docker) |
| Redis | Background job queue / cache | `localhost:6379` (Docker) |
| API server | REST backend that the app talks to | `http://localhost:3000` |
| Mobile app | The Expo React Native app | On your phone via Expo Go |

---

## Table of contents

1. [Install prerequisites](#1-install-prerequisites)
2. [Clone the repository](#2-clone-the-repository)
3. [Install project dependencies](#3-install-project-dependencies)
4. [Set up environment variables](#4-set-up-environment-variables)
5. [Start the database and Redis](#5-start-the-database-and-redis)
6. [Push the database schema](#6-push-the-database-schema)
7. [Start the API server](#7-start-the-api-server)
8. [Start the mobile app](#8-start-the-mobile-app)
9. [Create your first account](#9-create-your-first-account)
10. [Day-to-day workflow](#10-day-to-day-workflow)
11. [Troubleshooting](#11-troubleshooting)
12. [Project structure explained](#12-project-structure-explained)

---

## 1. Install prerequisites

You need four things installed on your computer before anything else.

---

### 1a. Node.js (version 20 or later)

Node.js runs the API server and the Metro bundler for the mobile app.

**macOS**

The cleanest way is `nvm` (Node Version Manager), which lets you switch Node versions easily:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# Restart your terminal, then:
nvm install 20
nvm use 20
nvm alias default 20
```

Or install directly from https://nodejs.org — download the **LTS** version.

**Windows**

Download the installer from https://nodejs.org (LTS version). Run it with all defaults.

**Verify it worked:**

```bash
node --version   # should print v20.x.x or higher
npm --version    # should print 10.x.x or higher
```

---

### 1b. Git

Git is needed to clone the repository.

**macOS** — Git is usually already installed. Check with `git --version`.  
If not: `xcode-select --install` installs it.

**Windows** — Download from https://git-scm.com/download/win. Use all defaults during installation.

**Verify:**

```bash
git --version   # should print git version 2.x.x
```

---

### 1c. Docker Desktop

Docker runs PostgreSQL and Redis in containers so you don't need to install them separately.

1. Go to https://www.docker.com/products/docker-desktop
2. Download for your OS (macOS or Windows)
3. Install and **open Docker Desktop** — it needs to be running whenever you work on this project
4. Wait for the whale icon in your menu bar / taskbar to stop animating (means Docker is ready)

**Verify:**

```bash
docker --version        # should print Docker version 24.x.x or higher
docker compose version  # should print Docker Compose version 2.x.x
```

> **Note:** On older versions it may be `docker-compose` (with a hyphen) instead of `docker compose`.

---

### 1d. Expo Go (on your phone)

Expo Go is the app that lets you run the mobile app on your real phone without building a native binary.

- **iPhone:** https://apps.apple.com/app/expo-go/id982107779
- **Android:** https://play.google.com/store/apps/details?id=host.exp.exponent

Make sure your phone and your computer are on the **same Wi-Fi network**.

---

## 2. Clone the repository

```bash
git clone https://github.com/seevam/ahaaneyeproject.git
cd ahaaneyeproject
```

You should now have a folder called `ahaaneyeproject` with this structure inside:

```
ahaaneyeproject/
├── apps/
│   ├── api/        ← Express REST API (Node.js)
│   └── mobile/     ← Expo React Native app
├── packages/
│   └── shared/     ← TypeScript types shared between API and mobile
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 3. Install project dependencies

This project is a **monorepo** — one `npm install` at the root installs packages for every sub-project.

```bash
npm install
```

This will take 1–3 minutes on the first run. You will see a lot of output — that is normal.

When it finishes you should see no red error lines. Warnings (yellow) are fine.

---

## 4. Set up environment variables

Environment variables are configuration values (ports, passwords, secrets) that should not be hard-coded in the source files. Each app has an `.env` file that you create from the provided template.

### API environment file

```bash
cp apps/api/.env.example apps/api/.env
```

Open `apps/api/.env` in any text editor. It will look like this:

```env
DATABASE_URL=postgresql://eyecare:eyecare@localhost:5433/eyecare
REDIS_URL=redis://localhost:6379
API_PORT=3000
NODE_ENV=development
JWT_SECRET=dev-secret-change-in-production
```

**For local development you do not need to change anything.** All defaults work out of the box.

> What each variable does:
> - `DATABASE_URL` — tells the API where to find PostgreSQL. The credentials `eyecare:eyecare` and database name `eyecare` match what docker-compose.yml creates automatically.
> - `REDIS_URL` — tells the API where to find Redis.
> - `API_PORT` — the port the API listens on. `3000` is the default.
> - `NODE_ENV` — `development` enables verbose logging and relaxed security checks.
> - `JWT_SECRET` — the secret used to sign auth tokens. Any string works for local dev.

### Mobile environment file

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Open `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**If you are running the app on a physical phone** (not a simulator), `localhost` will not resolve — your phone is a different device from your computer. Replace it with your computer's local IP address:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

Find your computer's local IP:
- **macOS:** `ipconfig getifaddr en0` (Wi-Fi) or open System Settings → Wi-Fi → Details
- **Windows:** `ipconfig` in Command Prompt, look for `IPv4 Address` under your Wi-Fi adapter
- **Linux:** `ip addr show` or `hostname -I`

> If you use iOS Simulator or Android Emulator (requires Xcode or Android Studio), `localhost` works fine.

---

## 5. Start the database and Redis

Make sure Docker Desktop is open and running (whale icon in your menu bar / taskbar).

```bash
docker compose up -d
```

The `-d` flag runs the containers in the background.

**What this starts:**

| Container | Service | Port on your machine |
|-----------|---------|---------------------|
| `eyecare-postgres` | PostgreSQL 16 | 5433 |
| `eyecare-redis` | Redis 7 | 6379 |

> Port **5433** (not the standard 5432) is used to avoid conflicts if you have a local PostgreSQL already installed.

**Verify the containers are running:**

```bash
docker compose ps
```

You should see both containers with status `running` or `Up`:

```
NAME                STATUS
eyecare-postgres    Up
eyecare-redis       Up
```

**If a container failed to start**, check the logs:

```bash
docker compose logs postgres
docker compose logs redis
```

### No Docker? Homebrew alternative (macOS)

If you can't or don't want to install Docker, install PostgreSQL and Redis directly:

```bash
brew install postgresql@16 redis
brew services start postgresql@16
brew services start redis

# Create the app user and database (Homebrew postgres runs on port 5432)
psql -h localhost -p 5432 -d postgres -c "CREATE ROLE eyecare LOGIN PASSWORD 'eyecare' CREATEDB;"
createdb -h localhost -p 5432 -O eyecare eyecare
```

Then edit `apps/api/.env` and change the port from **5433** to **5432**:

```env
DATABASE_URL=postgresql://eyecare:eyecare@localhost:5432/eyecare
```

Continue from step 6 as normal.

---

## 6. Push the database schema

The database is now running but it's empty — no tables yet. This command reads the schema definition from the code and creates all tables:

```bash
npm run db:push -w apps/api
```

You should see output like:

```
[✓] Changes applied
```

This uses **Drizzle ORM** (the database library used in this project). It will create all tables defined in `apps/api/src/db/schema.ts`.

> You only need to run this once when setting up. Run it again any time the schema changes (you will see a migration prompt asking you to confirm the changes).

**Optional — open a visual database browser:**

```bash
npm run db:studio -w apps/api
```

This opens **Drizzle Studio** at `https://local.drizzle.studio` where you can browse all tables and rows.

---

## 7. Start the API server

```bash
npm run api
```

This is a shortcut for `npm run dev -w apps/api`, which starts the server using `tsx watch` (TypeScript execution with auto-restart on file changes).

You should see output like:

```
[info] Server running on port 3000
```

**Test that the API is working:**

Open a new terminal tab and run:

```bash
curl http://localhost:3000/health
```

You should get back:

```json
{"status":"ok","timestamp":"2024-01-15T10:00:00.000Z"}
```

If you see `Connection refused`, the API hasn't started yet or there's an error — check the terminal where you ran `npm run api`.

---

## 8. Start the mobile app

Open a **new terminal tab** (keep the API running in the other tab).

```bash
npm run mobile
```

This starts the **Expo Metro bundler**. After a few seconds you will see a QR code in the terminal and output like:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

**On your phone:**
- **iPhone:** Open the native Camera app, point it at the QR code, tap the banner that appears
- **Android:** Open the **Expo Go** app, tap "Scan QR code", scan the code

The app will bundle (first time takes 30–60 seconds) and open on your phone.

> **Tip:** If you press `r` in the terminal, it reloads the app. Press `?` to see all available commands.

---

## 9. Create your first account

Once the app opens on your phone:

1. Tap **Get Started** on the welcome screen
2. Tap **Sign Up** on the login screen
3. Enter your **full name** and **10-digit phone number** (the app adds `+91` prefix automatically)
4. Tap **Create Account**

You are signed in immediately — no OTP, no email verification. A JWT token is created and stored in the app.

**To test the API directly:**

```bash
# Register a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"+919876543210"}'

# Response:
# {"data":{"token":"eyJ...","user":{"id":"...","name":"Test User","phone":"+919876543210","role":"user"}}}

# Login with the same phone
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210"}'
```

---

## 10. Day-to-day workflow

Every time you come back to work on the project:

### Step 1 — Start Docker (if not already running)

Open Docker Desktop. Or from terminal:

```bash
docker compose up -d
```

### Step 2 — Start the API

```bash
npm run api
```

### Step 3 — Start the mobile app

In a new terminal tab:

```bash
npm run mobile
```

That's it. Scan the QR code if Expo Go doesn't auto-connect.

### Stopping everything

```bash
# Stop Docker containers (data is preserved)
docker compose down

# To also delete all database data and start fresh
docker compose down -v
```

---

## 11. Troubleshooting

### "Cannot find native module 'ExpoCryptoAES'"

**Cause:** You have a stale cached bundle from a previous build.

**Fix:**

```bash
# In the mobile terminal, press Ctrl+C to stop, then:
npx expo start --clear -w apps/mobile
```

---

### App shows a blank white screen

**Cause:** JavaScript bundle failed to load.

**Fix:** Shake your phone → tap **Reload**. Or press `r` in the terminal running the mobile app.

---

### "Network request failed" when signing up or logging in

**Cause:** The phone can't reach the API server.

**Fix:**

1. Make sure the API is running (`curl http://localhost:3000/health` from your computer works)
2. If on a physical phone, change `apps/mobile/.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000
   ```
3. Restart the mobile app after changing `.env`:
   ```bash
   npx expo start --clear -w apps/mobile
   ```
4. Make sure your phone and computer are on the **same Wi-Fi network**

---

### Docker: "port is already in use"

**Cause:** Something else is already using port 5433 or 6379.

**Fix:** Find and stop the conflicting process:

```bash
# macOS/Linux
lsof -i :5433
lsof -i :6379

# Then kill the PID shown
kill -9 <PID>
```

Or change the port in `docker-compose.yml` (left side of the `ports` mapping):

```yaml
ports:
  - "5434:5432"   # change 5433 to any free port
```

If you change the postgres port, also update `DATABASE_URL` in `apps/api/.env`.

---

### "Cannot connect to the Docker daemon"

**Cause:** Docker Desktop is not running.

**Fix:** Open Docker Desktop and wait for it to fully start (whale icon stops animating).

---

### `npm install` fails with permission errors

**macOS/Linux fix:**

```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

---

### `db:push` fails with "connection refused"

**Cause:** PostgreSQL container isn't running yet, or it's still starting up.

**Fix:**

```bash
docker compose up -d
# Wait 5 seconds for postgres to initialize, then:
npm run db:push -w apps/api
```

---

### App is stuck on a loading screen after sign in

**Cause:** The JWT token was stored but the app hasn't navigated yet.

**Fix:** Shake your phone and tap **Reload**. If that doesn't help, clear the Expo Go app cache:
- iPhone: Long-press Expo Go icon → Remove App → reinstall
- Android: Settings → Apps → Expo Go → Clear Cache

---

### Changes to the code aren't appearing in the app

Metro bundler watches files for changes and hot-reloads. If hot reload isn't working:

```bash
# Press r in the Metro terminal to force a full reload
# Or stop Metro and restart with:
npx expo start --clear -w apps/mobile
```

---

## 12. Project structure explained

```
ahaaneyeproject/
│
├── apps/
│   │
│   ├── api/                        ← Express REST API
│   │   └── src/
│   │       ├── config/
│   │       │   ├── env.ts          ← reads .env variables
│   │       │   ├── database.ts     ← Drizzle DB connection
│   │       │   └── logger.ts       ← Pino logger setup
│   │       ├── db/
│   │       │   └── schema.ts       ← ALL database table definitions
│   │       ├── middleware/
│   │       │   ├── auth.ts         ← JWT verification middleware
│   │       │   └── error-handler.ts
│   │       ├── routes/
│   │       │   ├── auth.ts         ← POST /auth/register, POST /auth/login, GET /auth/me
│   │       │   ├── patients.ts     ← patient profile CRUD
│   │       │   ├── reminders.ts    ← reminder schedule + instance management
│   │       │   ├── reports.ts      ← adherence reports
│   │       │   └── stories.ts      ← eye care content (v2)
│   │       └── index.ts            ← Express app entry point
│   │
│   └── mobile/                     ← Expo React Native app
│       ├── app/                    ← file-based routing (Expo Router)
│       │   ├── _layout.tsx         ← root layout (QueryClient provider)
│       │   ├── (auth)/             ← screens shown when NOT logged in
│       │   │   ├── index.tsx       ← welcome / landing screen
│       │   │   ├── login.tsx       ← phone number sign in
│       │   │   └── signup.tsx      ← name + phone sign up
│       │   └── (app)/              ← screens shown when logged in
│       │       ├── index.tsx       ← Today tab (daily reminders)
│       │       ├── reminders/      ← Reminders tab (manage schedules)
│       │       ├── profile/        ← Profile tab
│       │       └── reports/        ← Adherence report (accessed from Profile)
│       ├── src/
│       │   ├── stores/
│       │   │   ├── auth-store.ts   ← holds JWT token + user (Zustand)
│       │   │   └── patient-store.ts← active patient selection
│       │   ├── services/
│       │   │   └── api-client.ts   ← fetch wrapper that attaches JWT to requests
│       │   ├── components/
│       │   │   └── LanguageSelector.tsx ← EN / हि / த pills
│       │   ├── i18n/               ← translations
│       │   │   ├── index.ts        ← i18next setup + device language detection
│       │   │   └── translations/
│       │   │       ├── en.ts       ← English
│       │   │       ├── hi.ts       ← Hindi
│       │   │       └── ta.ts       ← Tamil
│       │   └── stubs/              ← Expo Go compatibility shims
│       │       ├── ExpoCryptoAES.js     ← no-op AES stub (native module not in Expo Go)
│       │       └── expo-secure-store.js ← in-memory stub (no Keychain in Expo Go)
│       ├── metro.config.js         ← Metro bundler config (monorepo + Expo Go stubs)
│       ├── app.json                ← Expo app config
│       └── global.css              ← NativeWind / Tailwind base styles
│
├── packages/
│   └── shared/
│       └── src/
│           └── index.ts            ← TypeScript types used by both API and mobile
│                                      (ApiResponse, ReminderInstance, etc.)
│
├── docker-compose.yml              ← defines postgres + redis containers
└── package.json                    ← root workspace config + shared scripts
```

### How authentication works

There is no OTP or email verification. The flow is:

```
User enters name + phone
        ↓
Mobile calls POST /api/v1/auth/register
        ↓
API creates a user row in postgres (or finds existing one by phone)
        ↓
API signs a JWT with the user's ID, valid for 90 days
        ↓
Mobile stores the JWT in Zustand (auth-store.ts)
        ↓
Every subsequent API request sends: Authorization: Bearer <token>
        ↓
API middleware verifies the token and attaches the user to the request
```

### How the screens know if you are logged in

Expo Router uses file-based layouts. The `(auth)` group shows login/signup screens. The `(app)` group shows the main app tabs. The layout file at `app/(auth)/_layout.tsx` redirects to `/(app)` if a JWT token exists in the store, and `app/(app)/_layout.tsx` redirects to `/(auth)` if no token exists.

### Why Expo Go works (the stubs)

Expo Go is a pre-built app that can't include every native module. This project uses `expo-secure-store` which needs native code not available in Expo Go. `metro.config.js` intercepts those imports at bundle time and replaces them with JavaScript-only stubs that work in Expo Go. When you build with EAS Build (`EAS_BUILD=true`), the stubs are bypassed and the real native modules are used.

---

## Available commands (cheat sheet)

```bash
# ── Install ──────────────────────────────────────────────────────
npm install                          # install all dependencies (root)

# ── Docker ───────────────────────────────────────────────────────
docker compose up -d                 # start postgres + redis
docker compose down                  # stop containers (keep data)
docker compose down -v               # stop containers + delete data
docker compose logs postgres         # view postgres logs
docker compose ps                    # check container status

# ── Database ─────────────────────────────────────────────────────
npm run db:push -w apps/api          # apply schema to database
npm run db:studio -w apps/api        # open visual DB browser

# ── API ──────────────────────────────────────────────────────────
npm run api                          # start API with hot-reload
# API runs at http://localhost:3000

# ── Mobile ───────────────────────────────────────────────────────
npm run mobile                       # start Expo Metro bundler
npx expo start --clear -w apps/mobile  # start with cleared cache

# ── Code quality ─────────────────────────────────────────────────
npm run typecheck                    # TypeScript type check (all apps)
npm run lint                         # ESLint
npm run format                       # Prettier format

# ── API tests ────────────────────────────────────────────────────
npm test -w apps/api
```
