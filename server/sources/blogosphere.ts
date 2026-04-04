import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://text.blogosphere.app/"
  const html: any = await myFetch(url)
  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  $("td.title").each((_, el) => {
    const titleEl = $(el).find("a").first()
    const title = titleEl.text().trim()
    const postUrl = titleEl.attr("href")

    if (!title || !postUrl) return

    const subtextEl = $(el).closest("tr").next("tr").find("td.subtext")
    const blogName = subtextEl.find("a").first().text().trim()

    news.push({
      id: postUrl,
      title,
      url: postUrl,
      extra: {
        info: blogName || undefined,
      },
    })
  })

  return news
})
