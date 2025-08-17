
# Plant MVP (Mock Data) v2

## Getting Started

1. Copy `.env.local.example` to `.env.local` and fill in your values.
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` come from your Supabase project.
   - `NEXT_PUBLIC_BASE_URL` should point to the URL where the app runs.
2. Install dependencies and start the development server:

```bash
npm install
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

- 🌼 **Today View** – See exactly which plants need attention today
- 🪴 **Room-Based Organization** – Organize plants by room with photo galleries
- ⏳ **Timeline Journaling** – Visual history of waterings, notes, and care
- 📸 **Photo Uploads** – Track growth and keep a visual plant diary
- 📍 **Smart Care Suggestions** – Based on light, pot size, species, and weather
- 📊 **Visual Insights** – See patterns like ET₀ vs care frequency
- 📦 **Import/Export Tools** – Backup your plant journal anytime
- 📱 **Mobile-First UI** – Fast, clean, swipeable interface with offline support
- 🌤️ **Weather Awareness** – Adjust care based on location and evapotranspiration

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

