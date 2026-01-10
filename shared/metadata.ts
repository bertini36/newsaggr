import { sources } from "./sources"
import { typeSafeObjectEntries, typeSafeObjectFromEntries } from "./type.util"
import type { ColumnID, HiddenColumnID, Metadata, SourceID } from "./types"

export const columns = {
  science: {
    zh: "Science",
  },
  tech: {
    zh: "Tech",
  },
  finance: {
    zh: "Finance",
  },
  entrepreneurship: {
    zh: "Entrepreneurship",
  },
  world: {
    zh: "World",
  },
  spain: {
    zh: "Spain",
  },
  focus: {
    zh: "Focus",
  },
  ai: {
    zh: "AI",
  },
} as const

export const fixedColumnIds = ["focus"] as const satisfies Partial<ColumnID>[]
export const hiddenColumns = Object.keys(columns).filter(id => !fixedColumnIds.includes(id as any)) as HiddenColumnID[]

export const metadata: Metadata = typeSafeObjectFromEntries(typeSafeObjectEntries(columns).map(([k, v]) => {
  switch (k) {
    case "focus":
      return [k, {
        name: v.zh,
        sources: [] as SourceID[],
      }]
    default:
      return [k, {
        name: v.zh,
        sources: typeSafeObjectEntries(sources).filter(([, v]) => v.column === k && !v.redirect).map(([k]) => k) as SourceID[],
      }]
  }
}))
