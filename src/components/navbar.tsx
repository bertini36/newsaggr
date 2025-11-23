import React from "react"
import { fixedColumnIds, metadata } from "@shared/metadata"
import { Link } from "@tanstack/react-router"
import { currentColumnIDAtom } from "~/atoms"

export function NavBar() {
  const currentId = useAtomValue(currentColumnIDAtom)
  const { toggle } = useSearchBar()
  return (
    <nav className={$(
      "flex items-center gap-2 p-2 text-base font-serif",
    )}
    >
      <button
        type="button"
        onClick={() => toggle(true)}
        className={$(
          "cursor-pointer transition-colors",
          "px-3 py-1 uppercase tracking-wider font-semibold text-lg",
          "text-neutral-500 hover:text-neutral-700",
        )}
      >
        Sources
      </button>

      <span className="mx-1" style={{ color: "#d4d4d4" }}>|</span>

      {fixedColumnIds.map((columnId, index) => (
        <React.Fragment key={columnId}>
          <Link
            to="/c/$column"
            params={{ column: columnId }}
            className={$(
              "cursor-pointer transition-colors",
              "px-3 py-1 uppercase tracking-wider text-lg",
              currentId === columnId
                ? "font-bold text-neutral-700"
                : "font-semibold text-neutral-500 hover:text-neutral-700 hover:underline underline-offset-2",
            )}
          >
            {metadata[columnId].name}
          </Link>
          {index < fixedColumnIds.length - 1 && (
            <span className="mx-1" style={{ color: "#d4d4d4" }}>|</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
