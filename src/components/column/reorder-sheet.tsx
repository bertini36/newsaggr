import type { PointerEvent } from "react"
import type { SourceID } from "@shared/types"
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder"
import { createPortal } from "react-dom"
import { AnimatePresence, Reorder, motion, useDragControls, useIsPresent } from "framer-motion"
import { currentSourcesAtom, reorderSheetAtom } from "~/atoms"
import { useSearchBar } from "~/hooks/useSearch"
import { DARK_MODE_INVERT_LOGOS } from "~/utils"

export function ReorderSheet() {
  const open = useAtomValue(reorderSheetAtom)
  return <AnimatePresence>{open && <Sheet />}</AnimatePresence>
}

function Sheet() {
  const setOpen = useSetAtom(reorderSheetAtom)
  const [items, setItems] = useAtom(currentSourcesAtom)
  const { toggle } = useSearchBar()
  const isPresent = useIsPresent()
  const doneRef = useRef<HTMLButtonElement>(null)

  const done = useCallback(() => setOpen(false), [setOpen])

  // Every move is saved at once, so rotating the phone or leaving the page mid-drag loses nothing
  useEffect(() => () => setOpen(false), [setOpen])

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    doneRef.current?.focus()
    return () => opener?.focus()
  }, [])

  // Keeps Tab and screen readers inside the sheet while it is open
  useEffect(() => {
    const app = document.getElementById("app")
    if (!app || !isPresent) return
    app.inert = true
    return () => {
      app.inert = false
    }
  }, [isPresent])

  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") done()
    }
    document.addEventListener("keydown", closeOnEscape)
    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [done])

  return createPortal(
    <>
      <motion.div
        className="fixed inset-0 z-998 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={done}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Reorder sources"
        className="fixed inset-x-0 bottom-0 z-999 flex max-h-[85dvh] flex-col rounded-t-2xl border-t border-neutral-200 dark:border-github-border bg-white dark:bg-github-card text-neutral-800 dark:text-white pb-[env(safe-area-inset-bottom)]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "tween", duration: 0.2 }}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-neutral-400/50" />
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-3">
          <div>
            <h2 className="text-lg font-bold leading-tight">Your sources</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Hold the handle and drag to reorder</p>
          </div>
          <button
            ref={doneRef}
            type="button"
            onClick={done}
            className="inline-flex h-11 items-center px-5 rounded-full font-semibold cursor-pointer bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 active:opacity-80 transition-opacity"
          >
            Done
          </button>
        </div>
        <motion.div layoutScroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <Reorder.Group as="ol" axis="y" values={items} onReorder={setItems}>
            {items.map((id, index) => (
              <SourceRow
                key={id}
                id={id}
                onMove={step => setItems(reorder({ list: items, startIndex: index, finishIndex: index + step }))}
              />
            ))}
          </Reorder.Group>
        </motion.div>
        <button
          type="button"
          onClick={() => {
            done()
            toggle(true)
          }}
          className="flex shrink-0 items-center gap-3 px-4 min-h-14 border-t border-neutral-200 dark:border-white/10 cursor-pointer active:bg-neutral-500/15 transition-colors"
        >
          <span className="i-ph:list-plus text-lg" />
          Add sources
        </button>
      </motion.div>
    </>,
    document.body,
  )
}

function SourceRow({ id, onMove }: { id: SourceID, onMove: (step: -1 | 1) => void }) {
  const controls = useDragControls()
  const slug = id.split("-")[0]
  const { name, title } = sources[id]

  return (
    <Reorder.Item
      as="li"
      value={id}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)" }}
      className="relative flex min-h-14 items-center gap-3 pl-4 pr-1 bg-white dark:bg-github-card border-b border-neutral-200 dark:border-white/10"
    >
      <span
        className={$("size-8 shrink-0 rounded-full bg-cover", DARK_MODE_INVERT_LOGOS.includes(slug) && "dark:invert")}
        style={{ backgroundImage: `url(/icons/${slug}.png)` }}
      />
      <span className="min-w-0 flex-1 truncate font-serif text-lg font-bold">{name}</span>
      {title && <span className="shrink-0 text-xs bg-neutral-500/15 px-1.5 rounded text-neutral-600 dark:text-neutral-300">{title}</span>}
      <button
        type="button"
        aria-label={`Move ${name}`}
        className="icon-btn cursor-grab touch-none"
        onPointerDown={(e: PointerEvent) => controls.start(e)}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault()
            onMove(e.key === "ArrowUp" ? -1 : 1)
          }
        }}
      >
        <span className="i-ph:dots-six-vertical" />
      </button>
    </Reorder.Item>
  )
}
