import type { Database } from "db0"
import type { UserInfo } from "#/types"

export class UserTable {
  private db
  constructor(db: Database) {
    this.db = db
  }

  async init() {
    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        email TEXT,
        username TEXT,
        data TEXT,
        type TEXT,
        created INTEGER,
        updated INTEGER
      );
    `).run()
    await this.db.prepare(`
      ALTER TABLE user ADD COLUMN username TEXT;
    `).run().catch(() => { })
    await this.db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_user_id ON user(id);
    `).run()
    logger.success(`init user table`)
  }

  async addUser(id: string, email: string, type: "github" | "google", username?: string) {
    const u = await this.getUser(id)
    const now = Date.now()
    if (!u) {
      await this.db.prepare(`INSERT INTO user (id, email, username, data, type, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(id, email, username || "", "", type, now, now)
      logger.success(`add user ${id}`)
    } else if (u.email !== email || u.type !== type || u.username !== username) {
      await this.db.prepare(`UPDATE user SET email = ?, username = ?, updated = ? WHERE id = ?`).run(email, username || "", now, id)
      logger.success(`update user ${id} info`)
    } else {
      logger.info(`user ${id} already exists`)
    }
  }

  async getUser(id: string) {
    return (await this.db.prepare(`SELECT id, email, username, data, created, updated FROM user WHERE id = ?`).get(id)) as UserInfo
  }

  async setData(key: string, value: string, updatedTime = Date.now()) {
    const state = await this.db.prepare(
      `UPDATE user SET data = ?, updated = ? WHERE id = ?`,
    ).run(value, updatedTime, key)
    if (!state.success) throw new Error(`set user ${key} data failed`)
    logger.success(`set ${key} data`)
  }

  async getData(id: string) {
    const row: any = await this.db.prepare(`SELECT data, updated FROM user WHERE id = ?`).get(id)
    if (!row) throw new Error(`user ${id} not found`)
    logger.success(`get ${id} data`)
    return row as {
      data: string
      updated: number
    }
  }

  async deleteUser(key: string) {
    const state = await this.db.prepare(`DELETE FROM user WHERE id = ?`).run(key)
    if (!state.success) throw new Error(`delete user ${key} failed`)
    logger.success(`delete user ${key}`)
  }
}
