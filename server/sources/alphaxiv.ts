import type { NewsItem } from "@shared/types"

export default defineSource(async () => {
  const url = "https://api.alphaxiv.org/papers/v3/feed?sort=Hot&interval=7+Days&pageNum=1&pageSize=30"
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  })
  const data: any = await response.json()
  const news: NewsItem[] = []

  for (const paper of data.papers ?? []) {
    const paperId: string = paper.universal_paper_id
    const title: string = paper.title
    if (!paperId || !title) continue

    const paperUrl = `https://www.alphaxiv.org/abs/${paperId}`
    const authors: string[] = paper.authors ?? []
    const info = authors.length > 0 ? authors.slice(0, 2).join(", ") + (authors.length > 2 ? " et al." : "") : undefined

    news.push({
      id: paperUrl,
      title,
      url: paperUrl,
      pubDate: paper.first_publication_date,
      extra: {
        info: info || undefined,
      },
    })
  }

  return news
})
