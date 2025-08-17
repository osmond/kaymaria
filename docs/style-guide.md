# Kay Maria Style Guide

This document defines the foundational design language for the Kay Maria plant care app. Use this guide to ensure a consistent, calming, and emotionally resonant experience across the app.

---

## 🎨 Colors

| Token         | Color        | Description                     |
|---------------|--------------|---------------------------------|
| `primary`     | `#508C7E`     | Soft green, main accent color   |
| `secondary`   | `#D3EDE6`     | Pale mint, used for highlights  |
| `background`  | `#F9F9F9`     | Light, airy page background     |
| `foreground`  | `#111827`     | Main text color (dark gray)     |
| `muted`       | `#9CA3AF`     | Descriptive text, timestamps    |

| Theme              | Primary   | Secondary | Background | Foreground | Notes                          |
| ------------------ | --------- | --------- | ---------- | ---------- | ------------------------------ |
| **Spring (Light)** | `#6CA995` | `#E2F7F2` | `#FDFDFD`  | `#1F2937`  | Fresh, vibrant, soft greens    |
| **Summer (Light)** | `#508C7E` | `#D3EDE6` | `#F9F9F9`  | `#111827`  | Current default theme          |
| **Autumn (Light)** | `#C38154` | `#F5E7DA` | `#FBFAF8`  | `#3B2F2F`  | Warm tones for fall            |
| **Winter (Light)** | `#6B7280` | `#E0E7FF` | `#F8FAFC`  | `#1E293B`  | Cool neutrals and quiet blue   |
| **Default (Dark)** | `#7BD7C2` | `#1B2A2B` | `#0B0F10`  | `#E5E7EB`  | Calming green-teal highlights  |
| **Winter (Dark)**  | `#6C82B3` | `#1C2431` | `#0A101A`  | `#E2E8F0`  | Frosted blue, low contrast     |
| **Autumn (Dark)**  | `#D69F7E` | `#2E1E1E` | `#1A1410`  | `#F3F4F6`  | Cozy, moody brown-orange tones |

---

## 🖋️ Typography

- **Headlines:** `Cabinet Grotesk`
- **Body & UI Text:** `Inter`

Use varied sizes for hierarchy:
- `xl` – Page titles
- `lg` – Section headers
- `base` – Body text
- `sm` – Captions, timestamps

---

## 🧱 Layout & Spacing

- Use grid layouts for dashboards and plant galleries.
- Consistent padding: `p-4`, `p-6` for sections.
- Rounded corners: `rounded-2xl`
- Soft drop shadows: `shadow-md`

---

## 🎛️ Components

- **Cards:** Rounded, padded with drop shadow.
- **Buttons:** Rounded, soft shadows. Primary button uses `primary` color.
- **FAB:** Floating Action Button for "Add Plant" and "Add Room", always bottom-right.

---

## 💬 Microinteractions

- Tap and swipe animations via Framer Motion.
- Use feedback (e.g., subtle bounce or shimmer) on completion actions.
- Deliberate, smooth transitions.

---

## ☁️ Tone & Voice

> Gentle. Reassuring. Encouraging.

- Use phrases like “Tend to what matters” and “You're doing great.”
- Avoid productivity buzzwords. Favor calm, supportive language.

---

## 🌤️ Visual Language

- Support weather-aware UI (sunlight, rainfall hints)
- Use iconography for plant needs: 💧 ☀️ 🌱

---

_Last updated: August 2025_
