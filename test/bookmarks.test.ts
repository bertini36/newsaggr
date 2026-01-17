import { beforeEach, describe, expect, it, vi } from "vitest"
import bookmarksHandler from "#/api/me/bookmarks"

const { mockGetQuery, mockReadBody, mockUseDatabase, mockAddBookmark, mockGetBookmarks, mockDeleteBookmark, mockInit } = vi.hoisted(() => {
  const mocks = {
    mockGetQuery: vi.fn(),
    mockReadBody: vi.fn(),
    mockUseDatabase: vi.fn(),
    mockCreateError: vi.fn((err: any) => {
      const error = new Error(err.message || "Unknown error")
      Object.assign(error, { statusCode: err.statusCode || 500, statusMessage: err.statusMessage })
      return error
    }),
    mockAddBookmark: vi.fn(),
    mockGetBookmarks: vi.fn(),
    mockDeleteBookmark: vi.fn(),
    mockInit: vi.fn(),
  };

  (globalThis as any).defineEventHandler = (handler: any) => handler;
  (globalThis as any).getQuery = mocks.mockGetQuery;
  (globalThis as any).readBody = mocks.mockReadBody;
  (globalThis as any).useDatabase = mocks.mockUseDatabase;
  (globalThis as any).createError = mocks.mockCreateError;
  (globalThis as any).logger = {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  }

  return mocks
})

// Mock BookmarkTable
vi.mock("#/database/bookmark", () => ({
  BookmarkTable: vi.fn().mockImplementation(() => ({
    addBookmark: mockAddBookmark,
    getBookmarks: mockGetBookmarks,
    deleteBookmark: mockDeleteBookmark,
    init: mockInit,
  })),
}))

vi.mock("#/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}))

describe("bookmarks API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.INIT_TABLE = "false"
    mockUseDatabase.mockReturnValue({})
  })

  // Helper to create a dummy event with user context
  const createEvent = (method: string, userId = "user-123") => ({
    method,
    context: {
      user: { id: userId },
    },
  } as any)

  describe("gET /me/bookmarks", () => {
    it("should return bookmarks for the user", async () => {
      const mockBookmarks = [
        { id: 1, title: "News 1", url: "http://news1.com" },
        { id: 2, title: "News 2", url: "http://news2.com" },
      ]
      mockGetBookmarks.mockResolvedValue(mockBookmarks)

      const event = createEvent("GET")
      const result = await bookmarksHandler(event)

      expect(mockGetBookmarks).toHaveBeenCalledWith("user-123")
      expect(result).toEqual({
        success: true,
        bookmarks: mockBookmarks,
      })
    })

    it("should handle database errors", async () => {
      mockGetBookmarks.mockRejectedValue(new Error("DB Error"))
      const event = createEvent("GET")

      await expect(bookmarksHandler(event)).rejects.toThrow("DB Error")
    })
  })

  describe("pOST /me/bookmarks", () => {
    const validBody = {
      newsId: "news-1",
      sourceId: "source-1",
      title: "News Title",
      url: "http://example.com/news",
      mobileUrl: "http://m.example.com/news",
      pubDate: 1234567890,
    }

    it("should add a bookmark successfully", async () => {
      mockReadBody.mockResolvedValue(validBody)
      mockAddBookmark.mockResolvedValue({ id: 1, ...validBody })

      const event = createEvent("POST")
      const result = await bookmarksHandler(event)

      expect(mockAddBookmark).toHaveBeenCalledWith(
        "user-123",
        validBody.newsId,
        validBody.sourceId,
        validBody.title,
        validBody.url,
        validBody.mobileUrl,
        validBody.pubDate,
      )
      expect(result).toEqual({
        success: true,
        bookmark: { id: 1, ...validBody },
      })
    })

    it("should fail if required fields are missing", async () => {
      mockReadBody.mockResolvedValue({ title: "Only Title" })
      const event = createEvent("POST")

      await expect(bookmarksHandler(event)).rejects.toEqual(expect.objectContaining({
        statusCode: 400,
        message: expect.stringContaining("Missing required fields"),
      }))
    })
  })

  describe("dELETE /me/bookmarks", () => {
    it("should delete a bookmark successfully", async () => {
      mockGetQuery.mockReturnValue({ id: "100" })
      const event = createEvent("DELETE")

      const result = await bookmarksHandler(event)

      expect(mockDeleteBookmark).toHaveBeenCalledWith("user-123", 100)
      expect(result).toEqual({ success: true })
    })

    it("should fail if id is missing", async () => {
      mockGetQuery.mockReturnValue({})
      const event = createEvent("DELETE")

      await expect(bookmarksHandler(event)).rejects.toEqual(expect.objectContaining({
        statusCode: 400,
        message: expect.stringContaining("Missing or invalid bookmark id"),
      }))
    })

    it("should fail if id is invalid", async () => {
      mockGetQuery.mockReturnValue({ id: "abc" })
      const event = createEvent("DELETE")

      await expect(bookmarksHandler(event)).rejects.toEqual(expect.objectContaining({
        statusCode: 400,
        message: expect.stringContaining("Missing or invalid bookmark id"),
      }))
    })
  })
})
