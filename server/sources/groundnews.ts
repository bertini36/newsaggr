import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const baseURL = "https://ground.news"
  const url = `${baseURL}/daily-briefing`
  const html: any = await myFetch(url)
  const $ = cheerio.load(html)
  const $main = $("a[id^='story-briefing-']")
  const news: NewsItem[] = []
  $main.each((_, el) => {
    const href = $(el).attr("href")
    // Headline selector: .text-24
    const title = $(el).find(".text-24").text()
    const id = $(el).attr("id")
    // Extract publication date from time element's dateTime attribute
    const timeEl = $(el).find("time[dateTime]")
    const dateTimeAttr = timeEl.attr("dateTime") || timeEl.attr("datetime")
    const pubDate = dateTimeAttr ? new Date(dateTimeAttr).toISOString() : undefined

    if (href && id && title) {
      news.push({
        url: `${baseURL}${href}`,
        title: title.trim(),
        id,
        pubDate,
      })
    }
  })

  // Sort by pubDate (newest first)
  news.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return news
})
