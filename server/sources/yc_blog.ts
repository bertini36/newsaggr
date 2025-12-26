import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const baseURL = "https://www.ycombinator.com"
  const url = `${baseURL}/blog`
  const html: any = await myFetch(url)
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  // Find all blog post entries - they contain title links and dates
  $("a[href^='/blog/']").each((_, el) => {
    const link = $(el)
    const href = link.attr("href")
    const title = link.text().trim()

    // Filter out simple "Read More" links, tags, and author links
    if (href && title && title.length > 15 && title !== "Read More" && !href.includes("/author/") && !href.includes("/tag/")) {
      const fullUrl = `${baseURL}${href}`

      if (!news.some(n => n.url === fullUrl)) {
        // Try to find the date - it's usually in the parent container
        const container = link.closest("div")
        let pubDate: string | undefined

        // Look for date pattern like "10/14/2025" in the container text
        const containerText = container.text()
        const dateMatch = containerText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
        if (dateMatch) {
          const [, month, day, year] = dateMatch
          pubDate = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`).toISOString()
        }

        news.push({
          id: fullUrl,
          title,
          url: fullUrl,
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
