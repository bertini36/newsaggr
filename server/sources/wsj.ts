import * as cheerio from "cheerio"
import { defineSource } from "../utils/source"
import { myFetch } from "../utils/fetch"

const UA_GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"

export default defineSource(async () => {
  const date = new Date()

  // Helper to format date as YYYY/MM/DD
  const formatDate = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}/${month}/${day}`
  }

  const getArchiveUrl = (d: Date) => `https://www.wsj.com/news/archive/${formatDate(d)}`

  let articles: any[] = []

  // Try today's archive first
  let url = getArchiveUrl(date)
  console.log(`[WSJ] Fetching archive: ${url}`)

  try {
    let html = await myFetch(url, {
      headers: {
        "User-Agent": UA_GOOGLEBOT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      },
    })

    let $ = cheerio.load(html)
    let nextDataScript = $("#__NEXT_DATA__").html()

    if (!nextDataScript) {
      console.log("[WSJ] No data found for today, checking yesterday...")
      // Fallback to yesterday
      const yesterday = new Date(date)
      yesterday.setDate(date.getDate() - 1)
      url = getArchiveUrl(yesterday)
      console.log(`[WSJ] Fetching archive: ${url}`)

      html = await myFetch(url, {
        headers: {
          "User-Agent": UA_GOOGLEBOT,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        },
      })
      $ = cheerio.load(html)
      nextDataScript = $("#__NEXT_DATA__").html()
    }

    if (nextDataScript) {
      const json = JSON.parse(nextDataScript)
      // specific path for archive articles in WSJ Next.js props
      articles = json.props?.pageProps?.newsArchiveArticles || []
    }
  } catch (e) {
    console.error(`[WSJ] Error fetching archive:`, e)
    return []
  }

  return articles.map((item: any) => ({
    url: item.articleUrl || item.url,
    title: item.headline,
    date: new Date(item.timestamp),
    description: item.summary || item.headline,
  }))
})
