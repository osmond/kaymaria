
# Plant MVP (Mock Data) v2

## Getting Started

1. Copy `.env.local.example` to `.env.local` and fill in your values.
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` come from your Supabase project.
   - `NEXT_PUBLIC_BASE_URL` should point to the URL where the app runs.
   - `DATABASE_URL` is used by Prisma; the example file defaults to a local SQLite database.
   - `NEXT_PUBLIC_TASK_WINDOW_DAYS` controls how many days ahead the Upcoming view looks (default `7`)
   - `OPENAI_API_KEY` enables AI-powered care recommendations
2. Install dependencies, seed the database, and start the development server:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
# open http://localhost:3000/app
```

To create a production build run:

```bash
npm run build
```

# 🌱 Kay Maria

**Tend to what matters.**  
_A calm, intelligent plant care companion designed for clarity, beauty, and emotional connection._

---

## Overview

Kay Maria is a thoughtful plant tracking app that helps you care for your plants with ease. Inspired by the simplicity of journaling and the intelligence of modern tools, it combines task management, smart care suggestions, and gentle design.

Whether you're nurturing one plant or a hundred, Kay Maria adapts to your space, habits, and environment — with no pressure and no ads.

---

## ✨ Features

- 🌼 **Today View** – See exactly which plants need attention today, including overdue tasks
- 🌅 **Upcoming View** – Preview tasks due in the next 7 days (configurable)
- 🗂️ **Grouped Tasks** – Today's tasks organized by plant for quick scanning
- ⏱️ **Urgency Sorting** – Tasks within each plant group are ordered by due date
- 💧 **Task Icons** – Visual cues for watering, fertilizing, and repotting tasks
- 🏠 **Room Filters** – Focus on tasks for a specific room or location
- 🔍 **Task Type Filters** – Filter tasks by action (water, fertilize, repot)
- ⏰ **Overdue/Urgent Filters** – Show only overdue tasks or those due soon
- 📝 **Quick Notes** – Jot down observations directly from any task card
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
- 📦 **Import/Export Tools** – Backup your plant journal anytime
- 📱 **Mobile-First Layout** – Bottom navigation, floating action button, and swipeable task cards optimized for one-handed use
- 🌗 **Light/Dark Mode** – Toggle the interface theme from Settings
- 🌤️ **Weather Awareness** – Current local weather for each plant using Open‑Meteo
- 🔔 **Condition Alerts** – Notifies you when weather suggests watering or fertilizing soon
- 🤖 **AI Care Recommendations** – Generates plant-specific watering, fertilizer, light, and repotting guidance

---

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

To view a live preview of the design tokens and color palette in the app, visit:

🔗 [`/style-guide`](http://localhost:3000/style-guide) (dev only)

---

## 📦 Local Development

```bash
git clone https://github.com/osmond/kaymaria.git
cd kaymaria
npm install
cp .env.local.example .env.local
npm run dev
```

## 🔌 Test API

A simple endpoint is available for experimenting with mock data:

```bash
curl http://localhost:3000/api/test
```

## 🌿 Plant API

Basic CRUD endpoints exist for working with mock plant data. When creating a plant you can include default care rules, and initial tasks will be scheduled automatically.

Each plant also stores `waterIntervalDays`, `fertilizeIntervalDays`, and optional `potSize`, `potMaterial`, `soilType`, `light`, and `humidity` information.
To enable local weather in the app, include `latitude` and `longitude` when creating a plant.

- `GET /api/plants` – list all plants
- `POST /api/plants` – create a plant with care defaults
- `GET /api/plants/:id` – fetch a plant
- `PATCH /api/plants/:id` – update fields on a plant
- `DELETE /api/plants/:id` – remove a plant and its tasks
- `GET /api/plants/:id/notes` – list notes for a plant
- `POST /api/plants/:id/notes` – add a quick note
- `GET /api/plants/:id/photos` – list photos for a plant
- `POST /api/plants/:id/photos` – add a photo by URL
- `GET /api/plants/:id/weather` – current weather for a plant

Example:

```bash
curl -X POST http://localhost:3000/api/plants \\
  -H 'Content-Type: application/json' \\
  -d '{"name":"Palm","potSize":"10in","potMaterial":"plastic","soilType":"well-draining","latitude":40.71,"longitude":-74.00,"rules":[{"type":"water","intervalDays":5},{"type":"fertilize","intervalDays":30}]}'
```

## ✅ Task API

Tasks represent upcoming care actions for your plants. Completed tasks automatically log an event and schedule the next one based on your plant's care rules.

- `GET /api/tasks` – list tasks due in the next 7 days (`?window=14d` for a different range)
- `POST /api/tasks` – create a new task
- `PATCH /api/tasks/:id` – mark a task complete and record the event

Example:

```bash
curl -X PATCH http://localhost:3000/api/tasks/t_<uuid>
```

## 🤖 AI Recommendation API

Request plant-specific care guidance powered by OpenAI:

```bash
curl -X POST http://localhost:3000/api/ai/care-recommend \\
  -H 'Content-Type: application/json' \\
  -d '{"species":"Monstera deliciosa","potSize":"8in","potMaterial":"terracotta","soilType":"well-draining","lightLevel":"bright indirect","humidity":"medium","season":"winter","location":"living room"}'
```

This returns JSON with recommended `water`, `fertilizer`, `light`, and `repot` fields.

Include optional fields:

- `season` and `location` to tailor care advice to the time of year and environment. If omitted, the current season is used and location defaults to `unspecified`.
- `feedback` to tweak future recommendations based on previous guidance (e.g. `"too much water"`).

Example with feedback:

```bash
curl -X POST http://localhost:3000/api/ai/care-recommend \\
  -H 'Content-Type: application/json' \\
  -d '{"species":"Monstera deliciosa","feedback":"too much water"}'
```

The feedback is included in the AI prompt so new suggestions are adjusted accordingly.

