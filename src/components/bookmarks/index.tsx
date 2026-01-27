import { useTitle, useWindowSize } from "react-use"
import { Link } from "@tanstack/react-router"
import type { BookmarkItem } from "~/atoms/bookmarks"
import { ConfirmModal } from "~/components/common/confirm-modal"
import { DARK_MODE_INVERT_LOGOS } from "~/utils"

function BookmarkCard({ bookmark, onDelete }: { bookmark: BookmarkItem, onDelete: (id: number) => void }) {
  const { width } = useWindowSize()
  const sourceInfo = sources[bookmark.source_id]
  const relativeTime = useRelativeTime(bookmark.pub_date || bookmark.created)

  return (
    <div
      className={$([
        "flex items-start gap-3 p-4 rounded-lg",
        "bg-white dark:bg-github-card",
        "border border-neutral-200 dark:border-github-border",
        "shadow-sm dark:shadow-none",
        "transition-all hover:shadow-md dark:hover:border-neutral-600",
      ])}
    >
      {/* Source icon */}
      <a
        href={sourceInfo?.home}
        target="_blank"
        rel="noopener noreferrer"
        className={$([
          "flex-shrink-0 w-10 h-10 rounded-full bg-cover cursor-pointer",
          DARK_MODE_INVERT_LOGOS.includes(bookmark.source_id.split("-")[0]) && "dark:invert",
        ])}
        style={{
          backgroundImage: `url(/icons/${bookmark.source_id.split("-")[0]}.png)`,
        }}
        title={sourceInfo?.name}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {sourceInfo?.name || bookmark.source_id}
          </span>
          {sourceInfo?.title && (
            <span className="text-xs bg-neutral-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-neutral-500 dark:text-neutral-400">
              {sourceInfo.title}
            </span>
          )}
          <span className="text-xs text-neutral-400">
            {relativeTime}
          </span>
        </div>
        <a
          href={width < 768 ? bookmark.mobile_url || bookmark.url : bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className={$([
            "block text-base leading-snug cursor-pointer visited:(text-neutral-400/80)",
          ])}
        >
          {bookmark.title}
        </a>
      </div>

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onDelete(bookmark.id)}
        className={$([
          "flex-shrink-0 p-2 rounded-md transition-colors cursor-pointer",
          "text-neutral-500 dark:text-neutral-400 hover:text-red-400 hover:bg-red-400/10 dark:hover:bg-red-400/20",
        ])}
        title="Remove bookmark"
      >
        <span className="i-ph:trash text-xl block cursor-pointer" />
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="i-ph:bookmark-simple text-6xl text-red-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2 text-neutral-600 dark:text-neutral-300">
        No saved news yet
      </h3>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md">
        Click the bookmark icon on any news item to save it here for later reading.
      </p>
      <Link
        to="/"
        className={$([
          "px-4 py-2 rounded-md cursor-pointer transition-colors",
          "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900",
          "hover:bg-neutral-700 dark:hover:bg-neutral-200",
        ])}
      >
        Browse news
      </Link>
    </div>
  )
}

function LoginPrompt() {
  const { loginWithGoogle, loginWithGithub, providers } = useLogin()

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="i-ph:sign-in text-6xl text-neutral-300 dark:text-neutral-600 mb-4" />
      <h3 className="text-xl font-semibold mb-2 text-neutral-600 dark:text-neutral-300">
        Login required
      </h3>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md">
        Please log in to save and view your bookmarked news.
      </p>
      <div className="flex gap-3">
        {providers.google && (
          <button
            type="button"
            onClick={loginWithGoogle}
            className={$([
              "flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors",
              "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900",
              "hover:bg-neutral-700 dark:hover:bg-neutral-200",
            ])}
          >
            <span className="i-ph:google-logo" />
            Login with Google
          </button>
        )}
        {providers.github && (
          <button
            type="button"
            onClick={loginWithGithub}
            className={$([
              "flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors",
              "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900",
              "hover:bg-neutral-700 dark:hover:bg-neutral-200",
            ])}
          >
            <span className="i-ph:github-logo" />
            Login with GitHub
          </button>
        )}
      </div>
    </div>
  )
}

export function Bookmarks() {
  useTitle("Saved news - NewsAggr")

  const { loggedIn } = useLogin()
  const { bookmarks, loading, removeBookmark } = useBookmarks()
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = useCallback(async () => {
    if (deleteTarget === null) return

    setIsDeleting(true)
    await removeBookmark(deleteTarget)
    setIsDeleting(false)
    setDeleteTarget(null)
  }, [deleteTarget, removeBookmark])

  if (!loggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <LoginPrompt />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="i-ph:bookmark-simple-fill text-red-400" />
          Saved news
        </h1>
        {bookmarks.length > 0 && (
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {bookmarks.length}
            {" "}
            {bookmarks.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {loading && bookmarks.length === 0
        ? (
            <div className="flex items-center justify-center py-16">
              <span className="i-ph:circle-dashed animate-spin text-3xl text-neutral-400" />
            </div>
          )
        : bookmarks.length === 0
          ? (
              <EmptyState />
            )
          : (
              <div className="flex flex-col gap-3">
                {bookmarks.map(bookmark => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Remove bookmark"
        message="Are you sure you want to remove this bookmark? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}
