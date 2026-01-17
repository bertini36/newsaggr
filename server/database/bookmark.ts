import type { Database } from "db0"
import type { SourceID } from "@shared/types"

export interface Bookmark {
  id: number
  user_id: string
  news_id: string
  source_id: SourceID
  title: string
  url: string
  mobile_url?: string
  pub_date?: number
  created: number
}

export class BookmarkTable {
  private db

  constructor(db: Database) {
    this.db = db
  }

  async init() {
    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        news_id TEXT NOT NULL,
        source_id TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        mobile_url TEXT,
        pub_date INTEGER,
        created INTEGER NOT NULL,
        UNIQUE(user_id, news_id)
      );
    `).run()
    await this.db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
    `).run()
    logger.success(`init bookmarks table`)
  }

  async addBookmark(
    userId: string,
    newsId: string,
    sourceId: SourceID,
    title: string,
    url: string,
    mobileUrl?: string,
    pubDate?: number,
  ): Promise<Bookmark> {
    const now = Date.now()
    const existing = await this.hasBookmark(userId, newsId)
    if (existing) {
      throw new Error("Bookmark already exists")
    }

    await this.db.prepare(`
      INSERT INTO bookmarks (user_id, news_id, source_id, title, url, mobile_url, pub_date, created)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, newsId, sourceId, title, url, mobileUrl || null, pubDate || null, now)

    logger.success(`add bookmark for user ${userId}: ${newsId}`)

    // Return the created bookmark
    const bookmark = await this.db.prepare(`
      SELECT * FROM bookmarks WHERE user_id = ? AND news_id = ?
    `).get(userId, newsId) as Bookmark

    return bookmark
  }

  async getBookmarks(userId: string): Promise<Bookmark[]> {
    const rows = await this.db.prepare(`
      SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created DESC
    `).all(userId) as Bookmark[]
    logger.success(`get bookmarks for user ${userId}: ${rows.length} items`)
    return rows
  }

  async deleteBookmark(userId: string, bookmarkId: number): Promise<void> {
    const state = await this.db.prepare(`
      DELETE FROM bookmarks WHERE user_id = ? AND id = ?
    `).run(userId, bookmarkId)
    if (!state.success) {
      throw new Error(`delete bookmark ${bookmarkId} failed`)
    }
    logger.success(`delete bookmark ${bookmarkId} for user ${userId}`)
  }

  async hasBookmark(userId: string, newsId: string): Promise<boolean> {
    const row = await this.db.prepare(`
      SELECT id FROM bookmarks WHERE user_id = ? AND news_id = ?
    `).get(userId, newsId)
    return !!row
  }

  async getBookmarkByNewsId(userId: string, newsId: string): Promise<Bookmark | null> {
    const row = await this.db.prepare(`
      SELECT * FROM bookmarks WHERE user_id = ? AND news_id = ?
    `).get(userId, newsId) as Bookmark | undefined
    return row || null
  }
}
