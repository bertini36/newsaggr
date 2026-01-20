import type { Database } from "db0"

export interface SourceRequest {
  id: number
  user_id: string
  source_name: string
  category: string
  url: string
  status: "pending" | "approved" | "rejected"
  created: number
}

export class SourceRequestTable {
  private db

  constructor(db: Database) {
    this.db = db
  }

  async init() {
    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS source_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        source_name TEXT NOT NULL,
        category TEXT NOT NULL,
        url TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created INTEGER NOT NULL
      );
    `).run()
    await this.db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_source_requests_user_id ON source_requests(user_id);
    `).run()
    logger.success(`init source_requests table`)
  }

  async addRequest(
    userId: string,
    sourceName: string,
    category: string,
    url: string,
  ): Promise<SourceRequest> {
    const now = Date.now()

    await this.db.prepare(`
      INSERT INTO source_requests (user_id, source_name, category, url, status, created)
      VALUES (?, ?, ?, ?, 'pending', ?)
    `).run(userId, sourceName, category, url, now)

    logger.success(`add source request for user ${userId}: ${sourceName}`)

    // Return the created request
    const request = await this.db.prepare(`
      SELECT * FROM source_requests WHERE user_id = ? AND source_name = ? AND created = ?
    `).get(userId, sourceName, now) as SourceRequest

    return request
  }

  async getRequests(userId?: string): Promise<SourceRequest[]> {
    let query = `SELECT * FROM source_requests`
    const params: string[] = []

    if (userId) {
      query += ` WHERE user_id = ?`
      params.push(userId)
    }

    query += ` ORDER BY created DESC`

    const rows = await this.db.prepare(query).all(...params) as SourceRequest[]
    logger.success(`get source requests: ${rows.length} items`)
    return rows
  }

  async getRequestById(id: number): Promise<SourceRequest | null> {
    const row = await this.db.prepare(`
      SELECT * FROM source_requests WHERE id = ?
    `).get(id) as SourceRequest | undefined
    return row || null
  }
}
