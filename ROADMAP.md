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

- [x] Build CRUD endpoints for `/plants`
- [x] Support plant onboarding with care defaults
- [x] Add care intervals (water, fertilize, etc.)
- [x] Support marking tasks as complete

### 📅 Home View (Task Dashboard)

- [x] **Today view**: Show only tasks due today, including overdue ones
- [x] **Upcoming view**: Show tasks due in the next 7 days (or a configurable range)
- [x] **Group tasks by plant**: Visual hierarchy that nests or groups tasks under each plant
- [x] **Sort by urgency**: Sort tasks by due date/time within each plant group
- [x] **Task icons**: Use visual icons (💧 Water, 🌱 Fertilize, 🪴 Repot) for quick scanning
- [x] **Quick Notes**: Allow inline note-taking for a plant directly from the task card (e.g., "drooping today" or "spotted new growth")
- [x] **Inline task actions**:
  - [x] Mark as done (with subtle animation or feedback)
  - [x] Defer (e.g., "Remind me tomorrow")
  - [x] Edit task details (date, type, etc.)
- [ ] ** filters**: 
  - [ ] Filter by room/location
  - [ ] Filter by task type
  - [ ] Filter by overdue/urgent
- [ ] **Mobile-first layout**: Design for one-handed thumb reach (FAB in lower right, swipe actions on cards)


---

## Phase 2 – Enhanced UX & Context

### 🌿 Plant Detail View

- [ ] **Hero banner**: Show large plant photo, nickname, and species (optionally include age or acquired date)
- [ ] **Quick Stats section**:
  - [ ] Watering interval & next due
  - [ ] Fertilizing interval & next due
  - [ ] Light level
  - [ ] Humidity preference
  - [ ] Pot size, pot material,  & soil type
- [ ] **Tab layout**:
  - [ ] **Quick Stats**: At-a-glance care summary
  - [ ] **Timeline**: List of all completed and upcoming care tasks
  - [ ] **Notes**: Free-form journaling or text entries
  - [ ] **Photos**: A visual gallery of growth over time
- [ ] **Task completion feedback**:
  - [ ] Add a subtle animation or emoji burst when a task is marked done
  - [ ] Temporary confirmation message (e.g., “Watered!” with timestamp)
- [ ] **Inline “Mark as Done” on Timeline**:
  - [ ] Let users complete tasks directly from the timeline view
  - [ ] Support undo in case of accidental tap
- [ ] **Mobile gesture support**:
  - [ ] Swipe to mark as done or edit a task
  - [ ] Tap-and-hold to add a journal entry or photo


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
