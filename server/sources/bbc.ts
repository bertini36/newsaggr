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

  return news
})
