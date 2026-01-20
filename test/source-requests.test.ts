import { beforeEach, describe, expect, it, vi } from "vitest"
import sourceRequestsHandler from "#/api/me/source-requests"

const { mockReadBody, mockUseDatabase, mockAddRequest, mockInit } = vi.hoisted(() => {
  const mocks = {
    mockReadBody: vi.fn(),
    mockUseDatabase: vi.fn(),
    mockCreateError: vi.fn((err: any) => {
      const error = new Error(err.message || "Unknown error")
      Object.assign(error, { statusCode: err.statusCode || 500, statusMessage: err.statusMessage })
      return error
    }),
    mockAddRequest: vi.fn(),
    mockInit: vi.fn(),
  };

  (globalThis as any).defineEventHandler = (handler: any) => handler;
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

// Mock SourceRequestTable
vi.mock("#/database/source_request", () => ({
  SourceRequestTable: vi.fn().mockImplementation(() => ({
    addRequest: mockAddRequest,
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

describe("source-requests API", () => {
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

  describe("pOST /me/source-requests", () => {
    const validBody = {
      sourceName: "TechCrunch",
      category: "tech",
      url: "https://techcrunch.com",
    }

    it("should add a source request successfully", async () => {
      mockReadBody.mockResolvedValue(validBody)
      mockAddRequest.mockResolvedValue({ id: 1, ...validBody, user_id: "user-123", status: "pending", created: Date.now() })

      const event = createEvent("POST")
      const result = await sourceRequestsHandler(event)

      expect(mockAddRequest).toHaveBeenCalledWith(
        "user-123",
        validBody.sourceName,
        validBody.category,
        validBody.url,
      )
      expect(result).toEqual({
        success: true,
        request: expect.objectContaining({
          id: 1,
          sourceName: validBody.sourceName,
          category: validBody.category,
          url: validBody.url,
        }),
      })
    })

    it("should fail if required fields are missing", async () => {
      mockReadBody.mockResolvedValue({ sourceName: "Only Name" })
      const event = createEvent("POST")

      await expect(sourceRequestsHandler(event)).rejects.toEqual(expect.objectContaining({
        statusCode: 400,
        message: expect.stringContaining("Missing required fields"),
      }))
    })

    it("should fail if category is missing", async () => {
      mockReadBody.mockResolvedValue({ sourceName: "Name", url: "https://example.com" })
      const event = createEvent("POST")

      await expect(sourceRequestsHandler(event)).rejects.toEqual(expect.objectContaining({
        statusCode: 400,
        message: expect.stringContaining("Missing required fields"),
      }))
    })

    it("should handle database errors", async () => {
      mockReadBody.mockResolvedValue(validBody)
      mockAddRequest.mockRejectedValue(new Error("DB Error"))
      const event = createEvent("POST")

      await expect(sourceRequestsHandler(event)).rejects.toThrow("DB Error")
    })
  })

  describe("unsupported methods", () => {
    it("should return 405 for GET requests", async () => {
      const event = createEvent("GET")

      await expect(sourceRequestsHandler(event)).rejects.toEqual(expect.objectContaining({
        statusCode: 405,
        message: "Method not allowed",
      }))
    })

    it("should return 405 for DELETE requests", async () => {
      const event = createEvent("DELETE")

      await expect(sourceRequestsHandler(event)).rejects.toEqual(expect.objectContaining({
        statusCode: 405,
        message: "Method not allowed",
      }))
    })
  })
})
