import dayjs from "dayjs/esm"
import utcPlugin from "dayjs/esm/plugin/utc"
import timezonePlugin from "dayjs/esm/plugin/timezone"
import customParseFormat from "dayjs/esm/plugin/customParseFormat"
import duration from "dayjs/esm/plugin/duration"
import isSameOrBefore from "dayjs/esm/plugin/isSameOrBefore"
import weekday from "dayjs/esm/plugin/weekday"

dayjs.extend(utcPlugin)
dayjs.extend(timezonePlugin)
dayjs.extend(customParseFormat)
dayjs.extend(duration)
dayjs.extend(isSameOrBefore)
dayjs.extend(weekday)

/**
 * Convert time from any timezone (without timezone info) to UTC
 */
export function tranformToUTC(date: string, format?: string, timezone: string = "Asia/Shanghai"): number {
  if (!format) return dayjs.tz(date, timezone).valueOf()
  return dayjs.tz(date, format, timezone).valueOf()
}

// dayjs() returns 0 in Cloudflare, so it cannot be placed at the top level
function words() {
  return [
    {
      startAt: dayjs(),
      regExp: /^to?day?(.*)/,
    },
    {
      startAt: dayjs().subtract(1, "days"),
      regExp: /^y(?:ester)?day?(.*)/,
    },
    {
      startAt: dayjs().subtract(2, "days"),
      regExp: /^(?:the)?d(?:ay)?b(?:eforeyesterda)?y(.*)/,
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(1)) ? dayjs().weekday(1).subtract(1, "week") : dayjs().weekday(1),
      regExp: /^mon(?:day)?(.*)/,
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(2)) ? dayjs().weekday(2).subtract(1, "week") : dayjs().weekday(2),
      regExp: /^tue(?:sday)?(.*)/,
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(3)) ? dayjs().weekday(3).subtract(1, "week") : dayjs().weekday(3),
      regExp: /^wed(?:nesday)?(.*)/,
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(4)) ? dayjs().weekday(4).subtract(1, "week") : dayjs().weekday(4),
      regExp: /^thu(?:rsday)?(.*)/,
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(5)) ? dayjs().weekday(5).subtract(1, "week") : dayjs().weekday(5),
      regExp: /^fri(?:day)?(.*)/,
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(6)) ? dayjs().weekday(6).subtract(1, "week") : dayjs().weekday(6),
      regExp: /^sat(?:urday)?(.*)/,
    },
    {
      startAt: dayjs().isSameOrBefore(dayjs().weekday(7)) ? dayjs().weekday(7).subtract(1, "week") : dayjs().weekday(7),
      regExp: /^sun(?:day)?(.*)/,
    },
    {
      startAt: dayjs().add(1, "days"),
      regExp: /^tomorrow(.*)/,
    },
    {
      startAt: dayjs().add(2, "days"),
      regExp: /^(?:the)?d(?:ay)?a(?:fter)?t(?:omrrow)?(.*)/,
    },
  ]
}

const patterns = [
  {
    unit: "years",
    regExp: /(\d+)y(?:ea)?rs?/,
  },
  {
    unit: "months",
    regExp: /(\d+)months?/,
  },
  {
    unit: "weeks",
    regExp: /(\d+)weeks?/,
  },
  {
    unit: "days",
    regExp: /(\d+)d(?:ay)?s?/,
  },
  {
    unit: "hours",
    regExp: /(\d+)h(?:(?:ou)?r)?s?/,
  },
  {
    unit: "minutes",
    regExp: /(\d+)m(?:in(?:ute)?)?s?/,
  },
  {
    unit: "seconds",
    regExp: /(\d+)s(?:ec(?:ond)?)?s?/,
  },
]

const patternSize = Object.keys(patterns).length

/**
 * Preprocess date string
 * @param {string} date Raw date string
 */
