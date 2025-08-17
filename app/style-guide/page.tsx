import { Card, CardContent } from "@/components/ui/card"

export default function StyleGuidePage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-4xl font-display">Style Guide</h1>

      {/* Main Brand Colors */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Colors</h2>
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
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Seasonal Theme Palette</h2>

          {seasonalThemes.map((theme) => (
            <div key={theme.name} className="mb-6">
              <h3 className="text-lg font-medium mb-2">{theme.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <ColorSwatch name="Primary" hex={theme.primary} />
                <ColorSwatch name="Secondary" hex={theme.secondary} />
                <ColorSwatch name="Background" hex={theme.background} text="black" />
                <ColorSwatch name="Foreground" hex={theme.foreground} />
                <ColorSwatch name="Muted" hex={theme.muted} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function ColorSwatch({
  name,
  hex,
  text = "white",
}: {
  name: string
  hex: string
  text?: string
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div
        className="w-full h-16 rounded-lg border"
        style={{ backgroundColor: hex }}
      />
      <span className="text-sm text-muted-foreground">{name}</span>
      <span className="text-xs" style={{ color: text }}>
        {hex}
      </span>
    </div>
  )
}

const seasonalThemes = [
  {
    name: "Spring (Light)",
    primary: "#6CA995",
    secondary: "#E2F7F2",
    background: "#FDFDFD",
    foreground: "#1F2937",
    muted: "#9CA3AF",
  },
  {
    name: "Summer (Light)",
    primary: "#508C7E",
    secondary: "#D3EDE6",
    background: "#F9F9F9",
    foreground: "#111827",
    muted: "#9CA3AF",
  },
  {
    name: "Autumn (Light)",
    primary: "#C38154",
    secondary: "#F5E7DA",
    background: "#FBFAF8",
    foreground: "#3B2F2F",
    muted: "#A0A29E",
  },
  {
    name: "Winter (Light)",
    primary: "#6B7280",
    secondary: "#E0E7FF",
    background: "#F8FAFC",
    foreground: "#1E293B",
    muted: "#94A3B8",
  },
  {
    name: "Default (Dark)",
    primary: "#7BD7C2",
    secondary: "#1B2A2B",
    background: "#0B0F10",
    foreground: "#E5E7EB",
    muted: "#6B7280",
  },
  {
    name: "Autumn (Dark)",
    primary: "#D69F7E",
    secondary: "#2E1E1E",
    background: "#1A1410",
    foreground: "#F3F4F6",
    muted: "#A3A3A3",
  },
  {
    name: "Winter (Dark)",
    primary: "#6C82B3",
    secondary: "#1C2431",
    background: "#0A101A",
    foreground: "#E2E8F0",
    muted: "#94A3B8",
  },
]
