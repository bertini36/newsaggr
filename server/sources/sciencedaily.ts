import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

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
