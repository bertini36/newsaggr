import { describe, expect, it } from "vitest"
import { AVAILABLE_FONTS, DEFAULT_FONT_ID, getFontById, getFontFamily } from "../shared/fonts"

describe("font Configuration Tests", () => {
  describe("font Constants", () => {
    it("should have exactly 10 fonts", () => {
      expect(AVAILABLE_FONTS.length).toBe(10)
    })

    it("should have Roboto Flex as the default font", () => {
      expect(DEFAULT_FONT_ID).toBe("roboto-flex")
    })

    it("should have valid font objects with required properties", () => {
      for (const font of AVAILABLE_FONTS) {
        expect(font).toHaveProperty("id")
        expect(font).toHaveProperty("name")
        expect(font).toHaveProperty("family")
        expect(font).toHaveProperty("category")
        expect(typeof font.id).toBe("string")
        expect(typeof font.name).toBe("string")
        expect(typeof font.family).toBe("string")
        expect(["serif", "sans-serif"]).toContain(font.category)
      }
    })

    it("should have unique font IDs", () => {
      const ids = AVAILABLE_FONTS.map(f => f.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it("should have a mix of serif and sans-serif fonts", () => {
      const categories = AVAILABLE_FONTS.map(f => f.category)
      expect(categories).toContain("serif")
      expect(categories).toContain("sans-serif")
    })
  })

  describe("getFontById", () => {
    it("should return font object for valid ID", () => {
      const font = getFontById("roboto-flex")
      expect(font).toBeDefined()
      expect(font?.name).toBe("Roboto Flex")
    })

    it("should return undefined for invalid ID", () => {
      const font = getFontById("nonexistent-font")
      expect(font).toBeUndefined()
    })

    it("should find all available fonts by ID", () => {
      for (const font of AVAILABLE_FONTS) {
        const found = getFontById(font.id)
        expect(found).toBeDefined()
        expect(found?.id).toBe(font.id)
      }
    })
  })

  describe("getFontFamily", () => {
    it("should return font family for valid ID", () => {
      const family = getFontFamily("roboto-flex")
      expect(family).toBe("'Roboto Flex', sans-serif")
    })

    it("should return default font family for invalid ID", () => {
      const family = getFontFamily("nonexistent-font")
      expect(family).toBe(AVAILABLE_FONTS[0].family)
    })

    it("should return correct family for each font", () => {
      for (const font of AVAILABLE_FONTS) {
        const family = getFontFamily(font.id)
        expect(family).toBe(font.family)
      }
    })
  })
})
