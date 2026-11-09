import { Link, useLocation } from "@tanstack/react-router"
import { useIsFetching } from "@tanstack/react-query"
import type { SourceID } from "@shared/types"
import { DarkModeToggle } from "../common/dark-mode-toggle"
import { Menu } from "./menu"
import { currentSourcesAtom, goToTopAtom } from "~/atoms"

function GoTop() {
  const { ok, fn: goToTop } = useAtomValue(goToTopAtom)
  return (
    <button
      type="button"
      title="Go to top"
      aria-label="Go to top"
      className={$("icon-btn", ok ? "op-100" : "op-0 pointer-events-none max-md:hidden")}
      onClick={goToTop}
    >
      <span className="i-ph:arrow-fat-up" />
    </button>
  )
}

function Refresh() {
  const currentSources = useAtomValue(currentSourcesAtom)
  const { refresh } = useRefetch()
  const refreshAll = useCallback(() => refresh(...currentSources), [refresh, currentSources])

  const isFetching = useIsFetching({
    predicate: (query) => {
      const [type, id] = query.queryKey as ["source" | "entire", SourceID]
      return (type === "source" && currentSources.includes(id)) || type === "entire"
    },
  })

  return (
    <button
      type="button"
      title="Refresh"
      aria-label="Refresh all sources"
      className="icon-btn"
      onClick={refreshAll}
    >
      <span className={$("i-ph:arrow-counter-clockwise", isFetching && "animate-spin i-ph:circle-dashed")} />
    </button>
  )
}

export function Header() {
  const location = useLocation()
  const isSavedPage = location.pathname === "/saved"

  return (
    <>
      <span className="flex justify-self-start items-center">
        <Link to="/" className="flex gap-1.5 md:gap-0.5 items-center" aria-label="NewsAggr home">
          <div className="h-8 w-8 md:h-14 md:w-14 bg-cover" style={{ backgroundImage: "url(/header-logo.svg)" }} />
          <span className="text-xl font-brand leading-none md:hidden">NewsAggr</span>
          <span className="hidden md:block text-2xl font-brand line-height-none!">
            <p>News</p>
            <p className="mt--1">
              <span>Aggr</span>
            </p>
          </span>
        </Link>
        <a target="_blank" href={`${Homepage}/releases/tag/v${Version}`} className="btn text-sm ml-1 font-mono max-md:hidden">
          {`v${Version}`}
        </a>
      </span>
      <span className="justify-self-center">
      </span>
      <span className="justify-self-end flex gap-0.5 md:gap-1 items-center -mr-2 md:mr-0">
        <GoTop />
        {!isSavedPage && <Refresh />}
        <DarkModeToggle />
        <Menu />
      </span>
    </>
  )
}
