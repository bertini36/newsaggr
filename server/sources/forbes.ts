import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

// Parse date from Forbes URL: /sites/.../YYYY/MM/DD/...
function parseDateFromUrl(url: string): string | undefined {
  const match = url.match(/\/sites\/[^/]+\/(\d{4})\/(\d{2})\/(\d{2})\//)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }
  return undefined
}

export default defineSource(async () => {
  const url = "https://www.forbes.com/"
  const html: any = await myFetch(url)
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  $("a").each((_, el) => {
    const link = $(el)
    const href = link.attr("href")
    const title = link.text().trim()

    if (href && title && title.length > 20 && href.includes("/sites/")) {
      const fullUrl = href.startsWith("http") ? href : `https://www.forbes.com${href}`
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

  // Also try h3 > a if generic link scraping is too noisy or misses things
  $("h3 > a").each((_, el) => {
    const link = $(el)
    const href = link.attr("href")
    const title = link.text().trim()

    if (href && title && title.length > 10) {
      const fullUrl = href.startsWith("http") ? href : `https://www.forbes.com${href}`
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
