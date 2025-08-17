export interface ThemeTokens {
  label: string
  primary: string
  secondary: string
  background: string
  foreground: string
}

export const coreColors = {
  primary: "#508C7E",
  secondary: "#D3EDE6",
  background: "#F9F9F9",
  foreground: "#111827",
  muted: "#9CA3AF",
}

export const seasonalLight: ThemeTokens[] = [
  {
    label: "Spring",
    primary: "#6CA995",
    secondary: "#E2F7F2",
    background: "#FDFDFD",
    foreground: "#1F2937",
  },
  {
    label: "Summer (Default)",
    primary: "#508C7E",
    secondary: "#D3EDE6",
    background: "#F9F9F9",
    foreground: "#111827",
  },
  {
    label: "Autumn",
    primary: "#C38154",
    secondary: "#F5E7DA",
    background: "#FBFAF8",
    foreground: "#3B2F2F",
  },
  {
    label: "Winter",
    primary: "#6B7280",
    secondary: "#E0E7FF",
    background: "#F8FAFC",
    foreground: "#1E293B",
  },
]

export const seasonalDark: ThemeTokens[] = [
  {
    label: "Default",
    primary: "#7BD7C2",
    secondary: "#1B2A2B",
    background: "#0B0F10",
    foreground: "#E5E7EB",
  },
  {
    label: "Winter",
    primary: "#6C82B3",
    secondary: "#1C2431",
    background: "#0A101A",
    foreground: "#E2E8F0",
  },
  {
    label: "Autumn",
    primary: "#D69F7E",
    secondary: "#2E1E1E",
    background: "#1A1410",
    foreground: "#F3F4F6",
  },
]

