# NewsAggr 📰

> **Elegant News Aggregator** 🚀

![Preview](./screenshots/preview.png)

## About 🧠

I built **NewsAggr** out of a simple personal need: a unified, distraction-free hub to keep up with the daily news.

This project is heavily based on [ourongxing/newsnow](https://github.com/ourongxing/newsnow). I used it as a starting point and modified the styles to fit my personal taste and added the specific data sources I was interested in.

## Features ✨

*   **Clean & Elegant UI** 🎨 - Designed for focus and readability.
*   **Real-time Updates** ⚡ - News delivered instantly.
*   **Smart Caching** 🤖 - Default 30-minute cache, with adaptive scraping intervals (min 2 mins) to respect source limits.
*   **OAuth Integration** 🔒 - Log in seamlessly with **Google** or **GitHub** to sync your preferences.
*   **Responsive Design** 📱 - Works on all devices and can be installed as a PWA.
*   **Dark Mode** 🌙 - Support for dark mode.

## Quick Start (Local) 🛠️

Want to run this locally? Easy. You just need **Node.js >= 20** and **pnpm**.

```bash
# 1. Install dependencies
pnpm i

# 2. Start the dev server
pnpm dev
# 🚀 Running at http://localhost:5173
```

## Deployment (Production) 🚀

The recommended way to deploy is **Cloudflare Pages** with a **D1 Database**. It's fast, cheap (often free), and scales infinitely.

### 1. Cloudflare Pages + D1 Setup 🌩️

1.  **Fork** this repo.
2.  Create a **D1 Database** in your Cloudflare dashboard.
3.  Update `wrangler.toml` (or rename `example.wrangler.toml`) with your DB details:
    ```toml
    [[d1_databases]]
    binding = "NEWSAGGR_DB"
    database_name = "your-db-name"
    database_id = "your-db-id"
    ```

### 2. Configure Environment Variables 🔐

For production, you'll need to set these variables in your Cloudflare Pages project settings:

*   `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: For GitHub login.
*   `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For Google login.
*   `JWT_SECRET`: Random string for signing tokens.
*   `INIT_TABLE`: Set to `true` for the first deploy to create tables.
*   `ENABLE_CACHE`: `true` (recommended).

### 3. Automatic Deploys with GitHub Actions 🤖

To enable auto-deploys on every commit, you need to add these **Secrets** to your GitHub Repository settings:

*   `CLOUDFLARE_API_TOKEN`: Your Cloudflare API Token.
*   `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID.

Once set, the included `.github/workflows/test-and-deploy.yml` will handle the rest!

## Adding Data Sources 🔌

> Check out [CONTRIBUTING.md](CONTRIBUTING.md) for a deep dive on adding sources.

## Roadmap 🗺️

*   [ ] More data sources 📡
*   [ ] "Read Later" bookmarks 🔖
*   [ ] AI-powered summaries 🧠 (Maybe?)

## Contributing 🤝

Got a cool idea? Found a bug? Open a PR! We love contributions.
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License 📄

[MIT](./LICENSE) © bertini36
