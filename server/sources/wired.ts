import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const rssURL = "https://www.wired.com/feed/rss"
  const xml: any = await myFetch(rssURL)
  const $ = cheerio.load(xml, { xmlMode: true })
  const news: NewsItem[] = []

  $("item").each((_, el) => {
    const item = $(el)
    const title = item.find("title").text()
    const link = item.find("link").text()
    const pubDateStr = item.find("pubDate").text()

    if (title && link) {
      const pubDate = pubDateStr ? new Date(pubDateStr).toISOString() : undefined

      news.push({
        id: link,
        title: title.trim(),
        url: link,
        pubDate,
      })
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
