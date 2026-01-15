import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://www.ultimahora.es/noticias.html"
  const response = await fetch(url)
  const html = await response.text()
  const $ = cheerio.load(html)

  const news: NewsItem[] = []

  $(".news-item").each((_, element) => {
    const $element = $(element)
    const $heading = $element.find(".news-heading a")
    const title = $heading.text().trim()
    const url = $heading.attr("href")

    if (title && url) {
      const fullUrl = url.startsWith("http") ? url : `https://www.ultimahora.es${url}`

      // Parse date: "12/01/26 16:35" -> Date object
      const dateText = $element.find(".date").text().trim()
      let pubDate: string | undefined

      if (dateText) {
        // Expected format: dd/mm/yy HH:mm
        const match = dateText.match(/(\d{2})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/)
        if (match) {
          const [, day, month, year, hour, minute] = match
          // Assuming 20xx for year if it's 2 digits
          const fullYear = Number.parseInt(year) < 100 ? 2000 + Number.parseInt(year) : Number.parseInt(year)
          const date = new Date(fullYear, Number.parseInt(month) - 1, Number.parseInt(day), Number.parseInt(hour), Number.parseInt(minute))
          pubDate = date.toISOString()
        }
      }

      // Fallback: extract date from URL if not found in HTML (common for featured items)
      if (!pubDate && fullUrl) {
        // URL pattern: .../2026/01/15/...
        const urlMatch = fullUrl.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//)
        if (urlMatch) {
          const [, year, month, day] = urlMatch
          const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
          pubDate = date.toISOString()
        }
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
