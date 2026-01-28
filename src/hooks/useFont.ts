import { useCallback, useEffect } from "react"
import { AVAILABLE_FONTS, DEFAULT_FONT_ID, type FontOption, getFontFamily } from "@shared/fonts"
import { primitiveMetadataAtom } from "~/atoms/primitiveMetadataAtom"

export function useFont() {
  const [metadata, setMetadata] = useAtom(primitiveMetadataAtom)

  const fontId = metadata.preferences?.fontId || DEFAULT_FONT_ID

  // Apply font to document body whenever fontId changes
  useEffect(() => {
    const fontFamily = getFontFamily(fontId)
    document.documentElement.style.setProperty("--reading-font", fontFamily)
  }, [fontId])

  const setFont = useCallback((id: string) => {
    setMetadata(prev => ({
      ...prev,
      action: "manual",
      updatedTime: Date.now(),
      preferences: {
        ...prev.preferences,
        fontId: id,
      },
    }))
  }, [setMetadata])

  return {
    fontId,
    setFont,
    fonts: AVAILABLE_FONTS as FontOption[],
  }
}
