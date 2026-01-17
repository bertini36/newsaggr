import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://www.cronicabalear.es/noticias/baleares/"
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  })
  const html = await response.text()
  const $ = cheerio.load(html)

  const news: NewsItem[] = []

  $(".categoria-noticia").each((_, element) => {
    const $element = $(element)
    const $heading = $element.find("h2 a, h3 a")
    const title = $heading.text().trim()
    const relativeUrl = $heading.attr("href")

    if (title && relativeUrl) {
      // Relative URLs need to be resolved against the base URL
      const fullUrl = relativeUrl.startsWith("http")
        ? relativeUrl
        : `https://www.cronicabalear.es/${relativeUrl.startsWith("/") ? relativeUrl.slice(1) : relativeUrl}`

      // Extract date from URL: /2026-01-17/
      let pubDate: string | undefined
      const urlMatch = fullUrl.match(/\/(\d{4}-\d{2}-\d{2})\//)
      if (urlMatch) {
        const [, dateStr] = urlMatch
        const [year, month, day] = dateStr.split("-")
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
        pubDate = date.toISOString()
      }

      news.push({
        id: fullUrl,
        title,
        url: fullUrl,
        pubDate,
      })
    }
  })

  // Sort by date, newest first
  news.sort((a, b) => {
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return news
})
