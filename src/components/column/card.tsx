import type { NewsItem, SourceID, SourceResponse } from "@shared/types"
import { useQuery } from "@tanstack/react-query"
import { useInView } from "framer-motion"
import { forwardRef, useImperativeHandle } from "react"
import { DARK_MODE_INVERT_LOGOS, safeParseString } from "~/utils"
import { ConfirmModal } from "~/components/common/confirm-modal"

export interface ItemsProps extends React.HTMLAttributes<HTMLDivElement> {
  id: SourceID
  /**
   * Whether to show opacity, style of original card during dragging
   */
  isDragging?: boolean
  setHandleRef?: (ref: HTMLElement | null) => void
}

interface NewsCardProps {
  id: SourceID
  setHandleRef?: (ref: HTMLElement | null) => void
}

export const CardWrapper = forwardRef<HTMLElement, ItemsProps>(({ id, isDragging, setHandleRef, style, ...props }, dndRef) => {
  const ref = useRef<HTMLDivElement>(null)
  const isPhone = useIsPhone()

  const inView = useInView(ref, {
    once: true,
  })

  useImperativeHandle(dndRef, () => ref.current! as HTMLDivElement)

  return (
    <div
      ref={ref}
      className={$(
        "relative flex flex-col cursor-default transition-opacity-300",
        isPhone
          ? "phone-card-h px-3"
          : "h-[calc(100vh-250px)] min-h-500px p-4 border border-neutral-200 dark:border-github-border rounded-lg dark:bg-github-card",
      )}
      style={{
        transformOrigin: "50% 50%",
        ...style,
      }}
      {...props}
    >
      {inView && <NewsCard key={id} id={id} setHandleRef={isPhone ? undefined : setHandleRef} />}
    </div>
  )
})

