# Contributing to NewsAggr 🤝

Yo! Want to help make **NewsAggr** even better? You're a legend! 🎸

Whether you're fixing a bug 🐛, adding a cool new feature ✨, or just cleaning up some typos, we love to see it.

## Getting Started 🚀

First things first, make sure you have the basics:

*   **Node.js**: Version 20 or higher.
*   **pnpm**: We use `pnpm` because it's fast and efficient.

```bash
# Install dependencies
pnpm i

# Fire up the dev server
pnpm dev
```

## Adding Data Sources (The Meat 🥩)

The most common way to contribute is adding new news sources. We've made it super easy.

### 1. Register the Source 📝

Go to `shared/pre-sources.ts`. This is the single source of truth for our config.

Add your source to the `originSources` object:

```typescript
export const originSources = {
  // ... existing sources
  cool_new_source: {
    name: "Cool New Source",
    home: "https://example.com",
    column: "tech", // Options: "tech", "world", "science", "finance", "entrepreneurship"
  },
}
```

### 2. Create the Fetcher 🕵️‍♂️

Now, tell us how to get the data. Create a new file in `server/sources/<your_source_name>.ts`.

You'll need to export a `defineSource` function. Here is a pattern to follow:

```typescript
import type { NewsItem } from "@shared/types"
import { rss2json } from "../utils/rss2json"

export default defineSource(async () => {
  // 1. Fetch the data (RSS is easiest!)
  const rssUrl = "https://example.com/feed.xml"
  const data = await rss2json(rssUrl)

  // 2. Transform into our NewsItem format
  const news: NewsItem[] = data.items.map(item => ({
    title: item.title,
    url: item.link,
    id: item.link,
    pubDate: item.created, // or new Date(item.pubDate).getTime()
  }))

  // 3. Sort by date (newest first)
  return news.sort((a, b) => b.pubDate - a.pubDate)
})
```

> **Pro Tip:** If you can't use RSS, you can use `myFetch` to scrape HTML or hit an API directly. Check `server/sources` for more complex examples!

### 3. Generate Config ⚙️

We use a script to bundle everything together. Run this magic command:

```bash
pnpm run presource
```

This updates the internal configuration to include your new source.

### 4. Test It Out 🧪

Run `pnpm dev` and check the UI. Your new source should be available in the settings or main feed!

## Pull Requests 📥

Ready to ship?

1.  **Fork** the repo.
2.  **Branch** off `main` (`git checkout -b my-cool-feature`).
3.  **Commit** your changes.
4.  **Push** to your fork.
5.  **Open a PR**!

We'll review it ASAP. Happy coding! 💻
