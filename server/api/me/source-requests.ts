import process from "node:process"
import { SourceRequestTable } from "#/database/source_request"

export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.user
    const db = useDatabase()
    if (!db) throw new Error("Not found database")
    const sourceRequestTable = new SourceRequestTable(db)

    if (process.env.INIT_TABLE !== "false") await sourceRequestTable.init()

    if (event.method === "POST") {
      const body = await readBody(event)
      const { sourceName, category, url } = body

      if (!sourceName || !category || !url) {
        throw createError({
          statusCode: 400,
          message: "Missing required fields: sourceName, category, url",
        })
      }

      const request = await sourceRequestTable.addRequest(
        id,
        sourceName,
        category,
        url,
      )

      return {
        success: true,
        request,
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
