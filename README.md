# Kay Maria – Developer Guide

This repository hosts **Kay Maria**, a Next.js + TypeScript plant care companion with real-time task and plant syncing across devices. The goal of this README is to give contributors (like me) a fast reference for building, testing and exploring the project.

All pages should follow the [style guide](./docs/style-guide.md) to ensure a consistent look and feel across the app. Headings use the Cabinet Grotesk typeface while body text uses Inter; both fonts load from Google Fonts and are applied via Tailwind classes. Buttons and form labels rely on semantic design tokens for their colors and state styles.

The Add Plant form uses a labeled stepper to guide users through Basics, Setup and Care plan sections. Form fields include validation for required entries, numeric values, and latitude/longitude ranges. Submitting the form now persists the plant to the backend and pre-creates care tasks. A Playwright smoke test ensures the Add Plant page renders.

The `/app/plants/new` page now applies the card layout and typography defined in the style guide for consistent, accessible presentation on mobile and desktop.




The Plant detail page shows a skeleton screen while loading, includes a back link to the Plants list for smoother navigation, and now displays its hero photo with a consistent aspect ratio for a more polished layout. It also uses semantic design tokens for background and text colors to stay aligned with the style guide, and all sections now use the shared Card component to keep spacing and styling consistent. The active tab is synced to the URL so deep links open to the correct section and the browser back button restores the previous tab. Timeline and Notes sections display lightweight placeholders while data loads, and basic smoke tests verify the page renders successfully.


The Today page lists all care tasks due today, grouped by plant with filters for room, task type, and status. Tasks can be completed or deferred using buttons or keyboard shortcuts.

The Timeline page shows recent care events with filters for plant and event type, supports infinite scroll, and displays skeleton placeholders while loading.

The Insights page visualizes completed and overdue tasks and new plants over a selectable date range with summary cards and a line chart.

The My Plants view listens to Supabase real-time updates so changes from other sessions appear automatically, shows skeleton cards while plant data loads, and displays a friendly empty state when you haven't added any plants yet. It now uses the shared page header so its layout hierarchy matches the visual system used across the app. The plant list renders in a single column on small screens and switches to a two-column grid on larger viewports for better responsiveness. A Playwright test now verifies this responsive behavior to catch layout regressions early.

Authenticated sessions also use a Supabase-backed `/api/sync` endpoint to persist and fetch user data across devices.

The Settings page lets you export or import plant data, toggle the app theme, and sign out of your session.

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
   Routes under `/app` now require authentication and redirect to `/login` when no session is present. Log in at `http://localhost:3000/login` with a Supabase email/password account. Use the Settings page to sign out.

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
- End-to-end tests: `npm run test:e2e` (starts the Next.js dev server and runs Playwright smoke tests, including the Add Plant, Plant Detail, and Timeline pages)

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
