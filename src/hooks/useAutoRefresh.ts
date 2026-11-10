import type { SourceID } from "@shared/types"
import { isStale } from "@shared/freshness"
import { useQueryClient } from "@tanstack/react-query"
import { useUpdateQuery } from "./query"

const CHECK_INTERVAL = 60 * 1000

/**
 * Keeps the listed sources current while the app is open: a source asked for
 * more than its interval ago is requested again when the app comes back to
 * the foreground, the network returns, or every minute while visible. A source
 * whose last request failed is also requested again when the network returns.
 */
export function useAutoRefresh(items: SourceID[]) {
  const updateQuery = useUpdateQuery()
  const queryClient = useQueryClient()

  useEffect(() => {
    const refreshDue = (retryFailed: boolean) => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return
      const now = Date.now()
      const stale = items.filter(id =>
        isStale(lastRequestedAt.get(id), now, sources[id].interval)
        || (retryFailed && queryClient.getQueryState(["source", id])?.status === "error"),
      )
      if (!stale.length) return
      stale.forEach(id => refetchSources.set(id, "server"))
      updateQuery(...stale)
    }
    const onTick = () => refreshDue(false)
    const onOnline = () => refreshDue(true)
    const timer = setInterval(onTick, CHECK_INTERVAL)
    document.addEventListener("visibilitychange", onTick)
    window.addEventListener("online", onOnline)
    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", onTick)
      window.removeEventListener("online", onOnline)
    }
  }, [items, updateQuery, queryClient])
}
