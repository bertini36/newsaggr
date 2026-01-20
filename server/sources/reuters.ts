import type { NewsItem } from "@shared/types"
import { rss2json } from "../utils/rss2json"

export default defineSource(async () => {
  // Using Google News RSS to get Reuters news since reuters.com blocks direct access
  // This RSS feed returns news articles from Reuters via Google News indexing
  const rssUrl = "https://news.google.com/rss/search?q=site:reuters.com&hl=en-US&gl=US&ceid=US:en"
  const data = await rss2json(rssUrl)

  if (!data?.items.length) {
    throw new Error("Cannot fetch Reuters RSS data")
  }

  // Map items to news format
  // Google News links redirect to Reuters, title includes " - Reuters" suffix
  const news: NewsItem[] = data.items
    .map((item) => {
      // Clean up the title by removing " - Reuters" suffix
      const title = (item.title || "").replace(/\s*-\s*Reuters\s*$/i, "").trim()

      return {
        title,
        url: item.link || "",
        id: item.id || item.link || "",
        pubDate: item.created,
      }
    })
    .filter(item => item.title && item.url)

  if (news.length === 0) {
    throw new Error("Cannot fetch Reuters data from RSS feed")
  }

  // Sort by pubDate (newest first)
  news.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return news
})
