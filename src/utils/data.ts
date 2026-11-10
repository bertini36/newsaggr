import type { SourceID, SourceResponse } from "@shared/types"

export const cacheSources = new Map<SourceID, SourceResponse>()
/**
 * Sources whose next fetch skips the in-memory cache:
 * "latest" asks the server to bypass its own cache (logged in only), "server" takes whatever the server has.
 */
export const refetchSources = new Map<SourceID, "latest" | "server">()
/**
 * When each source was last requested from the server
 */
export const lastRequestedAt = new Map<SourceID, number>()
