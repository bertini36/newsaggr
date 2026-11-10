import type { SourceID } from "@shared/types"
import { useUpdateQuery } from "./query"

export function useRefetch() {
  const { enableLogin, loggedIn, login } = useLogin()
  const toaster = useToast()
  const updateQuery = useUpdateQuery()
  /**
   * force refresh
   */
  const refresh = useCallback((...sources: SourceID[]) => {
    if (enableLogin && !loggedIn) {
      toaster("After logging in you can force‑fetch the latest data", {
        type: "warning",
        action: {
          label: "Login",
          onClick: login,
        },
      })
    } else {
      refetchSources.clear()
      sources.forEach(id => refetchSources.set(id, "latest"))
      updateQuery(...sources)
    }
  }, [loggedIn, toaster, login, enableLogin, updateQuery])

  /**
   * ask the server again for one source, whether or not the reader is logged in
   */
  const retry = useCallback((id: SourceID) => {
    refetchSources.set(id, "server")
    updateQuery(id)
  }, [updateQuery])

  return {
    refresh,
    retry,
    refetchSources,
  }
}
