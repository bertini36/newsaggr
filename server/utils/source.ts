import process from "node:process"
import type { AllSourceID, NewsItem } from "@shared/types"
import defu from "defu"
import type { RSSHubOption, RSSHubInfo as RSSHubResponse, SourceGetter, SourceOption } from "#/types"

/**
 * Filter out empty news items (items with empty/whitespace-only title or url)
 */
function filterEmptyNews(items: NewsItem[]): NewsItem[] {
  return items.filter(item =>
    item.title?.trim() && item.url?.trim(),
  )
}

type R = Partial<Record<AllSourceID, SourceGetter>>
export function defineSource(source: SourceGetter): SourceGetter
export function defineSource(source: R): R
export function defineSource(source: SourceGetter | R): SourceGetter | R {
  if (typeof source === "function") {
    return async () => {
      const items = await source()
      return filterEmptyNews(items)
    }
  }
  // For record of sources, wrap each getter
  const wrapped: R = {}
  for (const [key, getter] of Object.entries(source)) {
    if (getter) {
      wrapped[key as AllSourceID] = async () => {
        const items = await getter()
        return filterEmptyNews(items)
      }
    }
  }
  return wrapped
}

export function defineRSSSource(url: string, option?: SourceOption): SourceGetter {
  return async () => {
    const data = await rss2json(url)
    if (!data?.items.length) throw new Error("Cannot fetch rss data")
    return filterEmptyNews(data.items.map(item => ({
      title: item.title,
      url: item.link,
      id: item.link,
      pubDate: !option?.hiddenDate ? item.created : undefined,
    })))
  }
}

export function defineRSSHubSource(route: string, RSSHubOptions?: RSSHubOption, sourceOption?: SourceOption): SourceGetter {
  return async () => {
    // "https://rsshub.pseudoyu.com"
    const RSSHubBase = "https://rsshub.rssforever.com"
    const url = new URL(route, RSSHubBase)
    url.searchParams.set("format", "json")
    RSSHubOptions = defu<RSSHubOption, RSSHubOption[]>(RSSHubOptions, {
      sorted: true,
    })

    Object.entries(RSSHubOptions).forEach(([key, value]) => {
      url.searchParams.set(key, value.toString())
    })
    const data: RSSHubResponse = await myFetch(url)
    return filterEmptyNews(data.items.map(item => ({
      title: item.title,
      url: item.url,
      id: item.id ?? item.url,
      pubDate: !sourceOption?.hiddenDate ? item.date_published : undefined,
    })))
  }
}

export function proxySource(proxyUrl: string, source: SourceGetter) {
  return process.env.CF_PAGES
    ? defineSource(async () => {
        const data = await myFetch(proxyUrl)
        return data.items
      })
    : source
}
