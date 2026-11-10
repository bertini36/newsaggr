import { Interval } from "./consts"

/** Whether a source requested at `requestedAt` is due for another request. A source never requested is not stale: its card is still loading it. */
export function isStale(requestedAt: number | undefined, now: number, maxAge = Interval) {
  return requestedAt !== undefined && now - requestedAt >= maxAge
}
