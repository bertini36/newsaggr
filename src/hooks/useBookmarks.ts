import type { NewsItem, SourceID } from "@shared/types"
import { bookmarksAtom, bookmarksInitializedAtom, bookmarksLoadingAtom } from "~/atoms/bookmarks"
import type { BookmarkItem } from "~/atoms/bookmarks"
import { safeParseString } from "~/utils"

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useAtom(bookmarksAtom)
  const [loading, setLoading] = useAtom(bookmarksLoadingAtom)
  const [initialized, setInitialized] = useAtom(bookmarksInitializedAtom)

  const fetchBookmarks = useCallback(async () => {
    const jwt = safeParseString(localStorage.getItem("jwt"))
    if (!jwt) return

    setLoading(true)
    try {
      const response = await myFetch("/me/bookmarks", {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      if (response.success) {
        setBookmarks(response.bookmarks)
      }
    } catch (e) {
      console.error("Failed to fetch bookmarks:", e)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [setBookmarks, setLoading, setInitialized])

  // Initialize bookmarks on mount
  useEffect(() => {
    if (!initialized) {
      fetchBookmarks()
    }
  }, [initialized, fetchBookmarks])

  const isBookmarked = useCallback((newsId: string | number) => {
    return bookmarks.some(b => b.news_id === String(newsId))
  }, [bookmarks])

  const getBookmark = useCallback((newsId: string | number): BookmarkItem | undefined => {
    return bookmarks.find(b => b.news_id === String(newsId))
  }, [bookmarks])

  const addBookmark = useCallback(async (item: NewsItem, sourceId: SourceID) => {
    const jwt = safeParseString(localStorage.getItem("jwt"))
    if (!jwt) {
      console.error("Not logged in")
      return false
    }

    setLoading(true)
    try {
      const response = await myFetch("/me/bookmarks", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newsId: String(item.id),
          sourceId,
          title: item.title,
          url: item.url,
          mobileUrl: item.mobileUrl,
          pubDate: item.pubDate ? (typeof item.pubDate === "number" ? item.pubDate : new Date(item.pubDate).getTime()) : undefined,
        }),
      })
      if (response.success && response.bookmark) {
        setBookmarks(prev => [response.bookmark, ...prev])
        return true
      }
    } catch (e) {
      console.error("Failed to add bookmark:", e)
    } finally {
      setLoading(false)
    }
    return false
  }, [setBookmarks, setLoading])

  const removeBookmark = useCallback(async (bookmarkId: number) => {
    const jwt = safeParseString(localStorage.getItem("jwt"))
    if (!jwt) return false

    setLoading(true)
    try {
      const response = await myFetch(`/me/bookmarks?id=${bookmarkId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
      })
      if (response.success) {
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
        return true
      }
    } catch (e) {
      console.error("Failed to remove bookmark:", e)
    } finally {
      setLoading(false)
    }
    return false
  }, [setBookmarks, setLoading])

  const toggleBookmark = useCallback(async (item: NewsItem, sourceId: SourceID) => {
    const existing = getBookmark(item.id)
    if (existing) {
      return removeBookmark(existing.id)
    } else {
      return addBookmark(item, sourceId)
    }
  }, [getBookmark, addBookmark, removeBookmark])

  return {
    bookmarks,
    loading,
    initialized,
    isBookmarked,
    getBookmark,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    refetch: fetchBookmarks,
  }
}
