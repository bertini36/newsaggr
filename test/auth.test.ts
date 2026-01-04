import { beforeEach, describe, expect, it, vi } from "vitest"

import githubHandler from "#/api/oauth/github"
import googleHandler from "#/api/oauth/google"

const { mockGetQuery, mockGetRequestURL, mockSendRedirect, mockUseDatabase, mockMyFetch, mockAddUser, mockGetUser, mockInit } = vi.hoisted(() => {
  const mocks = {
    mockGetQuery: vi.fn(),
    mockGetRequestURL: vi.fn(),
    mockSendRedirect: vi.fn(),
    mockUseDatabase: vi.fn(),
    mockMyFetch: vi.fn(),
    mockAddUser: vi.fn(),
    mockGetUser: vi.fn(),
    mockInit: vi.fn(),
  };

  (globalThis as any).defineEventHandler = (handler: any) => handler;
  (globalThis as any).getQuery = mocks.mockGetQuery;
  (globalThis as any).getRequestURL = mocks.mockGetRequestURL;
  (globalThis as any).sendRedirect = mocks.mockSendRedirect;
  (globalThis as any).useDatabase = mocks.mockUseDatabase;
  (globalThis as any).logger = {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  }

  return mocks
})

// Mock myFetch
vi.mock("#/utils/fetch", () => ({
  myFetch: mockMyFetch,
}))

// Mock UserTable
vi.mock("#/database/user", () => ({
  UserTable: vi.fn().mockImplementation(() => ({
    addUser: mockAddUser,
    getUser: mockGetUser,
    init: mockInit,
  })),
}))

describe("auth Login Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GITHUB_CLIENT_ID = "test-gh-id"
    process.env.GITHUB_CLIENT_SECRET = "test-gh-secret"
    process.env.GOOGLE_CLIENT_ID = "test-go-id"
    process.env.GOOGLE_CLIENT_SECRET = "test-go-secret"
    process.env.JWT_SECRET = "test-jwt-secret"
    process.env.INIT_TABLE = "false"

    mockUseDatabase.mockReturnValue({})
  })

  describe("gitHub Login", () => {
    it("should successfully login with GitHub", async () => {
      mockGetQuery.mockReturnValue({ code: "gh-code" })

      // Mock access token response
      mockMyFetch.mockResolvedValueOnce({
        access_token: "gh-access-token",
      })

      // Mock user info response
      mockMyFetch.mockResolvedValueOnce({
        id: 12345,
        name: "Test User",
        avatar_url: "https://avatar.url",
        email: "test@example.com",
        login: "testuser",
      })

      const event = {} as any
      await githubHandler(event)

      expect(mockMyFetch).toHaveBeenCalledWith(
        "https://github.com/login/oauth/access_token",
        expect.objectContaining({
          method: "POST",
          body: expect.objectContaining({
            code: "gh-code",
          }),
        }),
      )

      expect(mockMyFetch).toHaveBeenCalledWith(
        "https://api.github.com/user",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "token gh-access-token",
          }),
        }),
      )

      expect(mockAddUser).toHaveBeenCalledWith("12345", "test@example.com", "github", "testuser")
      expect(mockSendRedirect).toHaveBeenCalledWith(
        event,
        expect.stringContaining("login=github"),
      )
    })

    it("should handle GitHub API error", async () => {
      mockGetQuery.mockReturnValue({ code: "bad-code" })
      mockMyFetch.mockRejectedValueOnce(new Error("GitHub API Error"))

      const event = {} as any
      await expect(githubHandler(event)).rejects.toThrow("GitHub API Error")
    })
  })

  describe("google Login", () => {
    it("should successfully login with Google", async () => {
      mockGetQuery.mockReturnValue({ code: "go-code" })
      mockGetRequestURL.mockReturnValue({ origin: "http://localhost:3000" })

      // Mock access token response
      mockMyFetch.mockResolvedValueOnce({
        access_token: "go-access-token",
      })

      // Mock user info response
      mockMyFetch.mockResolvedValueOnce({
        sub: "google-id-123",
        name: "Google User",
        picture: "https://google.avatar",
        email: "google@example.com",
      })

      const event = {} as any
      await googleHandler(event)

      expect(mockMyFetch).toHaveBeenCalledWith(
        "https://oauth2.googleapis.com/token",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("code=go-code"),
        }),
      )

      expect(mockMyFetch).toHaveBeenCalledWith(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer go-access-token",
          }),
        }),
      )

      expect(mockAddUser).toHaveBeenCalledWith("google-id-123", "google@example.com", "google", "")
      expect(mockSendRedirect).toHaveBeenCalledWith(
        event,
        expect.stringContaining("login=google"),
      )
    })

    it("should handle Google API error", async () => {
      mockGetQuery.mockReturnValue({ code: "bad-code" })
      mockGetRequestURL.mockReturnValue({ origin: "http://localhost:3000" })
      mockMyFetch.mockRejectedValueOnce(new Error("Google API Error"))

      const event = {} as any
      await expect(googleHandler(event)).rejects.toThrow("Google API Error")
    })
  })
})
