import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const baseURL = "https://www.nature.com"
  const newsURL = `${baseURL}/news`
  const html: any = await myFetch(newsURL)
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  // Target article links on the news page
  $("a[href*='/articles/']").each((_, el) => {
    const link = $(el)
    const href = link.attr("href")
    const title = link.text().trim()

    // Only include links with substantial titles (not just icons or short text)
    if (href && title && title.length > 20) {
      const url = href.startsWith("http") ? href : `${baseURL}${href}`

      // Avoid duplicates
      if (!news.some(n => n.url === url)) {
        news.push({
          url,
          title,
          id: url,
        })
      }
    }
  })

  return news
})
