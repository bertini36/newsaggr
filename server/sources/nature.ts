import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const baseURL = "https://www.nature.com"
  const newsURL = `${baseURL}/news`
  const html: any = await myFetch(newsURL)
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  // Target article cards/containers on the news page
  $("article, [data-track-action='view article']").each((_, el) => {
    const container = $(el)
    const link = container.find("a[href*='/articles/']").first()
    const href = link.attr("href")
    const title = link.text().trim()

    // Look for date in the container - Nature uses formats like "18 Dec 2025"
    const containerText = container.text()
    const dateMatch = containerText.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i)

    if (href && title && title.length > 20) {
      const url = href.startsWith("http") ? href : `${baseURL}${href}`

      // Avoid duplicates
      if (!news.some(n => n.url === url)) {
        let pubDate: string | undefined
        if (dateMatch) {
          const parsed = new Date(dateMatch[1])
          if (!Number.isNaN(parsed.getTime())) {
            pubDate = parsed.toISOString()
          }
        }

        news.push({
          url,
          title,
          id: url,
          pubDate,
        })
      }
    }
  })

  // Also check for article links not inside article containers
  $("a[href*='/articles/']").each((_, el) => {
    const link = $(el)
    const href = link.attr("href")
    const title = link.text().trim()

    if (href && title && title.length > 20) {
      const url = href.startsWith("http") ? href : `${baseURL}${href}`

      // Avoid duplicates
      if (!news.some(n => n.url === url)) {
        // Try to find date near the link
        const parent = link.parent()
        const parentText = parent.text()
        const dateMatch = parentText.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i)

        let pubDate: string | undefined
        if (dateMatch) {
          const parsed = new Date(dateMatch[1])
          if (!Number.isNaN(parsed.getTime())) {
            pubDate = parsed.toISOString()
          }
        }

        news.push({
          url,
          title,
          id: url,
          pubDate,
        })
      }
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
