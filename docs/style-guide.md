# Kay Maria Style Guide

_A living spec for design & implementation. Keep this in `/docs/STYLEGUIDE.md` and update alongside UI changes._  
_Last updated: 2025-08-19_

---

## 1) Brand Palette & Design Tokens

Use semantic roles so components don’t rely on raw hex values.

### Core Brand
- **Primary (brand)**: `#508C7E`
- **Secondary (mint highlight)**: `#D3EDE6`
- **Surface / Background**: `#F9F9F9` (app), `#FFFFFF` (cards/dialogs)
- **Text (foreground)**: `#111827`
- **Muted Text**: `#9CA3AF`

### Functional Roles
- **Success**: `#16A34A`
- **Warning**: `#F59E0B`
- **Error**: `#DC2626`
- **Borders**: `#E5E7EB` (default), `#F1F5F9` (subtle)

> **Rule:** Use semantic roles in code (e.g., `text-text`, `bg-surface-1`, `border-border`) rather than raw hex.

### Elevation, Radius, Motion
- **Shadows**: `card` (base), `hover` (interactive)
- **Radius**: `xl` = `0.75rem`, `2xl` = `1rem`
- **Ring Width**: `3px` for focus
- **Durations**: `fast` 120ms, `base` 200ms, `slow` 320ms
- **Easing**: `standard: cubic-bezier(.2,.0,.2,1)`, `emphasized: cubic-bezier(.2,.0,0,1)`

---

## 2) Typography

**Headlines:** Cabinet Grotesk  
**Body & UI:** Inter

| Role | Font | Size | Weight | Line-height | Tracking |
|------|------|------|--------|-------------|----------|
| Display | Cabinet | 36–40px | 600 | 1.1 | normal |
| H1 | Cabinet | 28px | 600 | 1.2 | normal |
| H2 | Cabinet | 22px | 600 | 1.25 | normal |
| H3 | Cabinet | 18px | 600 | 1.25 | normal |
| Body | Inter | 16px | 400 | 1.5 | 0 |
| Small | Inter | 14px | 400 | 1.45 | 0 |
| Caption | Inter | 12px | 500 | 1.35 | 0 |

**Links:** underline on hover/focus; accessible color contrast.

---

## 3) Layout & Spacing

- **Grid:** 4pt system (4, 8, 12, 16, 20, 24, 32, 40, 48...)
- **Gutters:** mobile 16px, tablet 24px, desktop 32–40px
- **Max Content Width:** 1240px
- **Cards:** `rounded-2xl bg-surface-1 shadow-card p-4 md:p-6`

---

## 4) Accessibility & Focus

- Target **WCAG 2.2 AA**: text 4.5:1; large text/UI 3:1
- **Focus ring**: 3px brand + 2px offset
- Respect `prefers-reduced-motion`
- Touch targets ≥ 44×44px

---

## 5) Motion

- **Tap/Hover micro-interactions**: 120–150ms, `standard`
- **Page/Section transitions**: 200–320ms, `emphasized`
- **Success bounce**: scale 1 → 1.04 → 1
- Animate `opacity`, `transform`; avoid layout-thrashing

---

## 6) Component Specifications

### Buttons
- **Variants:** `primary`, `secondary`, `ghost`, `destructive`
- **Sizes:** `sm` (28px), `md` (36px), `lg` (44px), `xl` (52px)
- **States:** Rest, Hover, Active, Focus, Disabled

```html
<button class="inline-flex items-center justify-center gap-2 rounded-xl px-4 h-11
            bg-brand text-white shadow-card transition duration-base ease-standard
            hover:shadow-hover active:translate-y-[1px]
            focus:outline-none focus:ring-3 focus:ring-brand focus:ring-offset-2
            disabled:opacity-50 disabled:pointer-events-none">
  <svg class="h-5 w-5" aria-hidden="true"></svg>
  <span>Add plant</span>
</button>
```

### Cards
- **Structure:** Header (title/meta), Body (content), Footer (actions)
- **Interactive:** Add `hover:shadow-hover`, `-translate-y-px`

### Inputs (Text, Select, Textarea)
- **Base:** `rounded-xl border border-border bg-white px-3 py-2`
- **Focus:** `focus:ring-3 focus:ring-brand-400 focus:border-brand-500`
- **Validation:** success, error borders and helper text

### FAB
- **Size:** 56×56, icon 24px
- **Position:** bottom-right, 16px from safe area
- **Behavior:** Tap for primary, expand for additional actions

### Chips / Tags
- **Height:** 28px
- **Text Size:** 12–14px
- **Selected:** outline with brand fill at 12% opacity

---

## 7) Component States Matrix

| State   | Color       | Shadow        | Transform            | Notes                       |
|---------|-------------|----------------|------------------------|-----------------------------|
| Rest    | `bg-brand`  | `shadow-card` | None                   | Standard appearance         |
| Hover   | Darken 5%   | `shadow-hover`| None                   | Adds elevation              |
| Active  | Darken 10%  | None           | `translate-y-[1px]`    | Simulates button press      |
| Focus   | Ring-brand  | Ring-3         | Offset + ring          | Visible for keyboard users  |
| Disabled| 50% opacity | None           | No pointer events      | Grayed out UI               |

---

## 8) UI Patterns

- **Empty State:** friendly graphic + action text
  - _"No plants yet. Add your first to start tending 🌿"_
- **Loading State:** use skeletons with consistent layout
- **Error State:** toast + inline hint + retry action

---

## 9) Iconography

- **Grid Sizes:** 16 / 20 / 24 px
- **Style:** outline, 1.5–2px stroke
- **Guideline:** consistent sizes per view; use labels for unclear icons

---

## 10) Content & Voice

> Gentle. Reassuring. Encouraging. Avoid productivity jargon.

- **Success:** “Marked as watered.”
- **Undo:** “Undo”
- **Destructive:** “Delete plant? This can’t be undone.”
- **Taglines:** “Tend to what matters.” / “You’re doing great.”

---

## 11) Theming (Dark Mode)

- `surface.DEFAULT: #0B0F0E`
- `text.DEFAULT: #E5E7EB`
- `border.DEFAULT: #1F2A28`
- Adjust `brand-400/500` for contrast
- Use same spacing/elevation rhythm

---

## 12) Usage Cheatsheet

- **Card container:** `rounded-2xl bg-surface-1 shadow-card p-4 md:p-6`
- **Primary button:** `bg-brand text-white hover:shadow-hover`
- **Input focus:** `focus:ring-3 focus:ring-brand-400 focus:ring-offset-2`
- **Muted meta:** `text-text-muted`

---

## 13) Page QA Checklist Template

Use this to validate each view against the style guide.

### Example: Today Page
- [ ] Typography follows Cabinet + Inter specs
- [ ] All buttons use correct variant/sizing/states
- [ ] Cards have correct padding, radius, shadow
- [ ] Layout respects 4pt spacing + responsive gutters
- [ ] All interactive elements have focus rings
- [ ] Component states: hover, active, disabled, selected
- [ ] Empty, loading, and error states are implemented
- [ ] Icons are sized and labeled correctly

---

## Changelog

- **2025-08-19:** Explicit revision: tokens, components, state matrix, patterns, and dark mode. QA checklist template added.

