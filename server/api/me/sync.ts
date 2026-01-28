import process from "node:process"
import { UserTable } from "#/database/user"

export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.user
    const db = useDatabase()
    if (!db) throw new Error("Not found database")
    const userTable = new UserTable(db)
    if (process.env.INIT_TABLE !== "false") await userTable.init()
    if (event.method === "GET") {
      const { data: rawData, updated } = await userTable.getData(id)
      let data
      let preferences

      if (rawData) {
        const parsed = JSON.parse(rawData)
        if (parsed.data) {
          data = parsed.data
          preferences = parsed.preferences
        } else {
          data = parsed
        }
      }

      return {
        data,
        preferences,
        updatedTime: updated,
      }
    } else if (event.method === "POST") {
      const body = await readBody(event)
      verifyPrimitiveMetadata(body)
      const { updatedTime, data, preferences } = body
      await userTable.setData(id, JSON.stringify({ data, preferences }), updatedTime)
      return {
        success: true,
        updatedTime,
      }
    }
  } catch (e) {
    logger.error(e)
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "Internal Server Error",
    })
  }
})
