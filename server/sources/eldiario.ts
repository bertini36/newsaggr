import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://www.eldiario.es/politica/"
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch El Diario: ${response.statusText}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  const news: NewsItem[] = []
  const seenUrls = new Set<string>()

  // Strategy: El Diario groups articles in blocks, often with a date header nearby.
  // We'll iterate through all article titles and try to find the associated date.
  $("h2.ni-title").each((_, element) => {
    const titleElement = $(element).find("a")
    const title = titleElement.text().trim()
    const relativeUrl = titleElement.attr("href")

    // Convert relative URL to absolute
    let itemUrl = relativeUrl
    if (relativeUrl && !relativeUrl.startsWith("http")) {
      itemUrl = new URL(relativeUrl, "https://www.eldiario.es").href
    }

    let pubDate: string | undefined

    // 1. Try finding date inside the closest article container
    const article = $(element).closest("article")
    if (article.length) {
      const timeElement = article.find("time")
      pubDate = timeElement.attr("datetime") || timeElement.text().trim()
    }

    // 2. If no individual date, look for a section date.
    // The structure seems to be:
    // .partner-wrapper
    //   .first-col > .date-post > time  <-- The date for this block
    //   .second-col > ... > article     <-- The articles
    if (!pubDate) {
      // Traverse up to find the partner-wrapper
      const wrapper = $(element).closest(".partner-wrapper")
      if (wrapper.length) {
        const dateElement = wrapper.find(".first-col .date-post time")
        pubDate = dateElement.attr("datetime") || dateElement.text().trim()
      }
    }

    if (title && itemUrl) {
      if (!seenUrls.has(itemUrl)) {
        seenUrls.add(itemUrl)
        news.push({
          id: itemUrl,
          title,
          url: itemUrl,
          pubDate: pubDate || undefined,
        })
      }
    }
  })

  if (news.length === 0) {
    throw new Error("Cannot fetch El Diario data from web scraping")
  }

  // Sort by pubDate (newest first)
  news.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1

    const timeA = new Date(a.pubDate).getTime()
    const timeB = new Date(b.pubDate).getTime()

    // Handle potential invalid dates
    if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0
    if (Number.isNaN(timeA)) return 1
    if (Number.isNaN(timeB)) return -1

    return timeB - timeA
  })

  return news
})
