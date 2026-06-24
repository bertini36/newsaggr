import { XMLParser } from "fast-xml-parser"
import type { NewsItem } from "@shared/types"

interface SitemapUrl {
  "loc": string
  "news:news"?: {
    "news:title"?: string
    "news:publication_date"?: string
  }
}

// Reuters localised editions live under a two-letter path prefix (/es/, /fr/, ...).
// English articles sit under named sections (/world/, /business/, ...).
const localePath = /^https:\/\/www\.reuters\.com\/[a-z]{2}\//

export default defineSource(async () => {
  // Reuters blocks its public RSS feeds and Google News is blocked from Cloudflare's
  // datacenter egress, so we read Reuters' own news sitemap, which is crawler-facing
  // and serves fresh articles with titles and publication dates.
  const sitemapUrl = "https://www.reuters.com/arc/outboundfeeds/news-sitemap/?outputType=xml"
  const xml = await myFetch(sitemapUrl, { responseType: "text" })

  const parser = new XMLParser({ ignoreAttributes: false })
  const result = parser.parse(xml as string)

  let urls: SitemapUrl[] = result?.urlset?.url ?? []
  if (!Array.isArray(urls)) urls = [urls]

  const news: NewsItem[] = urls
    .filter(url => url.loc && !localePath.test(url.loc))
    .map(url => ({
      title: (url["news:news"]?.["news:title"] || "").trim(),
      url: url.loc,
      id: url.loc,
      pubDate: url["news:news"]?.["news:publication_date"],
    }))
    .filter(item => item.title && item.url)

  if (news.length === 0) {
    throw new Error("Cannot fetch Reuters data from sitemap")
  }

  news.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return news
})
