import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://arxiv.org/list/cs.AI/recent"
  // Fetch HTML
  const html = await (await fetch(url)).text()
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  // Iterate over each day group
  // Structure appears to be: <h3>Date</h3> <dt>...</dt> <dd>...</dd> ...
  $("h3").each((_, h3Element) => {
    const h3 = $(h3Element)
    const dateText = h3.text().trim()
    // Remove " (showing first ...)" if present
    const cleanDateText = dateText.split("(")[0].trim()

    // Parse date
    // Format: "Fri, 9 Jan 2026"
    const date = new Date(cleanDateText)
    const pubDate = !Number.isNaN(date.getTime())
      ? date.toISOString().split("T")[0] // YYYY-MM-DD
      : new Date().toISOString().split("T")[0] // Fallback

    // Traverse siblings until next h3
    let sibling = h3.next()
    while (sibling.length && sibling.prop("tagName") !== "H3") {
      if (sibling.prop("tagName") === "DT") {
        const dt = sibling
        const dd = dt.next("dd")

        const titleElement = dd.find(".list-title")

        // Remove "Title: " prefix
        titleElement.find(".descriptor").remove()
        const title = titleElement.text().trim()

        // Extract URL (abstract link)
        const linkElement = dt.find("a[title='Abstract']")
        const itemId = linkElement.text().trim() // e.g., arXiv:2601.05230
        const itemUrl = `https://arxiv.org/abs/${itemId.replace("arXiv:", "")}`

        if (title && itemUrl) {
          news.push({
            id: itemUrl,
            title,
            url: itemUrl,
            pubDate,
          })
        }
      }
      sibling = sibling.next()
    }
  })

  // Sort by pubDate (newest first)
  news.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  })

  return news
})
