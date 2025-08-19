# Kay Maria – Developer Guide

This repository hosts **Kay Maria**, a Next.js + TypeScript plant care companion with real-time task syncing across devices. The goal of this README is to give contributors (like me) a fast reference for building, testing and exploring the project.

## Quick Start
1. Install dependencies
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and supply the required values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_BASE_URL`
   - `DATABASE_URL`
   - `OPENAI_API_KEY` *(optional)*
   - `TREFLE_API_TOKEN` *(optional, enables [Trefle](https://trefle.io) species search. Without a valid token, searches fall back to a small built-in list.)*
   - `NEXT_PUBLIC_TASK_WINDOW_DAYS` *(defaults to `7`)*
   - `SINGLE_USER_MODE` and `SINGLE_USER_ID` for skipping Supabase auth
3. Sync Prisma schema and client
   ```bash
   npm run db:sync
   ```
   This pulls the latest schema from Supabase and regenerates the Prisma client.
4. Start the app
   ```bash
   npm run dev
   # open http://localhost:3000/app
   ```
   The `npm run db:seed` script only clears the `task` and `plant` tables and doesn’t insert mock data. Run it only if you need to wipe existing data.
   Log in at `http://localhost:3000/login` with a Supabase email/password account. Use the Settings page to sign out.

## Common Scripts
| command | description |
|---|---|
| `npm run dev` | start development server |
| `npm run build` | create production build |
| `npm run db:sync` | sync schema from DB and generate Prisma client |
| `npm run db:seed` | clear `task` and `plant` tables |
| `npm run db:studio` | open Prisma Studio |

## Testing
- Unit tests: `npm test`
- Manual scenarios live in [docs/manual-test-cases.md](./docs/manual-test-cases.md)

## Project Structure
```
app/          Next.js routes and API handlers
components/   UI building blocks
lib/          utilities and Supabase helpers
prisma/       Prisma schema and seeds
public/       static assets
supabase/     database schema
```

## Species Search

The app can query the [Trefle API](https://trefle.io) for plant names when a
`TREFLE_API_TOKEN` is provided in your environment. Without a token—or if the
Trefle request fails after several retries—lookups fall back to a small
built-in list. In those cases results may be limited compared to the full Trefle database.

## Single-User Mode
Useful when running locally without authentication.
```
SINGLE_USER_MODE=true
SINGLE_USER_ID=<supabase user uuid>
```
Restart the dev server after changing these values.

## Deployment
Vercel is the intended host.
```
vercel
vercel --prod
```
Ensure the environment variables above are configured in the Vercel project settings.

## Further Reading
- [ROADMAP.md](./ROADMAP.md) – upcoming work
- [docs/](./docs) – style guide, manual test cases and other documentation

Kay Maria is evolving; keep the README updated as the project grows.
