import { describe, expect, it } from "vitest"
import { isStale } from "../shared/freshness"

const MINUTE = 60 * 1000

describe("isStale", () => {
  it("is fresh right after a request", () => {
    expect(isStale(1000, 1000, 10 * MINUTE)).toBe(false)
  })

  it("is fresh just under the max age", () => {
    expect(isStale(0, 10 * MINUTE - 1, 10 * MINUTE)).toBe(false)
  })

  it("is stale from the max age on", () => {
    expect(isStale(0, 10 * MINUTE, 10 * MINUTE)).toBe(true)
    expect(isStale(0, 60 * MINUTE, 10 * MINUTE)).toBe(true)
  })

  it("is never stale before the first request", () => {
    expect(isStale(undefined, 60 * MINUTE, 10 * MINUTE)).toBe(false)
  })

  it("defaults to the 10 minute source interval", () => {
    expect(isStale(0, 9 * MINUTE)).toBe(false)
    expect(isStale(0, 10 * MINUTE)).toBe(true)
  })
})
