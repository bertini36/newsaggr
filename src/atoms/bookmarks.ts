import type { SourceID } from "@shared/types"

export interface BookmarkItem {
  id: number
  user_id: string
  news_id: string
  source_id: SourceID
  title: string
  url: string
  mobile_url?: string
  pub_date?: number
  created: number
}

export const bookmarksAtom = atom<BookmarkItem[]>([])
export const bookmarksLoadingAtom = atom<boolean>(false)
export const bookmarksInitializedAtom = atom<boolean>(false)
