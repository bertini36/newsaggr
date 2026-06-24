import type { NewsItem } from "@shared/types"
import { rss2json } from "../utils/rss2json"

// The Information's own Atom feed is the cleanest source but its bot protection
// rejects some server clients; Bing News is the fallback. Google News is unusable
// because it is blocked from Cloudflare's datacenter egress.
const bingUrl = "https://www.bing.com/news/search?q=site%3Atheinformation.com&format=rss&setlang=en-US&cc=US"

async function fromNativeFeed(): Promise<NewsItem[]> {
  const data = await rss2json("https://www.theinformation.com/feed")
  return (data?.items ?? []).map(item => ({
    title: (item.title || "").trim(),
    url: item.link || "",
    id: item.link || "",
    pubDate: item.created,
  }))
}

async function fromBing(): Promise<NewsItem[]> {
  const data = await rss2json(bingUrl)
  return (data?.items ?? []).map((item) => {
    const link = item.link || ""
    // Bing wraps links in a redirect; the real article URL sits in the "url" param.
    let url = link
    try {
      url = new URL(link).searchParams.get("url") || link
    } catch {
      // Keep the raw link if it is not a parseable URL.
    }
    return { title: (item.title || "").trim(), url, id: url, pubDate: item.created }
  })
}

export default defineSource(async () => {
  let news: NewsItem[] = []
  try {
    news = await fromNativeFeed()
  } catch {
    // The native feed blocked us; fall through to Bing.
  }
  if (!news.length) news = await fromBing()

  news = news.filter(item => item.title && item.url)
  if (news.length === 0) {
    throw new Error("Cannot fetch The Information data")
  }

  news.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return news
})
