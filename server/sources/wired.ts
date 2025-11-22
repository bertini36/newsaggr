import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const baseURL = "https://www.wired.com"
  const html: any = await myFetch(baseURL)
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  // Target links with class containing 'HeadlineLink'
  $("a[class*='HeadlineLink']").each((_, el) => {
    const link = $(el)
    const href = link.attr("href")
    const title = link.text()

    if (href && title) {
      const url = href.startsWith("http") ? href : `${baseURL}${href}`

      // Avoid duplicates if any
      if (!news.some(n => n.url === url)) {
        news.push({
          url,
          title: title.trim(),
          id: url,
        })
      }
    }
  })

  return news
})
