import { describe, expect, it } from "vitest"
import MockDate from "mockdate"
import dayjs from "dayjs/esm"

describe("parseRelativeDate", () => {
  Object.assign(process.env, { TZ: "UTC" })
  const second = 1000
  const minute = 60 * second
  const hour = 60 * minute
  const day = 24 * hour
  const date = new Date()

  // Fixed time mock
  MockDate.set(date)

  it("10 seconds ago", () => {
    expect(+new Date(parseRelativeDate("10 seconds ago"))).toBe(+date - 10 * second)
  })

  it("10 minutes ago", () => {
    expect(+new Date(parseRelativeDate("10 minutes ago"))).toBe(+date - 10 * minute)
  })

  it("a minute ago", () => {
    expect(+new Date(parseRelativeDate("a minute ago"))).toBe(+date - 1 * minute)
  })

  it("10 mins ago", () => {
    expect(+new Date(parseRelativeDate("10 mins ago"))).toBe(+date - 10 * minute)
  })

  it("in 10 minutes", () => {
    expect(+new Date(parseRelativeDate("in 10 minutes"))).toBe(+date + 10 * minute)
  })

  it("in an hour", () => {
    expect(+new Date(parseRelativeDate("in an hour"))).toBe(+date + 1 * hour)
  })

  it("10 hours ago", () => {
    expect(+new Date(parseRelativeDate("10 hours ago"))).toBe(+date - 10 * hour)
  })

  it("10 days ago", () => {
    expect(+new Date(parseRelativeDate("10 days ago"))).toBe(+date - 10 * day)
  })

  it("1 month ago", () => {
    expect(+new Date(parseRelativeDate("1 month ago"))).toBe(+dayjs().subtract(1, "month").toDate())
  })

  it("1 year ago", () => {
    expect(+new Date(parseRelativeDate("1 year ago"))).toBe(+dayjs().subtract(1, "year").toDate())
  })

  it("1 year 1 month ago", () => {
    expect(+new Date(parseRelativeDate("1 year 1 month ago"))).toBe(+dayjs().subtract(1, "year").subtract(1, "month").toDate())
  })

  it("1 day 1 hour ago", () => {
    expect(+new Date(parseRelativeDate("1 day 1 hour ago"))).toBe(+date - 1 * day - 1 * hour)
  })

  it("1 hour 1 minute 1 second ago", () => {
    expect(+new Date(parseRelativeDate("1 hour 1 minute 1 second ago"))).toBe(+date - 1 * hour - 1 * minute - 1 * second)
  })

  it("1d 1h 1m 1s ago", () => {
    expect(+new Date(parseRelativeDate("1d 1h 1m 1s ago"))).toBe(+date - 1 * day - 1 * hour - 1 * minute - 1 * second)
  })

  it("1 hour 1 minute 1 second later", () => {
    expect(+new Date(parseRelativeDate("1 hour 1 minute 1 second later"))).toBe(+date + 1 * hour + 1 * minute + 1 * second)
  })

  it("today", () => {
    expect(+new Date(parseRelativeDate("today"))).toBe(+dayjs().startOf("day").toDate())
  })

  it("today H:m", () => {
    expect(+new Date(parseRelativeDate("Today 08:00"))).toBe(+dayjs().startOf("day").add(8, "hour").toDate())
  })

  it("today, h:m a", () => {
    expect(+new Date(parseRelativeDate("Today, 8:00 pm"))).toBe(+dayjs().startOf("day").add(20, "hour").toDate())
  })

  it("tDA H:m:s", () => {
    expect(+new Date(parseRelativeDate("TDA 08:00:00"))).toBe(+dayjs().startOf("day").add(8, "hour").toDate())
  })

  it("yesterday 20:00", () => {
    expect(+new Date(parseRelativeDate("yesterday 20:00"))).toBe(+dayjs().subtract(1, "day").startOf("day").add(20, "hour").toDate())
  })

  it("day before yesterday 20:00", () => {
    expect(+new Date(parseRelativeDate("the day before yesterday 20:00"))).toBe(+dayjs().subtract(2, "day").startOf("day").add(20, "hour").toDate())
  })

  it("tomorrow 20:00", () => {
    expect(+new Date(parseRelativeDate("tomorrow 20:00"))).toBe(+dayjs().add(1, "day").startOf("day").add(20, "hour").toDate())
  })

  it("monday h:m", () => {
    const expected = dayjs().isSameOrBefore(dayjs().weekday(1)) ? dayjs().weekday(1).subtract(1, "week") : dayjs().weekday(1)
    expect(+new Date(parseRelativeDate("monday 8:00"))).toBe(+expected.startOf("day").add(8, "hour").toDate())
  })

  it("sunday h:m", () => {
    const expected = dayjs().isSameOrBefore(dayjs().weekday(7)) ? dayjs().weekday(7).subtract(1, "week") : dayjs().weekday(7)
    expect(+new Date(parseRelativeDate("sunday 8:00"))).toBe(+expected.startOf("day").add(8, "hour").toDate())
  })

  it("invalid", () => {
    expect(parseRelativeDate("RSSHub")).toBe("RSSHub")
  })
})

describe("transform Beijing time to UTC in different timezone", () => {
  const a = "2024/10/3 12:26:16"
  const b = 1727929576000
  it("in UTC", () => {
    Object.assign(process.env, { TZ: "UTC" })
    const date = tranformToUTC(a)
    expect(date).toBe(b)
  })

  it("in Beijing", () => {
    Object.assign(process.env, { TZ: "Asia/Shanghai" })
    const date = tranformToUTC(a)
    expect(date).toBe(b)
  })

  it("in New York", () => {
    Object.assign(process.env, { TZ: "America/New_York" })
    const date = tranformToUTC(a)
    expect(date).toBe(b)
  })
})
