import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://elpais.com/espana/"
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch El País: ${response.statusText}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  const news: NewsItem[] = []
  const seenUrls = new Set<string>()

  $("article").each((_, element) => {
    const titleElement = $(element).find("h2 a")
    const title = titleElement.text().trim()
    const relativeUrl = titleElement.attr("href")

    // Convert relative URL to absolute
    let itemUrl = relativeUrl
    if (relativeUrl && !relativeUrl.startsWith("http")) {
      itemUrl = new URL(relativeUrl, "https://elpais.com").href
    }

    const timeElement = $(element).find("time")
    const pubDateTime = timeElement.attr("datetime")
    const pubDateText = timeElement.text().trim()

    // Prefer datetime attribute, fallback to text
    const pubDate = pubDateTime || pubDateText

    if (title && itemUrl) {
      if (!seenUrls.has(itemUrl)) {
        seenUrls.add(itemUrl)
        news.push({
          title,
          url: itemUrl,
          id: itemUrl,
          pubDate,
        })
      }
    }
  })

  if (news.length === 0) {
    throw new Error("Cannot fetch El País data from web scraping")
  }

  // Sort by pubDate (newest first)
  // The site usually returns items in order, but we explicitly sort as requested.
  news.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1

    const timeA = new Date(a.pubDate).getTime()
    const timeB = new Date(b.pubDate).getTime()

    // Sort newest to oldest
    return timeB - timeA
  })

  return news
})
