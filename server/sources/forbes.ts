import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

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

      if (!news.some(n => n.url === fullUrl)) {
        news.push({
          id: fullUrl,
          title,
          url: fullUrl,
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
      if (!news.some(n => n.url === fullUrl)) {
        news.push({
          id: fullUrl,
          title,
          url: fullUrl,
        })
      }
    }
  })

  return news
})
