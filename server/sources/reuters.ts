import type { NewsItem } from "@shared/types"
import { rss2json } from "../utils/rss2json"

export default defineSource(async () => {
  // Reuters blocks direct access and Google News RSS is blocked from Cloudflare's
  // datacenter egress, so we use Bing News, which serves Reuters articles reliably.
  const rssUrl = "https://www.bing.com/news/search?q=site%3Areuters.com&format=rss&setlang=en-US&cc=US"
  const data = await rss2json(rssUrl)

  if (!data?.items.length) {
    throw new Error("Cannot fetch Reuters RSS data")
  }

  // Bing wraps article links in a redirect; the real reuters.com URL sits in the "url" param.
  const news: NewsItem[] = data.items
    .map((item) => {
      const link = item.link || ""
      const realUrl = new URL(link).searchParams.get("url") || link

      return {
        title: (item.title || "").trim(),
        url: realUrl,
        id: realUrl,
        pubDate: item.created,
      }
    })
    .filter(item => item.title && item.url)

  if (news.length === 0) {
    throw new Error("Cannot fetch Reuters data from RSS feed")
  }

  news.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return news
})
