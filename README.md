# Kay Maria – Developer Guide

This repository hosts **Kay Maria**, a Next.js + TypeScript plant care companion. The goal of this README is to give contributors (like me) a fast reference for building, testing and exploring the project.

## Quick Start
1. Install dependencies
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and supply the required values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BASE_URL`
   - `DATABASE_URL`
   - `OPENAI_API_KEY` *(optional)*
   - `TREFLE_API_TOKEN` *(optional, enables [Trefle](https://trefle.io) species search)*
   - `NEXT_PUBLIC_TASK_WINDOW_DAYS` *(defaults to `7`)*
   - `SINGLE_USER_MODE` and `SINGLE_USER_ID` for skipping Supabase auth
3. Sync Prisma schema and client
   ```bash
   npx prisma db pull
   npx prisma generate
   ```
   These commands keep the Prisma schema and generated client up to date.
4. Prepare the database and start the app
   ```bash
   npm run db:migrate
   npm run dev
   # open http://localhost:3000/app
   ```
   The `npm run db:seed` script only clears the `task` and `plant` tables and doesn’t insert mock data. Migrations already create empty tables, so run this script only if you need to wipe existing data.

## Common Scripts
| command | description |
|---|---|
| `npm run dev` | start development server |
| `npm run build` | create production build |
| `npm run db:migrate` | run Prisma migrations |
| `npm run db:seed` | clear `task` and `plant` tables |
| `npx prisma db pull` | sync schema from DB |
| `npx prisma generate` | generate Prisma client |

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
`TREFLE_API_TOKEN` is provided in your environment. Without a token, species
lookups fall back to a small built-in list.

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
