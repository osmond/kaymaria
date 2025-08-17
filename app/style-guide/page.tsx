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

export default function StyleGuidePreviewPage() {
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light")

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-display">Style Guide</h1>
        <Button
          variant="secondary"
          onClick={() => setPreviewMode(previewMode === "light" ? "dark" : "light")}
        >
          Preview: {previewMode === "light" ? "Light" : "Dark"}
        </Button>
      </div>

      {/* Core Colors */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Core Tokens</h2>
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
          <h2 className="text-xl font-semibold">Seasonal Themes</h2>

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
      <div className="w-full h-16 rounded-lg" style={{ backgroundColor: hex }} />
      <span className="text-sm text-muted-foreground">{name}</span>
      <span className="text-xs" style={{ color: text }}>{hex}</span>
    </div>
  )
}

function ThemeSwatch({ label, primary, secondary, background, foreground }: ThemeTokens) {
  return (
    <div className="rounded-lg border overflow-hidden text-xs shadow">
      <div className="flex h-6 text-[10px] text-center text-white font-bold">
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: primary }}>Primary</div>
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: secondary }}>Secondary</div>
        <div
          className="flex-1 flex items-center justify-center"
          style={{ backgroundColor: background, color: coreColors.foreground }}
        >
          BG
        </div>
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: foreground }}>FG</div>
      </div>
      <div className="p-2">
        <strong className="block text-sm mb-1">{label}</strong>
        <ul className="space-y-1">
          <li><span className="font-medium">Primary:</span> {primary}</li>
          <li><span className="font-medium">Secondary:</span> {secondary}</li>
          <li><span className="font-medium">Background:</span> {background}</li>
          <li><span className="font-medium">Foreground:</span> {foreground}</li>
        </ul>
      </div>
    </div>
  )
}
