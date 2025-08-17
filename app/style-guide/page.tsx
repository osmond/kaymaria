"use client";

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  coreColors,
  seasonalLight,
  seasonalDark,
  type ThemeTokens,
} from "@/lib/design-tokens"

function hexToRgb(hex: string) {
  const cleaned = hex.replace("#", "")
  const bigint = parseInt(cleaned.length === 3 ? cleaned.repeat(2) : cleaned, 16)
  return [bigint >> 16 & 255, bigint >> 8 & 255, bigint & 255]
}

function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const channel = v / 255
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(a: string, b: string) {
  const L1 = luminance(a)
  const L2 = luminance(b)
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
}

function adjustColor(hex: string, amount: number) {
  const [r, g, b] = hexToRgb(hex).map((v) => Math.max(0, Math.min(255, v + amount)))
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`
}

export default function StyleGuidePreviewPage() {
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light")

  return (
    <div
      data-theme={previewMode}
      className="p-6 space-y-8 min-h-screen bg-neutral-50 text-neutral-900 transition-colors dark:bg-neutral-900 dark:text-neutral-50"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-display">Style Guide</h1>
        <Button
          variant="secondary"
          aria-pressed={previewMode === "dark"}
          onClick={() => setPreviewMode(previewMode === "light" ? "dark" : "light")}
        >
          Preview: {previewMode === "light" ? "Light" : "Dark"}
        </Button>
      </div>

      {/* Core Colors */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Core Tokens</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ColorSwatch name="Primary" hex={coreColors.primary} />
            <ColorSwatch name="Secondary" hex={coreColors.secondary} />
            <ColorSwatch name="Background" hex={coreColors.background} text="black" />
            <ColorSwatch name="Foreground" hex={coreColors.foreground} />
            <ColorSwatch name="Muted" hex={coreColors.muted} />
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Themes */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <h2 className="text-xl font-display font-semibold">Seasonal Themes</h2>

          <div>
            <h3 className="text-md font-medium mb-2">{previewMode === "light" ? "Light Mode" : "Dark Mode"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(previewMode === "light" ? seasonalLight : seasonalDark).map((theme) => (
                <ThemeSwatch key={theme.label} {...theme} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ColorSwatch({ name, hex, text = "white" }: { name: string, hex: string, text?: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div
        className="w-full h-16 rounded-lg"
        style={{ backgroundColor: hex }}
        role="img"
        aria-label={`${name} color swatch ${hex}`}
      />
      <span className="text-sm text-muted-foreground">{name}</span>
      <span className="text-xs" style={{ color: text }}>{hex}</span>
    </div>
  )
}

function ThemeSwatch({ label, primary, secondary, background, foreground }: ThemeTokens) {
  const contrastChecks = [
    { label: "FG/BG", ratio: contrastRatio(foreground, background) },
    { label: "Primary/BG", ratio: contrastRatio(primary, background) },
    { label: "Secondary/BG", ratio: contrastRatio(secondary, background) },
  ]
  const hover = adjustColor(primary, 20)
  const active = adjustColor(primary, -20)

  return (
    <div className="rounded-lg border overflow-hidden text-xs shadow">
      <div className="flex h-6 text-[10px] text-center text-white font-bold">
        <div
          className="flex-1 flex items-center justify-center"
          style={{ backgroundColor: primary }}
          role="img"
          aria-label={`Primary color swatch ${primary}`}
        >
          Primary
        </div>
        <div
          className="flex-1 flex items-center justify-center"
          style={{ backgroundColor: secondary }}
          role="img"
          aria-label={`Secondary color swatch ${secondary}`}
        >
          Secondary
        </div>
        <div
          className="flex-1 flex items-center justify-center"
          style={{ backgroundColor: background, color: coreColors.foreground }}
          role="img"
          aria-label={`Background color swatch ${background}`}
        >
          BG
        </div>
        <div
          className="flex-1 flex items-center justify-center"
          style={{ backgroundColor: foreground }}
          role="img"
          aria-label={`Foreground color swatch ${foreground}`}
        >
          FG
        </div>
      </div>
      <div className="p-2 space-y-2">
        <strong className="block text-sm">{label}</strong>
        <ul className="space-y-1">
          <li><span className="font-medium">Primary:</span> {primary}</li>
          <li><span className="font-medium">Secondary:</span> {secondary}</li>
          <li><span className="font-medium">Background:</span> {background}</li>
          <li><span className="font-medium">Foreground:</span> {foreground}</li>
        </ul>
        <ul className="space-y-1">
          {contrastChecks.map((c) => (
            <li key={c.label}>
              {c.label}: {c.ratio.toFixed(2)} {c.ratio >= 4.5 ? "✅" : "⚠️"}
            </li>
          ))}
        </ul>
        <div
          className="rounded p-2 space-y-2"
          style={{ backgroundColor: background, color: foreground }}
        >
          <p>Example card</p>
          <button
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: primary, color: foreground }}
          >
            Button
          </button>
        </div>
        <div className="flex h-6 text-[10px] text-center text-white font-bold rounded overflow-hidden">
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: primary }}>
            Default
          </div>
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: hover }}>
            Hover
          </div>
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: active }}>
            Active
          </div>
        </div>
      </div>
    </div>
  )
}
