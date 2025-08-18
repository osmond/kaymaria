# 🌱 Kay Maria

**Tend to what matters.**
_A calm, intelligent plant care companion designed for clarity, beauty, and emotional connection._

---

## Overview

Kay Maria is a thoughtful plant tracking app that helps you care for your plants with ease. Inspired by the simplicity of journaling and the intelligence of modern tools, it combines task management, smart care suggestions, and gentle design.

Whether you're nurturing one plant or a hundred, Kay Maria adapts to your space, habits, and environment — with no pressure and no ads.

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/osmond/kaymaria.git
   cd kaymaria
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your values.
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` come from your Supabase project.
   - `NEXT_PUBLIC_BASE_URL` should point to the URL where the app runs.
   - `DATABASE_URL` is used by Prisma; the example file defaults to a local SQLite database.
   - `NEXT_PUBLIC_TASK_WINDOW_DAYS` controls how many days ahead the Upcoming view looks (default `7`).
   - `OPENAI_API_KEY` enables AI-powered care recommendations.
   - `SINGLE_USER_MODE` set to `true` to bypass Supabase auth.
   - `SINGLE_USER_ID` the user ID used when `SINGLE_USER_MODE` is enabled.
3. Run migrations, seed the database, and start the development server:
   ```bash
   npm run db:migrate
   npm run db:seed
   npm run dev
   # open http://localhost:3000/app
   ```

### Single-User Mode

To run the app without signing in, configure a fixed Supabase user ID:

1. **Create a Supabase user**
   - Dashboard → **Authentication → Users → Add User**.
   - Copy the generated UUID from the **ID** column.
2. **Fill out the `.env` file**
   - `SINGLE_USER_MODE=true`
   - `SINGLE_USER_ID=<copied UUID>`
   - ensure the other Supabase variables are populated.
3. **Restart the dev server**
   ```bash
   npm run dev
   ```
4. Visit [http://localhost:3000/app](http://localhost:3000/app); API routes will use the fixed user ID and skip authentication.

To create a production build run:
```bash
npm run build
```

## 🚀 Usage

Once the development server is running:

1. Visit [`/app`](http://localhost:3000/app) to see the task dashboard for today.
2. Use the **+** button to add a new plant with care defaults.
3. Tap a plant card to view its quick stats, timeline, notes, or photo gallery.
4. Swipe a task to complete it, edit the details, or delete it.
5. Use the room and task-type filters to focus on what's relevant.
6. Allow browser notifications to get alerts for overdue tasks.

## 🧪 Testing

Manual test cases for desktop and mobile are documented in [docs/manual-test-cases.md](./docs/manual-test-cases.md).

Run unit tests with `npm test`.

## ✨ Features

- 🌼 **Today View** – See exactly which plants need attention today, including overdue tasks
- 🌅 **Upcoming View** – Preview tasks due in the next 7 days (configurable)
- 🗂️ **Grouped Tasks** – Today's tasks organized by plant for quick scanning
- ⏱️ **Urgency Sorting** – Tasks within each plant group are ordered by due date
- 💧 **Task Icons** – Visual cues for watering, fertilizing, and repotting tasks
- 🏠 **Room Filters** – Focus on tasks for a specific room or location
- 🔍 **Task Type Filters** – Filter tasks by action (water, fertilize, repot)
- ⏰ **Overdue/Urgent Filters** – Show only overdue tasks or those due soon
- ✅ **Inline Task Actions** – Mark tasks done, defer them, or edit details without leaving the dashboard
- 👉 **Swipe Actions** – Swipe a task to quickly complete, edit, or delete it
- 🎉 **Completion Feedback** – Subtle check animation and timestamp confirmation when tasks are marked done
- 🪴 **Room-Based Organization** – Organize plants by room with photo galleries
- 🧪 **Care Defaults** – Onboard new plants with preset watering and fertilizing intervals
- 📜 **Global Timeline** – View all plant care events in a chronological feed
- 🔁 **Timeline Task Actions** – Complete tasks directly from the timeline with undo support
- 🔍 **Timeline Filters** – Narrow the timeline by event type (water, fertilize, repot)
- 📸 **Photo Gallery** – Add and view plant photos over time to track growth
- 🌿 **Plant Detail Hero** – Large photo banner with species and acquisition date
- 🧭 **Tabbed Plant Details** – Switch between stats, timeline, notes, and photos
- 📓 **Plant Notes** – Journal free-form entries from the plant detail view
- 📊 **Quick Stats** – At-a-glance summary of watering, fertilizing, and environment needs
- 📍 **Smart Care Suggestions** – Based on location, light, humidity, pot size, species, weather, and season
- 💧 **ET₀‑Aware Watering** – Adjusts suggested watering intervals using local evapotranspiration data
- 📊 **Visual Insights** – See patterns like ET₀ vs care frequency
- 📱 **Mobile-First Layout** – Bottom navigation, floating action button, and swipeable task cards optimized for one-handed use
- 🛡️ **Safe Area Awareness** – Layout adapts to device notches and home indicators
- 🌗 **Light/Dark Mode** – Toggle the interface theme from Settings
- 🌤️ **Weather Awareness** – Current local weather for each plant using Open‑Meteo
- 🔔 **Condition Alerts** – Notifies you when weather suggests watering or fertilizing soon
- ⏰ **Overdue Task Notifications** – Browser alerts when care tasks are past due
- 🤖 **AI Care Recommendations** – Generates plant-specific watering, fertilizer, light, and repotting guidance
- ⚠️ **Graceful Error States** – Custom 404 and 500 pages with a friendly loading experience

## 🚧 Current Status

This project is under active development.
Check out [ROADMAP.md](./ROADMAP.md) for upcoming milestones and goals.

## 🧑‍🎨 Design System

Kay Maria is built with a focus on calm, clarity, and emotional connection. Our visual language is defined in the [Visual Style Guide](./docs/style-guide.md), including:

- Brand colors
- Typography
- Layout and spacing rules
- UI components
- Microinteractions
- Tone and voice guidelines

The style guide's core colors are exposed in Tailwind as utility classes like `bg-primary`, `text-foreground`, and `text-muted`.
Use these to keep components visually consistent.

The light and dark themes are powered by `next-themes` and Shadcn-style CSS variables defined in `app/globals.css`.

To view a live preview of the design tokens and color palette in the app, visit:

🔗 [`/style-guide`](http://localhost:3000/style-guide) (dev only)

## ☁️ Deployment

Deploy to [Vercel](https://vercel.com):

1. **Push** this repository to GitHub (or another Git provider).
2. **Create a Vercel project** and link it to the repo.
3. **Add environment variables** in *Project Settings → Environment Variables*:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BASE_URL=https://kaymaria.vercel.app`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_TASK_WINDOW_DAYS`
   - `OPENAI_API_KEY` *(optional)*
   - `SINGLE_USER_MODE=true`
   - `SINGLE_USER_ID=<same UUID used locally>`
4. **Deploy**
   ```bash
   npm install -g vercel
   vercel
   vercel --prod
   ```
5. Visit [https://kaymaria.vercel.app/app](https://kaymaria.vercel.app/app) to confirm everything is working.

The included [`vercel.json`](./vercel.json) ensures Vercel picks up the required environment variables.

## 🌿 Plant API

Basic CRUD endpoints exist for working with mock plant data. When creating a plant you can include default care rules, and initial tasks will be scheduled automatically.

Each plant also stores `waterIntervalDays`, `fertilizeIntervalDays`, and optional `potSize`, `potMaterial`, `soilType`, `light`, and `humidity` information.
To enable local weather in the app, include `latitude` and `longitude` when creating a plant.

- `GET /api/plants` – list all plants
- `POST /api/plants` – create a plant with care defaults
- `GET /api/plants/:id` – fetch a plant
- `PATCH /api/plants/:id` – update fields on a plant
- `DELETE /api/plants/:id` – remove a plant and its tasks
- `GET /api/plants/:id/photos` – list photos for a plant
- `POST /api/plants/:id/photos` – upload a photo for a plant
- `DELETE /api/plants/:id/photos` – remove a photo
- `GET /api/plants/:id/weather` – current weather for a plant

Example:
```bash
curl -X POST http://localhost:3000/api/plants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Palm","potSize":"10in","potMaterial":"plastic","soilType":"well-draining","latitude":40.71,"longitude":-74.00,"rules":[{"type":"water","intervalDays":5},{"type":"fertilize","intervalDays":30}]}'
```

## ✅ Task API

Tasks represent upcoming care actions for your plants. Completed tasks automatically log an event and schedule the next one based on your plant's care rules.

- `GET /api/tasks` – list tasks due in the next 7 days (`?window=14d` for a different range)
- `POST /api/tasks` – create a new task

## 🤖 AI Recommendation API

Request plant-specific care guidance powered by OpenAI:

```bash
curl -X POST http://localhost:3000/api/ai/care-recommend \
  -H 'Content-Type: application/json' \
  -d '{"species":"Monstera deliciosa","potSize":"8in","potMaterial":"terracotta","soilType":"well-draining","lightLevel":"bright indirect","humidity":"medium","season":"winter","location":"living room"}'
```

This returns JSON with recommended `water`, `fertilizer`, `light`, and `repot` fields.

Include optional fields:

- `season` and `location` to tailor care advice to the time of year and environment. If omitted, the current season is used and location defaults to `unspecified`.
- `feedback` to tweak future recommendations based on previous guidance (e.g. `"too much water"`).

Example with feedback:
```bash
curl -X POST http://localhost:3000/api/ai/care-recommend \
  -H 'Content-Type: application/json' \
  -d '{"species":"Monstera deliciosa","feedback":"too much water"}'
```

The feedback is included in the AI prompt so new suggestions are adjusted accordingly.