function NewsCard({ id, setHandleRef }: NewsCardProps) {
  const { refresh } = useRefetch()
  const { data, isFetching, isError } = useQuery({
    queryKey: ["source", id],
    queryFn: async ({ queryKey }) => {
      const id = queryKey[1] as SourceID
      let url = `/s?id=${id}`
      const headers: Record<string, any> = {}
      if (refetchSources.has(id)) {
        url = `/s?id=${id}&latest`
        const jwt = safeParseString(localStorage.getItem("jwt"))
        if (jwt) headers.Authorization = `Bearer ${jwt}`
        refetchSources.delete(id)
      } else if (cacheSources.has(id)) {
        // wait animation
        await delay(200)
        return cacheSources.get(id)
      }

      const response: SourceResponse = await myFetch(url, {
        headers,
      })

      function diff() {
        try {
          if (response.items && cacheSources.has(id)) {
            response.items.forEach((item, i) => {
              const o = cacheSources.get(id)!.items.findIndex(k => k.id === item.id)
              item.extra = {
                ...item?.extra,
                diff: o === -1 ? undefined : o - i,
              }
            })
          }
        } catch (e) {
          console.error(e)
        }
      }

      diff()

      cacheSources.set(id, response)
      return response
    },

    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const { isFocused, toggleFocus } = useFocusWith(id)
  const [showUnpinConfirm, setShowUnpinConfirm] = useState(false)

  const handleStarClick = useCallback(() => {
    if (isFocused) {
      // When unpinning, show confirmation modal
      setShowUnpinConfirm(true)
    } else {
      // When pinning, do it immediately
      toggleFocus()
    }
  }, [isFocused, toggleFocus])

  const handleConfirmUnpin = useCallback(() => {
    toggleFocus()
    setShowUnpinConfirm(false)
  }, [toggleFocus])

  return (
    <>
      <div className="flex justify-between items-center gap-2 pb-1 md:(mx-2 pb-2)">
        <div className="flex gap-2 items-center min-w-0">
          <a
            className={$("w-8 h-8 shrink-0 rounded-full bg-cover cursor-pointer", DARK_MODE_INVERT_LOGOS.includes(id.split("-")[0]) && "dark:invert")}
            target="_blank"
            href={sources[id].home}
            title={sources[id].desc}
            aria-label={`Open ${sources[id].name}`}
            style={{
              backgroundImage: `url(/icons/${id.split("-")[0]}.png)`,
            }}
          />
          <span className="flex flex-col min-w-0">
            <span className="flex items-center gap-2 min-w-0">
              <a
                className="text-xl md:text-2xl font-bold cursor-pointer font-serif leading-tight truncate"
                title={sources[id].desc}
                target="_blank"
                href={sources[id].home}
              >
                {sources[id].name}
              </a>
              {sources[id]?.title && <span className="shrink-0 text-xs bg-neutral-500/15 px-1.5 rounded text-neutral-600 dark:text-neutral-300">{sources[id].title}</span>}
            </span>
            <span className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="truncate"><UpdatedTime isError={isError} updatedTime={data?.updatedTime} /></span>
              {sources[id].column && (
                <span className="shrink-0 text-[11px] uppercase tracking-wider bg-neutral-500/15 px-1.5 py-0.5 rounded font-medium">
                  {metadata[sources[id].column!].name}
                </span>
              )}
            </span>
          </span>
        </div>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            className="icon-btn"
            title="Refresh"
            aria-label={`Refresh ${sources[id].name}`}
            onClick={() => refresh(id)}
          >
            <span className={$("i-ph:arrow-counter-clockwise", isFetching && "animate-spin i-ph:circle-dashed")} />
          </button>
          <button
            type="button"
            className={$("icon-btn", isFocused && "text-red-400! dark:text-red-400!")}
            onClick={handleStarClick}
            title={isFocused ? "Remove from focus" : "Add to Focus"}
            aria-label={isFocused ? `Remove ${sources[id].name} from focus` : `Add ${sources[id].name} to focus`}
            aria-pressed={isFocused}
          >
            <span className={isFocused ? "i-ph:star-fill" : "i-ph:star"} />
          </button>
          {/* firefox cannot drag a button */}
          {setHandleRef && (
            <div
              ref={setHandleRef}
              className="icon-btn cursor-grab"
            >
              <span className="i-ph:dots-six-vertical" />
            </div>
          )}
        </div>
      </div>

      <div className="h-full pb-4 overflow-y-auto overscroll-contain bg-transparent md:(px-2 pb-2)">
        <div className={$("transition-opacity-500", isFetching && !!data?.items?.length && "op-50")}>
          {!!data?.items?.length && <NewsList items={data.items} sourceId={id} />}
          {!data?.items?.length && isError && <ErrorState name={sources[id].name} onRetry={() => refresh(id)} />}
          {!data && !isError && <ListSkeleton />}
        </div>
      </div>

      <ConfirmModal
        isOpen={showUnpinConfirm}
        title="Remove from focus"
        message={`Are you sure you want to remove "${sources[id].name}" from your focused sources?`}
        confirmText="Remove"
        cancelText="Keep"
        onConfirm={handleConfirmUnpin}
        onCancel={() => setShowUnpinConfirm(false)}
      />
    </>
  )
}

function UpdatedTime({ isError, updatedTime }: { updatedTime: any, isError: boolean }) {
  const relativeTime = useRelativeTime(updatedTime ?? "")
  if (relativeTime) return `Updated ${relativeTime}`
  if (isError) return "Failed to load"
  return "Loading..."
}

function ExtraInfo({ item }: { item: NewsItem }) {
  if (item?.extra?.info) {
    return <>{item.extra.info}</>
  }
  if (item?.extra?.icon) {
    const { url, scale } = typeof item.extra.icon === "string" ? { url: item.extra.icon, scale: undefined } : item.extra.icon
    return (
      <img
        src={url}
        style={{
          transform: `scale(${scale ?? 1})`,
        }}
        className="h-4 inline mt--1"
        onError={e => e.currentTarget.style.display = "none"}
      />
    )
  }
}

function NewsUpdatedTime({ date }: { date: string | number }) {
  const relativeTime = useRelativeTime(date)
  return <>{relativeTime}</>
}

const SKELETON_ROWS = [
  { id: "a", width: "w-11/12" },
  { id: "b", width: "w-9/12" },
  { id: "c", width: "w-full" },
  { id: "d", width: "w-10/12" },
  { id: "e", width: "w-8/12" },
  { id: "f", width: "w-11/12" },
  { id: "g", width: "w-9/12" },
  { id: "h", width: "w-10/12" },
]

function ListSkeleton() {
  return (
    <ol aria-busy="true" className="flex flex-col animate-pulse">
      {SKELETON_ROWS.map(row => (
        <li key={row.id} className="flex flex-col gap-2 py-3 border-b border-neutral-200 dark:border-white/10">
          <span className={$("h-4 rounded bg-neutral-500/15", row.width)} />
          <span className="h-4 w-2/3 rounded bg-neutral-500/15" />
          <span className="h-3 w-16 rounded bg-neutral-500/10" />
        </li>
      ))}
    </ol>
  )
}

function ErrorState({ name, onRetry }: { name: string, onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="i-ph:wifi-slash text-4xl text-neutral-400" />
      <p className="text-neutral-600 dark:text-neutral-300">{`Couldn't load ${name}.`}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 h-11 px-5 rounded-full cursor-pointer bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 active:opacity-80 transition-opacity"
      >
        <span className="i-ph:arrow-counter-clockwise" />
        Try again
      </button>
    </div>
  )
}

function NewsList({ items, sourceId }: { items: NewsItem[], sourceId: SourceID }) {
  const isPhone = useIsPhone()
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const { loggedIn } = useLogin()

  // Deduplicate items by title, keeping only the first occurrence
  const uniqueItems = items?.filter((item, index, array) => {
    return array.findIndex(i => i.title === item.title) === index
  }) || []

  return (
    <ol className="flex flex-col">
      {uniqueItems.map((item) => {
        const date = item.pubDate || item?.extra?.date
        const hasExtra = !!(item.extra?.info || item.extra?.icon)
        return (
          <li
            key={`${item.id}-${date || ""}`}
            className="flex items-stretch gap-1 border-b last:border-b-0 border-neutral-200 dark:border-white/10"
          >
            <a
              className={$(
                "flex-1 min-w-0 py-3 pl-1 pr-2 rounded-md transition-colors [&_*]:cursor-pointer",
                "active:bg-neutral-500/10 md:hover:bg-neutral-400/10 dark:md:hover:bg-white/5",
                "visited:text-neutral-500 dark:visited:text-github-muted",
              )}
              href={isPhone ? item.mobileUrl || item.url : item.url}
              title={item.extra?.hover}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="block text-[17px] leading-snug [text-wrap:pretty]">{item.title}</span>
              <span className="mt-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                {date && <NewsUpdatedTime date={date} />}
                {date && hasExtra && <span aria-hidden="true">·</span>}
                <ExtraInfo item={item} />
              </span>
            </a>
            {loggedIn && (
              <button
                type="button"
                onClick={() => toggleBookmark(item, sourceId)}
                className={$("icon-btn self-start mt-0.5", isBookmarked(item.id) && "text-red-400! dark:text-red-400!")}
                title={isBookmarked(item.id) ? "Remove bookmark" : "Save for later"}
                aria-label={isBookmarked(item.id) ? "Remove bookmark" : "Save for later"}
                aria-pressed={isBookmarked(item.id)}
              >
                <span className={isBookmarked(item.id) ? "i-ph:bookmark-simple-fill" : "i-ph:bookmark-simple"} />
              </button>
            )}
          </li>
        )
      })}
    </ol>
  )
}
