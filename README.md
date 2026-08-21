# PackTrack — Package Monitoring Dashboard

A **Vue 3** single-page application paired with a **NestJS** backend for real-time package and warehouse monitoring.

This repository contains both halves of the project:

- **Frontend** — Vue 3 SPA at the repo root (`src/`)
- **Backend** — NestJS REST API in [`backend/`](./backend/)

## Live demo

Deployed on **Render** (single-container: nginx + NestJS + Vue):

- **URL:** https://packtrack-qxr5.onrender.com

> **Authentication is disabled on the live demo** so visitors can explore every
> section (including admin views) without logging in. To re-enable it, set
> `AUTH_DISABLED=false` in the backend and `VITE_AUTH_DISABLED=false` in the
> frontend build, then redeploy.

## Tech stack (frontend)

- **Vue 3** + Composition API (`<script setup>`)
- **Vite** — build tool and dev server
- **TypeScript**
- **Pinia** — state management (auth-only after Entrega 2)
- **Vue Router** — client-side routing
- **Chart.js** — data visualizations (bar and pie charts)
- **Leaflet** — interactive maps
- **Tailwind CSS** — utility-first styling
- **axios** — HTTP client to the NestJS backend

> The backend stack and architecture are documented separately in [`backend/README.md`](./backend/README.md).

## Prerequisites

- Node.js ≥ 20
- npm ≥ 9
- The backend running locally on port 3000 — required for login, data fetches, and every CRUD action. See [`backend/README.md`](./backend/README.md) for setup.

## Getting started

You need both halves running for the app to work.

```bash
# Terminal 1 — backend
cd backend
npm install
npm run start:dev          # http://localhost:3000

# Terminal 2 — frontend (project root)
npm install
npm run dev                # http://localhost:5173
```

Open `http://localhost:5173` in a browser. Register a user via the signup form. To get an Admin account, register a normal user first, then promote them with SQL:

```bash
sqlite3 backend/database.sqlite \
  "UPDATE user SET role='Admin' WHERE email='you@example.com';"
```

Log out and log in again so the new JWT carries `role: 'Admin'` and unlocks the Users page and warehouse mutations.

## Environment variables

| Variable | Default | What it does |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3000/api/` | Base URL the axios client uses for every backend request (must end with `/`) |

To override, copy the template and edit:

```bash
cp .env.example .env
# edit the value, then restart the dev server
npm run dev
```

`.env` is gitignored; `.env.example` is committed.

## Routes

| Route | Description | Access |
|---|---|---|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/signup` | Sign up | Public |
| `/dashboard` | Overview with charts | Auth |
| `/packages` | Package list with filters and chart | Auth |
| `/packages/create` | Create a new package | Auth |
| `/packages/:id` | Package detail and tracking timeline | Auth |
| `/warehouses` | Warehouse list with capacity chart and admin CRUD | Auth (Admin for mutations) |
| `/users` | User management | Admin only |

## Docker

To run the whole stack (backend + frontend + persistent SQLite volume) in containers:

```bash
docker compose up -d
```

This builds and starts both services:

- **Backend** — http://localhost:3000/api
- **Frontend** — http://localhost:5173

The SQLite file lives in a Docker volume named `backend-data`, so your users and packages survive container restarts.

```bash
# Stop everything (keeps the database)
docker compose down

# Stop and wipe the database too
docker compose down -v

# Tail logs
docker compose logs -f
```

> Since we use SQLite (a single file), there is no separate database container — the file is just persisted in a Docker volume mounted into the backend.

## Other commands

```bash
# Type-check + production build
npm run build

# Preview the production build locally
npm run preview

# Lint (oxlint + eslint)
npm run lint

# Prettier formatter
npm run format
```

## See also

- **[Backend README](./backend/README.md)** — NestJS API setup, env vars, database configuration, scripts.
- **[Backend architecture](./backend/docs/architecture.md)** — class diagram, ER diagram, module graph.
- **[Backend authentication](./backend/docs/authentication.md)** — JWT flow, role enforcement, permissions matrix.
- **[Backend API reference](./backend/docs/api-reference.md)** — endpoint catalog with curl examples.
