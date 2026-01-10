import { describe, expect, it } from "vitest"
import type { NewsItem } from "@shared/types"

// Import all source modules
import bbcSource from "../server/sources/bbc"
import cnnSource from "../server/sources/cnn"
import engadgetSource from "../server/sources/engadget"
import forbesSource from "../server/sources/forbes"
import githubSource from "../server/sources/github"
import groundnewsSource from "../server/sources/groundnews"
import hackernewsSource from "../server/sources/hackernews"
import natureSource from "../server/sources/nature"
import nytimesSource from "../server/sources/nytimes"
import sciencedailySource from "../server/sources/sciencedaily"
import techcrunchSource from "../server/sources/techcrunch"
import wiredSource from "../server/sources/wired"
import wsjSource from "../server/sources/wsj"
import yahooFinanceSource from "../server/sources/yahoo_finance"
import ycBlogSource from "../server/sources/yc_blog"
import elmundoSource from "../server/sources/elmundo"
import elpaisSource from "../server/sources/elpais"
import eldiarioSource from "../server/sources/eldiario"
import arxivAiSource from "../server/sources/arxiv_ai"
import ainewsSmolSource from "../server/sources/ainews_smol"

/**
 * Validates that a NewsItem has all required fields
 */
function validateNewsItem(item: NewsItem): void {
  expect(item).toHaveProperty("id")
  expect(item).toHaveProperty("title")
  expect(item).toHaveProperty("url")
  expect(item.id).toBeTruthy()
  expect(item.title).toBeTruthy()
  expect(item.url).toBeTruthy()
  expect(typeof item.title).toBe("string")
  expect(typeof item.url).toBe("string")
}

/**
 * Creates a test for a single source
 */
function testSource(name: string, sourceFn: () => Promise<NewsItem[]>) {
  it(`${name} - should return valid news items`, async () => {
    const items = await sourceFn()

    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)

    // Validate each item has required fields
    for (const item of items.slice(0, 5)) {
      validateNewsItem(item)
    }
  }, 30000) // 30 second timeout for network requests
}

describe("source Validation Tests", () => {
  // Sources that return a simple function
  testSource("BBC", bbcSource as () => Promise<NewsItem[]>)
  testSource("CNN", cnnSource as () => Promise<NewsItem[]>)
  testSource("Engadget", engadgetSource as () => Promise<NewsItem[]>)
  testSource("Forbes", forbesSource as () => Promise<NewsItem[]>)
  testSource("Ground News", groundnewsSource as () => Promise<NewsItem[]>)
  testSource("Hacker News", hackernewsSource as () => Promise<NewsItem[]>)
  testSource("Nature", natureSource as () => Promise<NewsItem[]>)
  testSource("NY Times", nytimesSource as () => Promise<NewsItem[]>)
  testSource("ScienceDaily", sciencedailySource as () => Promise<NewsItem[]>)
  testSource("TechCrunch", techcrunchSource as () => Promise<NewsItem[]>)
  testSource("Wired", wiredSource as () => Promise<NewsItem[]>)
  testSource("WSJ", wsjSource as () => Promise<NewsItem[]>)
  testSource("Yahoo Finance", yahooFinanceSource as () => Promise<NewsItem[]>)
  testSource("YC Blog", ycBlogSource as () => Promise<NewsItem[]>)
  testSource("El Mundo", elmundoSource as () => Promise<NewsItem[]>)
  testSource("El País", elpaisSource as () => Promise<NewsItem[]>)
  testSource("El Diario", eldiarioSource as () => Promise<NewsItem[]>)
  testSource("Arxiv AI", arxivAiSource as () => Promise<NewsItem[]>)
  testSource("AINews by smol.ai", ainewsSmolSource as () => Promise<NewsItem[]>)

  // GitHub has sub-sources, test the trending endpoint
  it("gitHub - should return valid news items", async () => {
    const source = githubSource as Record<string, () => Promise<NewsItem[]>>
    const trendingFn = source.github
    expect(trendingFn).toBeDefined()

    const items = await trendingFn()
    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)

    for (const item of items.slice(0, 5)) {
      validateNewsItem(item)
    }
  }, 30000)
})
