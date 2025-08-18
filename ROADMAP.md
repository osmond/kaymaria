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
- [x] **Task filters**:
  - [x] Filter by room/location
  - [x] Filter by task type
  - [x] Filter by overdue/urgent
- [x] **Mobile-first layout**: Design for one-handed thumb reach (FAB in lower right, swipe actions on cards)


---

## Phase 2 – Enhanced UX & Context

### 🌿 Plant Detail View

- [x] **Hero banner**: Show large plant photo, nickname, and species (optionally include age or acquired date)
- [x] **Quick Stats section**:
  - [x] Watering interval & next due
  - [x] Fertilizing interval & next due
  - [x] Light level
  - [x] Humidity preference
  - [x] Pot size, pot material,  & soil type
- [x] **Tab layout**:
  - [x] **Quick Stats**: At-a-glance care summary
  - [x] **Timeline**: List of all completed and upcoming care tasks
  - [x] **Notes**: Free-form journaling or text entries
  - [x] **Photos**: A visual gallery of growth over time
- [x] **Task completion feedback**:
  - [x] Add a subtle animation when a task is marked done. don't use emojis
  - [x] Temporary confirmation message (e.g., “Watered!” with timestamp)
- [x] **Inline “Mark as Done” on Timeline**:
  - [x] Let users complete tasks directly from the timeline view
  - [x] Support undo in case of accidental tap



---

## Phase 2b – Smart Context & Suggestions

### 🧠 Smart Features

- [x] Integrate local weather (based on plant location)
- [x] Adjust watering suggestions based on evapotranspiration (ET₀)
- [x] Notify users if conditions suggest watering/fertilizing soon

### 🌿 AI-Powered Care Recommendations (via OpenAI API)

- [x] Recommend plant-specific:
  - [x] Watering amount
  - [x] Fertilizer type and frequency
  - [x] Light level requirements
  - [x] Repotting schedule
- [x] Input factors for recommendations:
  - [x] Pot size
  - [x] Pot material
  - [x] Soil type
  - [x] Indoor light level
  - [x] Room humidity
  - [x] Seasonal changes
  - [x] Plant location (room/outdoor/etc.)
- [x] Learn from user input:
  - [x] Feedback (e.g. “too much water”)
  - [x] Adjust future care suggestions
- [ ] Long-term idea: fine-tune a model using user care logs

---

## Phase 3 – Journaling & History

- [x] Timeline view of all plant care events
- [x] Filter by event type (water, fertilize, etc.)
- [x] Add plant photo journal entries


---

## Phase 4 – App Polish

- [x] Bottom nav and floating FAB
 - [x] Swipeable task actions (mark done, edit, delete)

- [x] Light/dark mode toggle in settings
 - [x] Mobile UX refinements
   - [x] Respect device safe areas for notched screens

 - [x] Align design with [Style Guide](./style-guide/page.tsx)

- [ ] Shadcn/UI design polish and theming

---

## Phase 5 – Data Import/Export

- [x] Export plant data to JSON or `.csv`
- [x] Import plant data from previous backups
- [ ] Sync across devices via Supabase Auth

---

## Phase 6 – Launch Ready

- [ ] Review accessibility
- [ ] Lighthouse performance pass
- [x] Add `README.md` with usage instructions
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
