import type { NewsItem } from "@shared/types"
import { rss2json } from "../utils/rss2json"

export default defineSource(async () => {
  const rssUrl = "http://feeds.bbci.co.uk/news/world/rss.xml"
  const data = await rss2json(rssUrl)

  if (!data?.items.length) {
    throw new Error("Cannot fetch BBC RSS data")
  }

  const news: NewsItem[] = data.items.map(item => ({
    title: item.title,
    url: item.link,
    id: item.link,
    pubDate: item.created,
  }))

  // Sort by pubDate (newest first)
  news.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return news
})
