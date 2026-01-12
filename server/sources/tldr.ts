import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://tldr.tech/api/latest/tech"
  const response = await fetch(url)
  const html = await response.text()
  const $ = cheerio.load(html)

  const news: NewsItem[] = []

  // Try to find the date of the newsletter
  let pubDate = new Date().toISOString()
  const dateText = $("h1").text() || $("head title").text()
  const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2})/)
  if (dateMatch) {
    pubDate = new Date(dateMatch[1]).toISOString()
  }

  $("article, div.mt-3").each((_, element) => {
    // Check for title in h3 or h4 inside an anchor or strong tag
    const titleElement = $(element).find("h3, h4").first()
    let title = titleElement.text().trim()
    let link = titleElement.closest("a").attr("href")

    // Fallback: sometimes the structure is just an anchor with bold text
    if (!title) {
      const boldLink = $(element).find("a.font-bold").first()
      if (boldLink.length) {
        title = boldLink.text().trim()
        link = boldLink.attr("href")
      }
    }

    // Ensure we have a valid title and link
    if (title && link) {
      // Avoid duplicate or sponsor links if necessary, though simple check is fine
      if (!link.startsWith("http")) {
        // Handle relative links if any (though usually absolute on tldr)
        if (link.startsWith("/")) {
          link = `https://tldr.tech${link}`
        }
      }

      news.push({
        title,
        url: link,
        id: link,
        pubDate, // All items in the newsletter share the same date
      })
    }
  })

  return news
})
