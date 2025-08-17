// app/style-guide/page.tsx
import { Card, CardContent } from "@/components/ui/card"

export default function StyleGuidePage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-4xl font-display">Style Guide</h1>

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
