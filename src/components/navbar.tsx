import React from "react"
import { fixedColumnIds, metadata } from "@shared/metadata"
import { Link } from "@tanstack/react-router"
import { currentColumnIDAtom } from "~/atoms"

export function NavBar() {
  const currentId = useAtomValue(currentColumnIDAtom)
  const { toggle } = useSearchBar()
  return (
    <nav className={$(
      "flex items-center gap-2 p-2 text-base",
    )}
    >
      <button
        type="button"
        onClick={() => toggle(true)}
        className={$(
          "cursor-pointer transition-colors",
          "px-3 py-1 tracking-wider font-semibold text-xl uppercase",
          "text-neutral-700 hover:text-neutral-700 hover:bg-neutral-100 rounded-md",
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
              "px-3 py-1 tracking-wider text-xl uppercase",
              "hover:bg-neutral-100 rounded-md",
              currentId === columnId
                ? `font-bold ${columnId === "focus" ? "text-red-400" : "text-neutral-700"}`
                : `font-semibold ${columnId === "focus" ? "text-red-400" : "text-neutral-500 hover:text-neutral-700"} hover:underline underline-offset-2`,
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
