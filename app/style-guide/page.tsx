import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function StyleGuidePreviewPage() {
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light")

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-display">Style Guide</h1>
        <Button
          variant="outline"
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
            <ColorSwatch name="Primary" hex="#508C7E" />
            <ColorSwatch name="Secondary" hex="#D3EDE6" />
            <ColorSwatch name="Background" hex="#F9F9F9" text="black" />
            <ColorSwatch name="Foreground" hex="#111827" />
            <ColorSwatch name="Muted" hex="#9CA3AF" />
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

function ThemeSwatch({ label, primary, secondary, background, foreground }: ThemeProps) {
  return (
    <div className="rounded-lg border overflow-hidden text-xs shadow">
      <div className="flex h-6 text-[10px] text-center text-white font-bold">
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: primary }}>Primary</div>
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: secondary }}>Secondary</div>
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: background, color: '#000' }}>BG</div>
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

interface ThemeProps {
  label: string
  primary: string
  secondary: string
  background: string
  foreground: string
}

const seasonalLight: ThemeProps[] = [
  {
    label: "Spring",
    primary: "#6CA995",
    secondary: "#E2F7F2",
    background: "#FDFDFD",
    foreground: "#1F2937"
  },
  {
    label: "Summer (Default)",
    primary: "#508C7E",
    secondary: "#D3EDE6",
    background: "#F9F9F9",
    foreground: "#111827"
  },
  {
    label: "Autumn",
    primary: "#C38154",
    secondary: "#F5E7DA",
    background: "#FBFAF8",
    foreground: "#3B2F2F"
  },
  {
    label: "Winter",
    primary: "#6B7280",
    secondary: "#E0E7FF",
    background: "#F8FAFC",
    foreground: "#1E293B"
  },
]

const seasonalDark: ThemeProps[] = [
  {
    label: "Default",
    primary: "#7BD7C2",
    secondary: "#1B2A2B",
    background: "#0B0F10",
    foreground: "#E5E7EB"
  },
  {
    label: "Winter",
    primary: "#6C82B3",
    secondary: "#1C2431",
    background: "#0A101A",
    foreground: "#E2E8F0"
  },
  {
    label: "Autumn",
    primary: "#D69F7E",
    secondary: "#2E1E1E",
    background: "#1A1410",
    foreground: "#F3F4F6"
  }
]
