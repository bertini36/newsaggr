import type { SourceID } from "@shared/types"
import { DARK_MODE_INVERT_LOGOS } from "~/utils"

interface SourcePagerProps {
  items: SourceID[]
  activeIndex: number
  onSelect: (index: number) => void
}

export function SourcePager({ items, activeIndex, onSelect }: SourcePagerProps) {
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" })
  }, [activeIndex])

  return (
    <nav
      aria-label="Sources"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 dark:border-white/10 bg-[#FBFBFB] dark:bg-github-main pb-[env(safe-area-inset-bottom)]"
    >
      <ol className="flex items-center gap-1 px-2 h-[var(--tabbar-h)] overflow-x-auto scrollbar-hidden">
        {items.map((id, index) => {
          const isActive = index === activeIndex
          const slug = id.split("-")[0]
          return (
            <li key={id} className="shrink-0">
              <button
                ref={isActive ? activeRef : undefined}
                type="button"
                aria-label={sources[id].name}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelect(index)}
                className={$(
                  "flex items-center gap-2 h-11 rounded-full px-2.5 transition-colors cursor-pointer",
                  isActive ? "bg-neutral-500/15 text-neutral-900 dark:text-white" : "op-60 active:bg-neutral-500/10",
                )}
              >
                <span
                  className={$("size-6 shrink-0 rounded-full bg-cover", DARK_MODE_INVERT_LOGOS.includes(slug) && "dark:invert")}
                  style={{ backgroundImage: `url(/icons/${slug}.png)` }}
                />
                {isActive && <span className="max-w-36 truncate text-sm font-medium">{sources[id].name}</span>}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
