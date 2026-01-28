import { useEffect } from "react"
import { AVAILABLE_FONTS, DEFAULT_FONT_ID, type FontOption, getFontFamily } from "@shared/fonts"
import { fontAtom } from "~/atoms/fontAtom"

export function useFont() {
  const [fontId, setFontId] = useAtom(fontAtom)

  // Apply font to document body whenever fontId changes
  useEffect(() => {
    const fontFamily = getFontFamily(fontId || DEFAULT_FONT_ID)
    document.documentElement.style.setProperty("--reading-font", fontFamily)
  }, [fontId])

  const setFont = useCallback((id: string) => {
    setFontId(id)
  }, [setFontId])

  return {
    fontId: fontId || DEFAULT_FONT_ID,
    setFont,
    fonts: AVAILABLE_FONTS as FontOption[],
  }
}
