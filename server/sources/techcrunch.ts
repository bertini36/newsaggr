import type { NewsItem } from "@shared/types"
import { rss2json } from "../utils/rss2json"

// Decode HTML entities like &#8216; (left single quote), &#8217; (right single quote), etc.
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
}

export default defineSource(async () => {
  const rssUrl = "https://techcrunch.com/feed/"
  const data = await rss2json(rssUrl)

  if (!data?.items.length) {
    throw new Error("Cannot fetch TechCrunch RSS data")
  }

  const news: NewsItem[] = data.items.map(item => ({
    title: decodeHtmlEntities(item.title),
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
