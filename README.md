# Kay Maria – Developer Guide

This repository hosts **Kay Maria**, a Next.js + TypeScript plant care companion with real-time task syncing across devices. The goal of this README is to give contributors (like me) a fast reference for building, testing and exploring the project.

The Add Plant form uses a labeled stepper to guide users through Basics, Setup and Care plan sections. Form fields include validation for required entries and numeric values. Submitting the form now persists the plant to the backend and pre-creates care tasks.

The Plant detail page shows a skeleton screen while loading, includes a back link to the Plants list for smoother navigation, and now displays its hero photo with a consistent aspect ratio for a more polished layout.

## Quick Start
Kay Maria is intended to run in single-user mode by default.

1. Install dependencies
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and supply the mandatory values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_BASE_URL`
   - `DATABASE_URL`
   - `SINGLE_USER_MODE=true`
   - `SINGLE_USER_ID=<supabase user uuid>`
   - `NEXT_PUBLIC_TASK_WINDOW_DAYS` *(defaults to `7`)*
   - `OPENAI_API_KEY` *(optional)*
   - `TREFLE_API_TOKEN` *(optional, enables [Trefle](https://trefle.io) species search. Without a valid token, searches fall back to a small built-in list.)*
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

## Post-merge workflow
After pulling new changes:

1. **Dependencies** – Run `npm install` only when `package.json` or `package-lock.json` has changed.
2. **Prisma schema** – Run `npm run db:sync` if `prisma/schema.prisma` or files in `prisma/migrations/` have been updated.
3. **Development server** – Restart `npm run dev` after applying the above updates.

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
- End-to-end tests: `npm run test:e2e`

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
Kay Maria runs in single-user mode by default. Set the following variables in `.env`:
```
SINGLE_USER_MODE=true
SINGLE_USER_ID=<supabase user uuid>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
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
