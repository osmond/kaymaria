"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function StyleGuidePage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  return (
    <div className="p-6 space-y-8 min-h-screen transition-colors duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-display">Style Guide</h1>
        {mounted && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}
      </div>

      {/* Core Colors */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Core Tokens</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ColorSwatch name="Primary" hex="#508C7E" />
            <ColorSwatch name="Secondary" hex="#D3EDE6" />
            <ColorSwatch name="Background" hex="#F9F9F9" text="black" />
            <ColorSwatch name="Foreground" hex="#111827" />
            <ColorSwatch name="Muted" hex="#9CA3AF" />
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Palettes */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">Seasonal Themes</h2>

          {/* Light Mode */}
          <div>
            <h3 className="text-md font-medium mb-2">Light Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ThemeSwatch label="Spring" primary="#6CA995" secondary="#E2F7F2" background="#FDFDFD" foreground="#1F2937" />
              <ThemeSwatch label="Summer (Default)" primary="#508C7E" secondary="#D3EDE6" background="#F9F9F9" foreground="#111827" />
              <ThemeSwatch label="Autumn" primary="#C38154" secondary="#F5E7DA" background="#FBFAF8" foreground="#3B2F2F" />
              <ThemeSwatch label="Winter" primary="#6B7280" secondary="#E0E7FF" background="#F8FAFC" foreground="#1E293B" />
            </div>
          </div>

          {/* Dark Mode */}
          <div>
            <h3 className="text-md font-medium mt-6 mb-2">Dark Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <ThemeSwatch label="Default" primary="#7BD7C2" secondary="#1B2A2B" background="#0B0F10" foreground="#E5E7EB" />
              <ThemeSwatch label="Winter" primary="#6C82B3" secondary="#1C2431" background="#0A101A" foreground="#E2E8F0" />
              <ThemeSwatch label="Autumn" primary="#D69F7E" secondary="#2E1E1E" background="#1A1410" foreground="#F3F4F6" />
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

function ThemeSwatch({ label, primary, secondary, background, foreground }: { label: string, primary: string, secondary: string, background: string, foreground: string }) {
  return (
    <div className="rounded-lg border overflow-hidden text-xs shadow">
      <div className="flex h-6">
        <div className="flex-1" style={{ backgroundColor: primary }} />
        <div className="flex-1" style={{ backgroundColor: secondary }} />
        <div className="flex-1" style={{ backgroundColor: background }} />
        <div className="flex-1" style={{ backgroundColor: foreground }} />
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
