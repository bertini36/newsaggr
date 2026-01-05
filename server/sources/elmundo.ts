import { Buffer as NodeBuffer } from "node:buffer"
import * as cheerio from "cheerio"
import iconv from "iconv-lite"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://www.elmundo.es/espana.html"
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  })
  const buffer = NodeBuffer.from(await response.arrayBuffer())

  // Attempt decoding with multiple common encodings for this source
  let html = ""
  const encodings = ["iso-8859-15", "windows-1252", "iso-8859-1"]

  for (const encoding of encodings) {
    const decoded = iconv.decode(buffer, encoding)
    // If the decoded text contains the Spanish keyword without corruption, use it
    if (decoded.includes("España") || decoded.includes("español")) {
      html = decoded
      break
    }
  }

  // Fallback to first one if none matched the heuristic
  if (!html) {
    html = iconv.decode(buffer, "iso-8859-15")
  }

  const $ = cheerio.load(html)

  const news: NewsItem[] = []
  const seenUrls = new Set<string>()

  $("article.ue-c-cover-content").each((_, element) => {
    const headlineElement = $(element).find(".ue-c-cover-content__headline")
    const title = headlineElement.text().trim()
    const linkElement = $(element).find("a.ue-c-cover-content__link, a.ue-c-cover-content__link-whole-content")
    const url = linkElement.attr("href")

    const dateElement = $(element).find(".ue-c-cover-content__published-date")
    const pubDate = dateElement.attr("data-publish")

    if (title && url) {
      if (!seenUrls.has(url)) {
        seenUrls.add(url)
        news.push({
          title,
          url,
          id: url,
          pubDate,
        })
      }
    }
  })

  if (news.length === 0) {
    throw new Error("Cannot fetch El Mundo data from web scraping")
  }

  // Sort by pubDate (newest first), items without dates go to the end
  news.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return news
})
