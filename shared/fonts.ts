export interface FontOption {
  id: string
  name: string
  family: string
  category: "serif" | "sans-serif"
}

export const AVAILABLE_FONTS: FontOption[] = [
  { id: "roboto-flex", name: "Roboto Flex", family: "'Roboto Flex', sans-serif", category: "sans-serif" },
  { id: "merriweather", name: "Merriweather", family: "'Merriweather', serif", category: "serif" },
  { id: "source-sans-3", name: "Source Sans 3", family: "'Source Sans 3', sans-serif", category: "sans-serif" },
  { id: "lora", name: "Lora", family: "'Lora', serif", category: "serif" },
  { id: "inter", name: "Inter", family: "'Inter', sans-serif", category: "sans-serif" },
  { id: "pt-serif", name: "PT Serif", family: "'PT Serif', serif", category: "serif" },
  { id: "literata", name: "Literata", family: "'Literata', serif", category: "serif" },
  { id: "ibm-plex-sans", name: "IBM Plex Sans", family: "'IBM Plex Sans', sans-serif", category: "sans-serif" },
  { id: "crimson-text", name: "Crimson Text", family: "'Crimson Text', serif", category: "serif" },
  { id: "work-sans", name: "Work Sans", family: "'Work Sans', sans-serif", category: "sans-serif" },
]

export const DEFAULT_FONT_ID = "roboto-flex"

export function getFontById(id: string): FontOption | undefined {
  return AVAILABLE_FONTS.find(font => font.id === id)
}

export function getFontFamily(id: string): string {
  const font = getFontById(id)
  return font ? font.family : AVAILABLE_FONTS[0].family
}
