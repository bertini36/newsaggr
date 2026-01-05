import { describe, expect, it } from "vitest"
import { parseDateFromUrl } from "../server/sources/sciencedaily"

describe("scienceDaily Date Parsing", () => {
  it("should correctly parse date from URL", () => {
    // URL from the homepage investigation
    const url = "https://www.sciencedaily.com/releases/2026/01/260103155032.htm"
    const date = parseDateFromUrl(url)
    expect(date).toBe("2026-01-03")
  })

  it("should correctly parse another date from URL", () => {
    const url = "https://www.sciencedaily.com/releases/2025/12/251228020018.htm"
    const date = parseDateFromUrl(url)
    expect(date).toBe("2025-12-28")
  })

  it("should return undefined for invalid URLs", () => {
    expect(parseDateFromUrl("https://www.sciencedaily.com/releases/invalid.htm")).toBeUndefined()
  })
})
