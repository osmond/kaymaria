# 🌱 Kay Maria Roadmap

This roadmap outlines the development milestones for the Kay Maria plant care app.  
All items are **unchecked** to indicate upcoming work.

---

## Phase 0 – Foundation

 - [x] Set up Supabase project and env keys (.env.local)
 - [x] Run database migrations (Prisma)
 - [x] Create seed scripts for mock data (plants, tasks)
 - [x] Add test route to fetch plants and tasks


> 🔧 Mock data is used in early development and will be replaced with Supabase queries in later phases.


---

## Phase 1 – Core Features

### 🪴 Plant & Task Management

- [x] Create mock data for plants and tasks

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

---

## Phase 2b – Smart Context & Suggestions

### 🧠 Smart Features

- [ ] Integrate local weather (based on plant location)
- [ ] Adjust watering suggestions based on evapotranspiration (ET₀)
- [ ] Notify users if conditions suggest watering/fertilizing soon

### 🌿 AI-Powered Care Recommendations (via OpenAI API)

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
- [ ] Align design with [Style Guide](./style-guide/page.tsx)

---

## Phase 5 – Data Import/Export

- [ ] Export plant data to JSON or `.csv`
- [ ] Import plant data from previous backups
- [ ] Sync across devices via Supabase Auth

---

## Phase 6 – Launch Ready

- [ ] Review accessibility
- [ ] Lighthouse performance pass
- [ ] Add `README.md` with usage instructions
- [ ] Create short demo video or gif
- [ ] Deploy to Vercel and connect to custom domain
- [ ] Manual test cases (mobile + desktop)
- [ ] 404, 500 error handling and loading states
- [ ] Regression test for mock → live transition

---

## 💡 Backlog & Ideas

- [ ] Notifications for overdue care
- [ ] Shareable plant profiles (public link)
- [ ] Visual analytics dashboard
- [ ] Native app support (PWA or React Native)
