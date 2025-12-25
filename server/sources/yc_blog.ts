import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const baseURL = "https://www.ycombinator.com"
  const url = `${baseURL}/blog`
  const html: any = await myFetch(url)
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  $("a[href^='/blog/']").each((_, el) => {
    const link = $(el)
    const href = link.attr("href")
    const title = link.text().trim()

    // Filter out simple "Read More" links or tags if possible
    if (href && title && title.length > 15 && title !== "Read More") {
      const fullUrl = `${baseURL}${href}`

      if (!news.some(n => n.url === fullUrl)) {
        news.push({
          id: fullUrl,
          title,
          url: fullUrl, // YC blog doesn't usually have dates in list view easily, or does it?
        })
      }
    }
  })

  return news
})
