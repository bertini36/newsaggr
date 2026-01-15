import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const baseURL = "https://www.nature.com"
  const newsURL = `${baseURL}/news`
  const html: any = await myFetch(newsURL)
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  // Target article cards/containers on the news page
  $("article, [data-track-action='view article']").each((_, el) => {
    const container = $(el)
    const link = container.find("a[href*='/articles/']").first()
    const href = link.attr("href")
    const title = link.text().trim()

    // Look for date in the container - Nature uses formats like "18 Dec 2025"
    const containerText = container.text()
    const dateMatch = containerText.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i)

    if (href && title && title.length > 20) {
      const url = href.startsWith("http") ? href : `${baseURL}${href}`

      // Avoid duplicates
      if (!news.some(n => n.url === url)) {
        let pubDate: string | undefined
        if (dateMatch) {
          const parsed = new Date(dateMatch[1])
          if (!Number.isNaN(parsed.getTime())) {
            pubDate = parsed.toISOString()
          }
        }

        news.push({
          url,
          title,
          id: url,
          pubDate,
        })
      }
    }
  })

  // Also check for article links not inside article containers
  $("a[href*='/articles/']").each((_, el) => {
    const link = $(el)
    const href = link.attr("href")
    const title = link.text().trim()

    if (href && title && title.length > 20) {
      const url = href.startsWith("http") ? href : `${baseURL}${href}`

      // Avoid duplicates
      if (!news.some(n => n.url === url)) {
        // Try to find date near the link
        const parent = link.parent()
        const parentText = parent.text()
        const dateMatch = parentText.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i)

        let pubDate: string | undefined
        if (dateMatch) {
          const parsed = new Date(dateMatch[1])
          if (!Number.isNaN(parsed.getTime())) {
            pubDate = parsed.toISOString()
          }
        }

        news.push({
          url,
          title,
          id: url,
          pubDate,
        })
      }
    }
  })

  // Return unique items
  const uniqueNews = news.filter((n, i, self) =>
    i === self.findIndex(t => t.url === n.url),
  )

  // For items without date, fetch the article page to find it
  // Limit concurrency to avoid overwhelming the server
  const itemsWithoutDate = uniqueNews.filter(n => !n.pubDate)
  if (itemsWithoutDate.length > 0) {
    const fetchDate = async (item: NewsItem) => {
      try {
        const articleHtml: any = await myFetch(item.url)
        const $art = cheerio.load(articleHtml)

        // Try JSON-LD first
        let foundDate: string | undefined
        $art("script[type='application/ld+json']").each((_, el) => {
          if (foundDate) return
          try {
            const ld = JSON.parse($art(el).text())
            // Check for datePublished in mainEntity or top level
            if (ld.datePublished) {
              foundDate = ld.datePublished
            } else if (ld.mainEntity && ld.mainEntity.datePublished) {
              foundDate = ld.mainEntity.datePublished
            }
          } catch {
            // ignore parse errors
          }
        })

        // Fallback to meta tag
        if (!foundDate) {
          foundDate = $art("meta[itemprop='datePublished']").attr("content")
        }

        // Fallback to time tag
        if (!foundDate) {
          foundDate = $art("time").attr("datetime")
        }

        if (foundDate) {
          const parsed = new Date(foundDate)
          if (!Number.isNaN(parsed.getTime())) {
            item.pubDate = parsed.toISOString()
          }
        }
      } catch (e) {
        console.error(`Failed to fetch date for ${item.url}`, e)
      }
    }

    // Process in batches of 5 to be nice
    const batchSize = 5
    for (let i = 0; i < itemsWithoutDate.length; i += batchSize) {
      const batch = itemsWithoutDate.slice(i, i + batchSize)
      await Promise.all(batch.map(fetchDate))
    }
  }

  // Sort by pubDate (newest first)
  uniqueNews.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return uniqueNews
})
