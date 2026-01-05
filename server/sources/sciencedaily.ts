import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

// Parse date from ScienceDaily URL: /releases/YYYY/MM/DDHHMMSS.htm
export function parseDateFromUrl(url: string): string | undefined {
  const match = url.match(/\/releases\/(\d{4})\/(\d{2})\/\d{4}(\d{2})\d+\.htm/)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }
  return undefined
}

export default defineSource(async () => {
  const baseURL = "https://www.sciencedaily.com"
  const html: any = await myFetch(baseURL)
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  // ScienceDaily uses /releases/YYYY/MM/ slug structure
  $("a[href*='/releases/']").each((_, el) => {
    const link = $(el)
    const href = link.attr("href")
    const title = link.text().trim()

    if (href && title && title.length > 20) {
      const fullUrl = href.startsWith("http") ? href : `${baseURL}${href}`
      const pubDate = parseDateFromUrl(fullUrl)

      if (!news.some(n => n.url === fullUrl)) {
        news.push({
          id: fullUrl,
          title,
          url: fullUrl,
          pubDate,
        })
      }
    }
  })

  // Sort by pubDate (newest first), items without dates go to the end
  news.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return news
})
