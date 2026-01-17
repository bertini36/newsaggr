import process from "node:process"
import { BookmarkTable } from "#/database/bookmark"

export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.user
    const db = useDatabase()
    if (!db) throw new Error("Not found database")
    const bookmarkTable = new BookmarkTable(db)

    if (process.env.INIT_TABLE !== "false") await bookmarkTable.init()

    if (event.method === "GET") {
      const bookmarks = await bookmarkTable.getBookmarks(id)
      return {
        success: true,
        bookmarks,
      }
    } else if (event.method === "POST") {
      const body = await readBody(event)
      const { newsId, sourceId, title, url, mobileUrl, pubDate } = body

      if (!newsId || !sourceId || !title || !url) {
        throw createError({
          statusCode: 400,
          message: "Missing required fields: newsId, sourceId, title, url",
        })
      }

      const bookmark = await bookmarkTable.addBookmark(
        id,
        newsId,
        sourceId,
        title,
        url,
        mobileUrl,
        pubDate,
      )

      return {
        success: true,
        bookmark,
      }
    } else if (event.method === "DELETE") {
      const query = getQuery(event)
      const bookmarkId = Number(query.id)

      if (!bookmarkId || Number.isNaN(bookmarkId)) {
        throw createError({
          statusCode: 400,
          message: "Missing or invalid bookmark id",
        })
      }

      await bookmarkTable.deleteBookmark(id, bookmarkId)

      return {
        success: true,
      }
    }

    throw createError({
      statusCode: 405,
      message: "Method not allowed",
    })
  } catch (e) {
    logger.error(e)
    throw createError({
      statusCode: (e as any).statusCode || 500,
      message: e instanceof Error ? e.message : "Internal Server Error",
    })
  }
})
