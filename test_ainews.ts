import ainewsSource from "../server/sources/ainews"

async function testAINews() {
  try {
    console.log("Testing AINews scraper...")
    const items = await ainewsSource()

    console.log(`\nFound ${items.length} news items:\n`)

    items.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`)
      console.log(`   URL: ${item.url}`)
      console.log(`   Date: ${item.pubDate || "No date"}`)
      console.log()
    })
  } catch (error) {
    console.error("Error:", error)
  }
}

testAINews()
