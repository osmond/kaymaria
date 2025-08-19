# Kay Maria Style Guide

_A living spec for design & implementation. Keep this in `/docs/STYLEGUIDE.md` and update alongside UI changes._  
_Last updated: 2025‑08‑19_

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

| Role | Font | Size | Weight | Line‑height | Tracking |
|---|---|---|---|---|---|
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

- **Grid:** 4‑pt system (4, 8, 12, 16, 20, 24, 32, 40, 48…)
- **Gutters:** mobile 16px, tablet 24px, desktop 32–40px
- **Max Content Width:** 1240px
- **Cards:** `rounded-2xl bg-surface-1 shadow-card p-4 md:p-6`

---

## 4) Accessibility & Focus

- Target **WCAG 2.2 AA**: text 4.5:1; large text/non‑text UI 3:1
- **Focus ring** (all interactive): ring 3px brand + 2px offset on surface
- Respect `prefers-reduced-motion`: turn off non‑essential animations
- Touch targets ≥ 44×44px

---

## 5) Motion Primitives (Framer Motion)

- **Tap/Hover micro‑interactions**: 120–150ms, `standard`
- **Page/Section transitions**: 200–320ms, `emphasized`
- **Success bounce**: scale 1 → 1.04 → 1 (≈120ms)
- Animate `opacity`/`transform`; avoid layout‑thrashing (height/width) animations.

---

## 6) Component Specs

### Buttons (map to shadcn/ui variants)
- **Variants:** `primary`, `secondary`, `ghost`, `destructive`
- **Sizes:** `sm` (28px), `md` (36px), `lg` (44px), `xl` (52px)
- **Primary:** brand background, white text; hover `shadow-hover`; active `translate-y-[1px]`; disabled 50% opacity
- **Loading:** spinner replaces leading icon; label unchanged
- **Focus:** global ring spec

**Example:**
```html
<button class="inline-flex items-center justify-center gap-2 rounded-xl px-4 h-11
            bg-brand text-white shadow-card transition duration-base ease-standard
            hover:shadow-hover active:translate-y-[1px]
            focus:outline-none focus:ring-3 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-surface
            disabled:opacity-50 disabled:pointer-events-none">
  <svg class="h-5 w-5" aria-hidden="true"></svg>
  <span>Add plant</span>
</button>
```

### Card
- **Anatomy:** header (title/meta), body (content), footer (actions)
- **Interactive cards:** add `hover:shadow-hover` + subtle lift (`-translate-y-px`)

### Inputs (Text, Select, Textarea)
- **Base:** `rounded-xl border border-border bg-white px-3 py-2 shadow-inner/0
           focus:ring-brand-400 focus:border-brand-500`
- **Error:** border `error`, help‑text `error`
- **Success:** border `success` (only after validation)

### FAB
- **Size:** 56×56, icon 24px; bottom‑right, 16px from safe area
- **Shadow:** `shadow-hover`; avoid keyboard overlap
- **Behavior:** quick tap = primary action; long‑press or expand for `Add Plant` / `Add Room`

### Chips / Tags
- 28px height; 12–14px text; selected uses brand outline fill 12%

---

## 7) Component States

Provide all states for interactive components:
- **Rest** → **Hover** → **Active/Pressed** → **Focus** → **Disabled**
- **Validation:** `success`, `warning`, `error` (inputs)
- **Selected** (lists, chips, tabs) with clear affordances

---

## 8) Patterns

- **Empty State:** friendly graphic + action
  - _“No plants yet. Add your first to start tending 🌿”_
- **Loading:** use skeletons that preserve layout
- **Errors:** toast + inline hint + recovery action (e.g., retry)

---

## 9) Iconography

- **Grid:** 16 / 20 / 24 px
- **Style:** outline 1.5–2px stroke
- **Usage:** consistent sizes within a view; keep labels for non‑obvious symbols

---

## 10) Content & Voice

> Gentle. Reassuring. Encouraging. Avoid “productivity” buzzwords.

- **Success toast:** “Marked as watered.”  
- **Undo action:** “Undo”  
- **Confirm destructive:** “Delete plant? This can’t be undone.”
- **Tagline examples:** “Tend to what matters.” / “You’re doing great.”

---

## 11) Theming (Dark Mode)

Dark tokens should keep the same rhythm:
- `surface.DEFAULT: #0B0F0E`
- `text.DEFAULT: #E5E7EB`
- `border.DEFAULT: #1F2A28`
- Adjust brand 400/500 for contrast on dark

---

## 12) Example Usage Cheatsheet

- Card container: `rounded-2xl bg-surface-1 shadow-card p-4 md:p-6`
- Primary button: `bg-brand text-white hover:shadow-hover`
- Input focus: `focus:ring-3 focus:ring-brand-400 focus:ring-offset-2`
- Muted meta: `text-text-muted`

---

# tailwind.config.js — Diff to apply

> Use this unified diff to extend your existing Tailwind config. If your project uses CommonJS, replace `export default` with `module.exports =`.

```diff
--- a/tailwind.config.js
+++ b/tailwind.config.js
@@
-export default {
+export default {
   content: [
     "./index.html",
     "./src/**/*.{ts,tsx,js,jsx}",
     "./app/**/*.{ts,tsx,js,jsx}",
     "./components/**/*.{ts,tsx,js,jsx}",
   ],
   theme: {
     extend: {
+      fontFamily: {
+        cabinet: ["Cabinet Grotesk", "ui-sans-serif", "system-ui"],
+        inter: ["Inter", "ui-sans-serif", "system-ui"],
+      },
+      colors: {
+        brand: {
+          DEFAULT: "#508C7E",
+          50:  "#EEF6F4",
+          100: "#DBEDE8",
+          200: "#B9DCD3",
+          300: "#94C9BC",
+          400: "#6FB5A4",
+          500: "#508C7E",
+          600: "#3F7266",
+          700: "#345C53",
+          800: "#2A4A44",
+          900: "#1F3631",
+        },
+        surface: { DEFAULT: "#F9F9F9", 1: "#FFFFFF", 2: "#F3F4F6" },
+        text: { DEFAULT: "#111827", muted: "#9CA3AF", inverse: "#FFFFFF" },
+        border: { DEFAULT: "#E5E7EB", subtle: "#F1F5F9" },
+        success: { DEFAULT: "#16A34A" },
+        warning: { DEFAULT: "#F59E0B" },
+        error:   { DEFAULT: "#DC2626" },
+      },
+      boxShadow: {
+        card: "0 8px 24px rgba(0,0,0,.08)",
+        hover: "0 10px 28px rgba(0,0,0,.12)",
+      },
+      borderRadius: {
+        xl: "0.75rem",
+        "2xl": "1rem",
+      },
+      ringWidth: {
+        3: "3px",
+      },
+      transitionDuration: {
+        fast: "120ms",
+        base: "200ms",
+        slow: "320ms",
+      },
+      transitionTimingFunction: {
+        standard: "cubic-bezier(.2,.0,.2,1)",
+        emphasized: "cubic-bezier(.2,.0,0,1)",
+      },
     },
   },
   plugins: [],
 }
```

> **Optional (Next/shadcn projects):** If you use `tailwind.config.ts`, copy the `extend` object above. Keep font imports in your CSS: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Cabinet+Grotesk:wght@500;600&display=swap');` (or self‑host).

---

## Changelog
- **2025‑08‑19:** Initial explicit spec: tokens, states, motion, focus, components, and Tailwind diff.

