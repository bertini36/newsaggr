import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://www.libertaddigital.com/"
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Libertad Digital: ${response.statusText}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  const news: NewsItem[] = []
  const seenUrls = new Set<string>()

  // Find all article links on the homepage
  $("a").each((_, element) => {
    const linkElement = $(element)
    const href = linkElement.attr("href")

    // Skip non-article links
    if (!href || !href.includes("libertaddigital.com")) return
    if (href.includes("/autor/") || href.includes("/colabora/") || href.includes("/club/")) return

    // Skip links from the top bar navigation (header, nav elements)
    const isInHeader = linkElement.closest("header, nav, .nav, .menu, .navigation, .topbar, .top-bar").length > 0
    if (isInHeader) return

    // Skip links from "Es noticia" section
    const isEsNoticia = linkElement.closest("[class*='noticia'], [id*='noticia'], [class*='es-noticia'], [id*='es-noticia']").length > 0
      || linkElement.closest("section, div").filter((_, el) => {
        const heading = $(el).find("h1, h2, h3, h4, .title, .heading").first().text().toLowerCase()
        return heading.includes("es noticia")
      }).length > 0
    if (isEsNoticia) return

    // Extract date from URL pattern: /YYYY-MM-DD/
    const dateMatch = href.match(/\/(\d{4})-(\d{2})-(\d{2})\//)
    if (!dateMatch) return // Skip links without dates (not news articles)

    // Get the title - prioritize h2 heading to get just the headline (not subtitle/author)
    const h2Element = linkElement.find("h2")
    let title = h2Element.length > 0 ? h2Element.text().trim() : ""

    // If no h2, try h3 or h4
    if (!title) {
      const h3Element = linkElement.find("h3")
      title = h3Element.length > 0 ? h3Element.text().trim() : ""
    }
    if (!title) {
      const h4Element = linkElement.find("h4")
      title = h4Element.length > 0 ? h4Element.text().trim() : ""
    }

    // If still no title and the link has minimal text (no nested elements with extra info), use it
    if (!title) {
      const hasNestedDivs = linkElement.find("div").length > 1
      if (!hasNestedDivs) {
        title = linkElement.text().trim()
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
    throw new Error("Cannot fetch Libertad Digital data from web scraping")
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
