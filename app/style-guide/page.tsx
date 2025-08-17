"use client";

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { coreColors } from "@/lib/design-tokens"

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
      <p className="text-sm text-muted-foreground">
        Toggle the preview to inspect light or dark tokens.
      </p>

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
