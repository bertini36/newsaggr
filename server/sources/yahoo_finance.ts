import * as cheerio from "cheerio"
import { defineSource } from "../utils/source"
import { myFetch } from "../utils/fetch"

const UA_CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

export default defineSource(async () => {
  const url = "https://finance.yahoo.com/news/rssindex"

  // Use a browser user-agent to bypass 429 errors and consent blocks
  const xml: any = await myFetch(url, {
    headers: {
      "User-Agent": UA_CHROME,
      "Accept": "application/rss+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    responseType: "text", // Ensure we get text back to parse as XML
  })

  const $ = cheerio.load(xml, { xmlMode: true })
  const news: any[] = []

  $("item").each((_, element) => {
    const item = $(element)
    const url = item.find("link").text()
    const title = item.find("title").text()
    const pubDateStr = item.find("pubDate").text()

    if (url && title) {
      news.push({
        id: url,
        url,
        title,
        pubDate: pubDateStr,
      })
    }
  })

  // Sort by pubDate (newest first)
  news.sort((a, b) => {
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return news
})