function toDate(date: string) {
  return date
    .toLowerCase()
    .replace(/(^an?\s)|(\san?\s)/g, "1") // Replace `a` and `an` with `1`
    .replace(/a few/g, "3") // Treat `a few seconds ago` as `3 seconds ago`
    .replace(/[\s,]/g, "")
} // Remove all spaces and commas

/**
 * Convert `['\d+h', ..., '\d+s']` to `{ hours: \d+, ..., seconds: \d+ }`
 * Used to describe duration
 * @param {Array.<string>} matches All matching results
 */
function toDurations(matches: string[]) {
  const durations: Record<string, string> = {}

  let p = 0
  for (const m of matches) {
    for (; p <= patternSize; p++) {
      const match = patterns[p].regExp.exec(m)
      if (match) {
        durations[patterns[p].unit] = match[1]
        break
      }
    }
  }
  return durations
}

export const parseDate = (date: string | number, ...options: any) => dayjs(date, ...options).toDate()

export function parseRelativeDate(date: string, timezone: string = "UTC") {
  if (date.toLowerCase() === "just now") return new Date()
  // Preprocess date string date

  const theDate = toDate(date)

  // Split `\d+ years \d+ months ... \d+ seconds ago` into `['\d+ years', ..., '\d+ seconds ago']`

  const matches = theDate.match(/\D*\d+(?![:\-/]|(a|p)m)\D+/g)
  const offset = dayjs.duration({ hours: (dayjs().tz(timezone).utcOffset() - dayjs().utcOffset()) / 60 })

  if (matches) {
    // Get the last time unit, e.g., `\d+ seconds ago`

    const lastMatch = matches.pop()

    if (lastMatch) {
      // If the last time unit contains tags like `ago`, subtract the corresponding duration
      // e.g., `1 min 10 seconds ago`

      const beforeMatches = /(.*)ago$/.exec(lastMatch)
      if (beforeMatches) {
        matches.push(beforeMatches[1])
        // duration plugin has a bug where it doesn't handle weeks in subtract. Using ms calls the default method.
        return dayjs().subtract(dayjs.duration(toDurations(matches))).toDate()
      }

      // If the last time unit contains tags like `later`, `after`, or starts with `in`, add the corresponding duration
      // e.g., `1 min 10 seconds later`

      const afterMatches = /(?:^in(.*)|(.*)(?:later|after))$/.exec(lastMatch)
      if (afterMatches) {
        matches.push(afterMatches[1] ?? afterMatches[2])
        return dayjs()
          .add(dayjs.duration(toDurations(matches)))
          .toDate()
      }

      // Handle special words like `today`, `yesterday`
      // e.g., `today 01:10`

      matches.push(lastMatch)
    }
    const firstMatch = matches.shift()

    if (firstMatch) {
      for (const w of words()) {
        const wordMatches = w.regExp.exec(firstMatch)
        if (wordMatches) {
          matches.unshift(wordMatches[1])

          // Start from zero o'clock of the special day, then add the corresponding duration

          return dayjs.tz(w.startAt
            .set("hour", 0)
            .set("minute", 0)
            .set("second", 0)
            .set("millisecond", 0)
            .add(dayjs.duration(toDurations(matches)))
            .add(offset), timezone)
            .toDate()
        }
      }
    }
  } else {
    // If the date string doesn't match any patterns, assume it is `special word + standard time format`
    // e.g., if today is `2022-03-22`, then `today 20:00` => `2022-03-22 20:00`

    for (const w of words()) {
      const wordMatches = w.regExp.exec(theDate)
      if (wordMatches) {
        // The default parser of dayjs() can parse '8:00 pm' but not '8:00pm'
        // so we need to insert a space in between
        return dayjs.tz(`${w.startAt.add(offset).format("YYYY-MM-DD")} ${/a|pm$/.test(wordMatches[1]) ? wordMatches[1].replace(/a|pm/, " $&") : wordMatches[1]}`, timezone).toDate()
      }
    }
  }

  return date
}
