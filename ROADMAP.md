# 🌱 Kay Maria Roadmap

This roadmap outlines the development milestones for the Kay Maria plant care app.
All items are unchecked to indicate upcoming work.

---

## Phase 0 – Foundation

 - [x] Set up Supabase project and env keys (.env.local)
 - [x] Run database migrations (Prisma)
 - [ ] Create seed scripts for mock data (plants, tasks)
 - [x] Add test route to fetch plants and tasks

---

## Phase 1 – Core Features

### 🪴 Plant & Task Management
- [ ] Create mock data for plants and tasks
- [ ] Build CRUD endpoints for `/plants` and `/tasks`
- [ ] Support plant onboarding with care defaults
- [ ] Add care intervals (water, fertilize, etc.)
- [ ] Support marking tasks as complete

### 📅 Home View
- [ ] "Today" and "Upcoming" views for care tasks
- [ ] Show due tasks sorted by plant, with icons
- [ ] Support adding Quick Notes to a plant from task card

---

## Phase 2 – Enhanced UX & Context

### 🌿 Plant Detail View
- [ ] Hero banner with photo and stats
- [ ] Tabs: Quick Stats, Timeline, Notes, Photos
- [ ] Animated task completion feedback
- [ ] Inline “Mark as Done” on Timeline view

### 🧠 Smart Features

- [ ] Integrate local weather (based on plant location)
- [ ] Adjust watering suggestions based on evapotranspiration (ET₀)
- [ ] Notify users if conditions suggest watering/fertilizing soon

#### 🌿 AI-Powered Care Recommendations (via OpenAI API)

- [ ] Recommend plant-specific:
  - [ ] Watering amount
  - [ ] Fertilizer type and frequency
  - [ ] Light level requirements
  - [ ] Repotting schedule
- [ ] Input factors for recommendations:
  - [ ] Pot size
  - [ ] Soil type
  - [ ] Indoor light level
  - [ ] Room humidity
  - [ ] Seasonal changes
  - [ ] Plant location (room/outdoor/etc.)
- [ ] Learn from user input:
  - [ ] Feedback (e.g. “too much water”)
  - [ ] Adjust future care suggestions
- [ ] Long-term idea: fine-tune a model using user care logs


---

## Phase 3 – Journaling & History

- [ ] Timeline view of all plant care events
- [ ] Filter by event type (water, fertilize, etc.)
- [ ] Add plant photo journal entries
- [ ] Mood/notes tagging per entry

---

## Phase 4 – App Polish

- [ ] Bottom nav and floating FAB
- [ ] Swipeable task actions (mark done, edit, delete)
- [ ] Shadcn/UI design polish and theming
- [ ] Light/dark mode toggle
- [ ] Mobile UX refinements

---

## Phase 5 – Data Import/Export

- [ ] Export plant data to JSON or .csv
- [ ] Import plant data from previous backups
- [ ] Sync across devices via Supabase Auth

---

## Phase 6 – Launch Ready

- [ ] Review accessibility
- [ ] Lighthouse performance pass
- [ ] Add README with instructions
- [ ] Create short demo video or gif
- [ ] Deploy to Vercel and connect to custom domain
