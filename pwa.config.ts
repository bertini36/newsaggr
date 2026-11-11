import process from "node:process"
import type { VitePWAOptions } from "vite-plugin-pwa"
import { VitePWA } from "vite-plugin-pwa"

const pwaOption: Partial<VitePWAOptions> = {
  includeAssets: ["icon.svg", "apple-touch-icon.png"],
  filename: "swx.js",
  manifest: {
    name: "NewsAggr",
    short_name: "NewsAggr",
    description: "Real-time news aggregator bringing you the latest headlines from top sources",
    lang: "en",
    dir: "ltr",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    categories: ["news"],
    theme_color: "#0d1117",
    background_color: "#ffffff",
    shortcuts: [
      {
        name: "Saved news",
        url: "/saved",
        icons: [{ src: "pwa-192x192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
    icons: [
      { src: "pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "pwa-maskable-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "pwa-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  },
  registerType: "autoUpdate",
  workbox: {
    clientsClaim: true,
    skipWaiting: true,
    navigateFallbackDenylist: [/^\/api/],
    cleanupOutdatedCaches: true,
  },
  devOptions: {
    enabled: process.env.SW_DEV === "true",
    type: "module",
    navigateFallback: "index.html",
  },
}

export default function pwa() {
  return VitePWA(pwaOption)
}
