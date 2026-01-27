import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://theobjective.com/"
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch The Objective: ${response.statusText}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  const news: NewsItem[] = []
  const seenUrls = new Set<string>()

  // Find all article links on the homepage
  $("a").each((_, element) => {
    const linkElement = $(element)
    const href = linkElement.attr("href")

    // Skip links in the "HOY ES NOTICIA" top bar
    if (linkElement.closest(".tno-today-ticker").length > 0) return

    // Skip non-article links
    if (!href || !href.includes("theobjective.com")) return
    // Skip author pages, tags, and other non-article pages
    if (href.includes("/autor/") || href.includes("/tag/") || href.includes("/newsletters") || href.includes("/hazte-socio") || href.includes("/myto/")) return
    if (href.includes("/productos-recomendados/") || href.includes("/branded-content/") || href.includes("/further/")) return

    // Extract date from URL pattern: /YYYY-MM-DD/
    const dateMatch = href.match(/\/(\d{4})-(\d{2})-(\d{2})\//)
    if (!dateMatch) return // Skip links without dates (not news articles)

    // Get the title from h2, h3, or h4 elements inside the link
    let title = ""
    const h2Element = linkElement.find("h2")
    const h3Element = linkElement.find("h3")
    const h4Element = linkElement.find("h4")

    if (h2Element.length > 0) {
      title = h2Element.text().trim()
    } else if (h3Element.length > 0) {
      title = h3Element.text().trim()
    } else if (h4Element.length > 0) {
      title = h4Element.text().trim()
    }

    // If no heading found, try direct text content if it's short enough
    if (!title) {
      const textContent = linkElement.text().trim()
      // Only use if it looks like a headline (reasonable length, no author info patterns)
      if (textContent.length > 10 && textContent.length < 200 && !textContent.includes("@")) {
        // Check if this link has few nested divs (likely a clean headline)
        const hasNestedDivs = linkElement.find("div").length > 1
        if (!hasNestedDivs) {
          title = textContent
        }
      }
    }

    // Skip if title is too short or empty
    if (!title || title.length < 15) return

    // Clean up title (remove extra whitespace, newlines)
    title = title.replace(/\s+/g, " ").trim()

    // Skip duplicates and very long titles (likely page descriptions)
    if (seenUrls.has(href) || title.length > 300) return

    const pubDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`

    seenUrls.add(href)
    news.push({
      id: href,
      title,
      url: href,
      pubDate,
    })
  })

  if (news.length === 0) {
    throw new Error("Cannot fetch The Objective data from web scraping")
  }

  // Sort by pubDate (newest first)
  news.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1

    const timeA = new Date(a.pubDate).getTime()
    const timeB = new Date(b.pubDate).getTime()

    if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0
    if (Number.isNaN(timeA)) return 1
    if (Number.isNaN(timeB)) return -1

    return timeB - timeA
  })

  return news
})
