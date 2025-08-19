# 🌱 Kay Maria Roadmap v2

This roadmap outlines upcoming feature work for the Kay Maria plant care app.

## 11) 3-step wizard with live summary rail

**Why:** Reduce cognitive load; clearer progress.

**Scope:** Steps: Basics → Setup → Care plan with a summary chip bar.

**Acceptance criteria**
- Stepper UI with titles; users can go Back at any time.
- Summary rail shows "Water every 7d / 500 ml • Fertilize every 30d"; updates live.
- Validation gates Next button.

**Copy**
- Step headings: "Basics", "Setup", "Care plan".

**Eng notes**
- Keep existing form state; render steps conditionally.
- Transition animation 150–200ms for smoothness.

## 12) Suggested Plan provenance & confidence

**Why:** Trust through transparency.

**Scope:** Suggested Plan card.

**Acceptance criteria**
- Card shows source: "From Presets (ZZ Plant, 6 in, terracotta) • Confidence: Medium" OR "From AI (model X.Y)".
- (i) tooltip with 1–2 rationale bullets ("Terracotta dries faster → shorter interval").

**Copy**
- Subtitle: "From Presets … • Confidence: Medium"
- Tooltip bullets (examples):
  - "Terracotta dries faster → shorter interval"
  - "Medium light → moderate frequency"

**Eng notes**
- Extend API response: { source: 'preset'|'ai', confidence: 0..1, rationale: string[] }.
- Fallback to "No presets found—using a safe starting point."

## 13) Visual help for Light & Drainage (popover)

**Why:** Reduce guesswork; better data in.

**Scope:** Info (i) on Light and Drainage.

**Acceptance criteria**
- Clicking (i) opens a popover with 2–3 photo thumbnails and short text:
  - Low: no direct sun; a few feet from window
  - Medium: bright indirect; near window
  - Bright: hours of direct sun
- Drainage popover: photo examples + 1–liners for poor/OK/great.

**Copy**
- Popover titles: "How to pick light", "Drainage guide".

**Eng notes**
- Asset bundle for three small illustrative images.
- Prefetch on hover.

## 14) Location accuracy badge + OSM attribution

**Why:** Set expectations; comply with terms.

**Scope:** Location section.

**Acceptance criteria**
- When geolocation succeeds, show "±100 m" (or browser-reported accuracy).
- Nominatim search UI shows "Search by address" with a tiny "Powered by OpenStreetMap" line.

**Copy**
- Accuracy: "±{n} m"
- Attribution: "Search by address · Powered by OpenStreetMap"

**Eng notes**
- Use coords.accuracy if available; otherwise hide badge.
- Add OSM/Nominatim attribution per policy.

