import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://techcrunch.com/category/artificial-intelligence/"
  const response = await fetch(url)
  const html = await response.text()
  const $ = cheerio.load(html)

  const news: NewsItem[] = []

  $(".loop-card").each((_, element) => {
    const titleElement = $(element).find("h3.loop-card__title a")
    const title = titleElement.text().trim()
    const link = titleElement.attr("href")
    const timeElement = $(element).find("time.loop-card__time")
    const pubDate = timeElement.attr("datetime")

    if (title && link) {
      news.push({
        title,
        url: link,
        id: link,
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
    // Note: The comparison logic above puts undefined dates at the end.
    // For ISO strings, we can compare directly or use getTime().
    // b - a gives descending order (newest first).
  })

  return news
})
