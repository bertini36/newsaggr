import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"
import { myFetch } from "../utils/fetch"

export default defineSource(async () => {
  const url = "https://edition.cnn.com/"
  const html = await myFetch(url, { responseType: "text" })
  const $ = cheerio.load(html)

  const news: NewsItem[] = []
  const seenUrls = new Set<string>()

  $(".container__item").each((_, element) => {
    const headline = $(element).find(".container__headline-text").text().trim()
    const relativeLink = $(element).find("a.container__link").attr("href")

    if (headline && relativeLink) {
      const fullUrl = relativeLink.startsWith("http") ? relativeLink : `https://edition.cnn.com${relativeLink}`

      if (!seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl)

        // Try to parse date from URL: /2024/12/25/world/...
        const dateMatch = fullUrl.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//)
        let pubDate: string | undefined
        if (dateMatch) {
          pubDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
        }

        news.push({
          title: headline,
          url: fullUrl,
          id: fullUrl,
          pubDate,
        })
      }
    }
  })

  if (news.length === 0) {
    throw new Error("Cannot fetch CNN data from web scraping")
  }

  // Sort by pubDate (newest first), items without dates go to the end
  news.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return news
})
