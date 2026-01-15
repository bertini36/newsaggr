import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://www.diariodemallorca.es/local/"
  const response = await fetch(url)
  const html = await response.text()
  const $ = cheerio.load(html)

  const news: NewsItem[] = []

  $("article.ft-org-cardHome").each((_, element) => {
    const $element = $(element)
    const $heading = $element.find("h2.ft-org-cardHome__mainTitle a")
    const title = $heading.text().trim()
    const relativeUrl = $heading.attr("href")

    if (title && relativeUrl) {
      const fullUrl = relativeUrl.startsWith("http") ? relativeUrl : `https://www.diariodemallorca.es${relativeUrl}`

      // Extract date from URL: /2026/01/15/
      let pubDate: string | undefined
      const urlMatch = fullUrl.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//)
      if (urlMatch) {
        const [, year, month, day] = urlMatch
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
