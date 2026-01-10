import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://news.smol.ai/"
  const html = await (await fetch(url)).text()
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  // Find all news entry links - they follow the pattern /issues/YY-MM-DD-slug
  $("a[href^='/issues/']").each((_, element) => {
    const $el = $(element)
    const href = $el.attr("href")
    if (!href) return

    // Extract text content - the title is inside the link
    const fullText = $el.text().trim()

    // Skip entries that say "not much happened today"
    if (fullText.toLowerCase().includes("not much happened today")) {
      return
    }

    // Parse date from URL: /issues/YY-MM-DD-slug -> YYYY-MM-DD
    // Example: /issues/26-01-06-xai-series-e -> 2026-01-06
    const dateMatch = href.match(/\/issues\/(\d{2})-(\d{2})-(\d{2})/)
    if (!dateMatch) return

    const [, yy, mm, dd] = dateMatch
    const year = Number.parseInt(yy, 10) + 2000
    const pubDate = `${year}-${mm}-${dd}`

    // Extract the title from the link text
    // Format is typically: "Jan 06     xAI raises $20B Series E..."
    // We want just the headline part after the date
    let title = fullText
    // Remove "Show details" suffix if present
    if (title.endsWith("Show details")) {
      title = title.slice(0, -12).trimEnd()
    }
    // Remove date prefix (e.g., "Jan 06     ") using indexOf to avoid regex backtracking
    const datePrefixMatch = title.match(/^[A-Z]{3} +\d{1,2} +/i)
    if (datePrefixMatch) {
      title = title.slice(datePrefixMatch[0].length)
    }
    title = title.trim()

    if (!title) return

    const fullUrl = `https://news.smol.ai${href}`

    news.push({
      id: fullUrl,
      title,
      url: fullUrl,
      pubDate,
    })
  })

  // Deduplicate by URL (some links may appear multiple times)
  const uniqueNews = news.filter((item, index, array) =>
    array.findIndex(i => i.url === item.url) === index,
  )

  // Sort by pubDate (newest first)
  uniqueNews.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return uniqueNews
})
