import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"
import { myFetch } from "../utils/fetch"

export default defineSource(async () => {
  const url = "https://www.artificialintelligence-news.com/"
  const html = await myFetch(url, { responseType: "text" })
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  // Find article elements - they are Elementor loop items with post classes
  $(".e-loop-item.post").each((_, element) => {
    const $el = $(element)

    // Find the title link
    const titleElement = $el.find(".elementor-widget-theme-post-title a, h1 a, h2 a, h3 a").first()
    const title = titleElement.text().trim()
    const url = titleElement.attr("href")

    if (!title || !url) return

    // Look for date metadata
    const timeElement = $el.find("time[datetime], .entry-date, .published")
    let pubDate: string | undefined

    if (timeElement.length > 0) {
      const datetime = timeElement.attr("datetime")
      if (datetime) {
        pubDate = new Date(datetime).toISOString()
      } else {
        const dateText = timeElement.text().trim()
        if (dateText) {
          const parsedDate = new Date(dateText)
          if (!Number.isNaN(parsedDate.getTime())) {
            pubDate = parsedDate.toISOString()
          }
        }
      }
    }

    news.push({
      id: url,
      title,
      url,
      pubDate,
    })
  })

  if (news.length === 0) {
    throw new Error("Cannot fetch AINews data from web scraping")
  }

  // Deduplicate by URL
  const uniqueNews = news.filter((item, index, array) =>
    array.findIndex(i => i.url === item.url) === index,
  )

  // Sort by pubDate (newest first), items without dates go to the end
  uniqueNews.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return uniqueNews
})
