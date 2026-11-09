import { describe, expect, it } from "vitest"
import { getPageIndex } from "../shared/pager"

describe("getPageIndex", () => {
  it("returns 0 at the start", () => {
    expect(getPageIndex(0, 412, 5)).toBe(0)
  })

  it("rounds to the nearest page while a swipe is in flight", () => {
    expect(getPageIndex(200, 412, 5)).toBe(0)
    expect(getPageIndex(210, 412, 5)).toBe(1)
    expect(getPageIndex(412 * 2 + 100, 412, 5)).toBe(2)
  })

  it("clamps overscroll to the first and last page", () => {
    expect(getPageIndex(-80, 412, 5)).toBe(0)
    expect(getPageIndex(412 * 9, 412, 5)).toBe(4)
  })

  it("returns 0 when the pager has no width or no pages", () => {
    expect(getPageIndex(300, 0, 5)).toBe(0)
    expect(getPageIndex(300, 412, 0)).toBe(0)
  })
})
