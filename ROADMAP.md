# 🌱 Kay Maria Roadmap

This roadmap outlines the next development milestones for the **Kay Maria** plant care app, with a focus on quality, consistency, and a revisit of previously completed work to ensure full **style guide compliance**.

> 📝 **Reminder to all developers**: Please cross-reference each component or page update with the latest [Style Guide](https://github.com/osmond/kaymaria/blob/main/docs/style-guide.md) and visual QA checklists.

---

## Phase 0 – Foundation

 - [x] Supabase Auth setup ([#90](https://github.com/osmond/kaymaria/issues/90))

- [x] Real-time data sync across devices
- [x] Backend persistence for plant data
- [x] End-to-end test suite

---

## Phase 1 – Revisit & Polish Core Features

### 🪴 Plant Management

- [x] Add Plant Form Polish
  - [x] UI styling
  - [x] Validation
  - [x] Persistence
  - [x] Smoke tests

- [x] Revisit New Plant Page (`/app/plants/new`)
  - [x] Full UI/UX alignment with style guide
  - [x] Responsive layout check
  - [x] Accessibility audit

- [x] Plant Detail Page
  - [x] UI styling
  - [x] Navigation improvements
  - [x] Loading states
  - [x] Smoke tests
  - [x] Visual alignment with style guide

---

## Phase 2 – Core Pages UX Polish

- [x] `/app/plants` (All Plants / Rooms)
- [ ] `/app/today` (Daily Task View)
- [ ] `/app/timeline` (Plant History)
- [ ] `/app/insights` (Analytics)
- [ ] `/app/settings` (App Preferences)

For **each page**, ensure:
  - [ ] Layout hierarchy matches visual system
  - [ ] Typography uses only approved fonts and scales
  - [ ] Buttons, labels, and states align with design tokens
  - [ ] Responsive layout verified
  - [ ] Regressions checked

---

## Phase 3 – Visual & Style Guide Compliance Pass

**This pass should include final QA against the [style guide](https://github.com/osmond/kaymaria/blob/main/docs/style-guide.md).**

- [ ] Revisit and polish the following views:
  - [ ] Plants page (`/app/plants`)
  - [ ] New Plant page (`/app/plants/new`)
  - [ ] Today page (`/app/today`)
  - [ ] Timeline page (`/app/timeline`)
  - [ ] Insights page (`/app/insights`)
  - [ ] Settings page (`/app/settings`)
- [ ] Typography and color audit
- [ ] Spacing and padding QA
- [ ] Component state visual tests (hover, active, disabled, etc.)

---

## Phase 4 – Testing, QA, and Regression Coverage

- [ ] End-to-end test suite
- [ ] Continuous integration pipeline
- [ ] Manual test case documentation ([#75](https://github.com/osmond/kaymaria/issues/75))
- [ ] Regression test sweep for recently refactored pages
- [ ] QA checklist for mobile and desktop

---

## Phase 5 – Analytics & Insights

- [ ] Usage tracking (events, page views, funnel drop-off)
- [ ] Trend visualizations (e.g. watering streaks, missed tasks)
- [ ] Admin dashboard UI
  - [ ] Mobile-aware layout
  - [ ] Ability to export key metrics (CSV or JSON)

---

## Phase 6 – Native App Enhancements

- [ ] PWA shell setup
- [ ] Offline caching with local persistence


---


