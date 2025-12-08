import { rss2json } from "./server/utils/rss2json"

async function test() {
  try {
    console.log("Fetching...")
    const data = await rss2json("https://techcrunch.com/feed/")
    console.log("Success:", data ? data.items.length : "No data")
  } catch (e) {
    console.error("Error:", e)
  }
}
test()
