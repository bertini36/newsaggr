import type { PropsWithChildren } from "react"
import type { SourceID } from "@shared/types"
import type { BaseEventPayload, ElementDragType } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types"
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { createPortal } from "react-dom"
import { useThrottleFn } from "ahooks"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { motion } from "framer-motion"
import { useWindowSize } from "react-use"
import { DndContext } from "../common/dnd"
import { useSortable } from "../common/dnd/useSortable"
import { OverlayScrollbar } from "../common/overlay-scrollbar"
import type { ItemsProps } from "./card"
import { CardWrapper } from "./card"
import { ReorderSheet } from "./reorder-sheet"
import { SourcePager } from "./source-pager"
import { useSearchBar } from "~/hooks/useSearch"
import { currentSourcesAtom, reorderSheetAtom } from "~/atoms"
import { DARK_MODE_INVERT_LOGOS } from "~/utils"

const AnimationDuration = 200
const WIDTH = 350
export function Dnd() {
  const [items, setItems] = useAtom(currentSourcesAtom)
  const [parent] = useAutoAnimate({ duration: AnimationDuration })
  useEntireQuery(items)
  const { width } = useWindowSize()
  const minWidth = useMemo(() => {
    // double padding = 32
    return Math.min(width - 32, WIDTH)
  }, [width])

  const { toggle } = useSearchBar()

  const isPhone = useIsPhone()
  const openReorderSheet = useSetAtom(reorderSheetAtom)
  const pagerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const syncActiveIndex = useCallback(() => {
    const el = pagerRef.current
    if (el) setActiveIndex(getPageIndex(el.scrollLeft, el.clientWidth, items.length))
  }, [items.length])

  const scrollToPage = useCallback((index: number) => {
    const el = pagerRef.current
    el?.scrollTo({ left: index * el.clientWidth, behavior: "smooth" })
  }, [])

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-16">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <span className="i-ph:star text-6xl text-red-400" />
          <h2 className="text-2xl font-bold text-neutral-700 dark:text-white">No Sources Selected</h2>
          <div className="text-base text-neutral-600 dark:text-neutral-400 flex flex-col gap-2">
            <p>
              Your news feed is currently empty.
            </p>
            <button
              type="button"
              onClick={() => toggle(true)}
              className="mt-2 inline-flex items-center justify-center gap-2 self-center h-12 px-6 rounded-full font-semibold cursor-pointer bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 active:opacity-80 transition-opacity"
            >
              <span className="i-ph:list-plus text-lg" />
              Add sources
            </button>
          </div>
        </div>
      </div>
    )
  }

  const list = (
    <motion.ol
      className={isPhone ? "flex" : "grid w-full gap-6 p-2"}
      ref={parent}
      style={isPhone
        ? undefined
        : {
            gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
          }}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {
          opacity: 0,
        },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: 0.1,
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {items.map(id => (
        <motion.li
          key={id}
          className={$(isPhone && "w-full shrink-0 snap-start snap-always")}
          transition={{
            type: "tween",
            duration: AnimationDuration / 1000,
          }}
          variants={{
            hidden: {
              y: 20,
              opacity: 0,
            },
            visible: {
              y: 0,
              opacity: 1,
            },
          }}
        >
          {isPhone ? <CardWrapper id={id} /> : <SortableCardWrapper id={id} />}
        </motion.li>
      ))}
    </motion.ol>
  )

  if (isPhone) {
    return (
      <>
        <div
          ref={pagerRef}
          onScroll={syncActiveIndex}
          className="overflow-x-auto snap-x snap-mandatory overscroll-x-contain scrollbar-hidden"
        >
          {list}
        </div>
        <SourcePager
          items={items}
          activeIndex={Math.min(activeIndex, items.length - 1)}
          onSelect={scrollToPage}
          onEdit={() => openReorderSheet(true)}
        />
        <ReorderSheet />
      </>
    )
  }

  return (
    <DndWrapper items={items} setItems={setItems}>
      <OverlayScrollbar defer className="overflow-x-auto">{list}</OverlayScrollbar>
    </DndWrapper>
  )
}

function DndWrapper({ items, setItems, children }: PropsWithChildren<{
  items: SourceID[]
  setItems: (items: SourceID[]) => void
}>) {
  const onDropTargetChange = useCallback(({ location, source }: BaseEventPayload<ElementDragType>) => {
    const traget = location.current.dropTargets[0]
    if (!traget?.data || !source?.data) return
    const closestEdgeOfTarget = extractClosestEdge(traget.data)
    const fromIndex = items.indexOf(source.data.id as SourceID)
    const toIndex = items.indexOf(traget.data.id as SourceID)
    if (fromIndex === toIndex || fromIndex === -1 || toIndex === -1) return
    const update = reorderWithEdge({
      list: items,
      startIndex: fromIndex,
      indexOfTarget: toIndex,
      closestEdgeOfTarget,
      axis: "vertical",
    })
    setItems(update)
  }, [items, setItems])
  // Avoid animation interference
  const { run } = useThrottleFn(onDropTargetChange, {
    leading: true,
    trailing: true,
    wait: AnimationDuration,
  })
  const { el } = useAtomValue(goToTopAtom)
  return (
    <DndContext onDropTargetChange={run} autoscroll={el ? { element: el } : undefined}>
      {children}
    </DndContext>
  )
}

function CardOverlay({ id }: { id: SourceID }) {
  return (
    <div className={$(
      "flex flex-col p-4 backdrop-blur-5",
      !isiOS() && "rounded-2xl",
    )}
    >
      <div className={$("flex justify-between mx-2 items-center")}>
        <div className="flex gap-2 items-center">
          <div
            className={$("w-8 h-8 rounded-full bg-cover", DARK_MODE_INVERT_LOGOS.includes(id.split("-")[0]) && "dark:invert")}
            style={{
              backgroundImage: `url(/icons/${id.split("-")[0]}.png)`,
            }}
          />
          <span className="flex flex-col">
            <span className="flex items-center gap-2">
              <span className="text-xl font-bold">
                {sources[id].name}
              </span>
              {sources[id]?.title && <span className={$("text-sm", "bg-base op-80 bg-op-50! px-1 rounded")}>{sources[id].title}</span>}
            </span>
            <span className="text-xs op-70">Dragging</span>
          </span>
        </div>
        <div className={$("flex gap-2 text-lg")}>
          <button
            type="button"
            className={$("i-ph:dots-six-vertical-duotone", "cursor-grabbing")}
          />
        </div>
      </div>
    </div>
  )
}

function SortableCardWrapper({ id }: ItemsProps) {
  const {
    isDragging,
    setNodeRef,
    setHandleRef,
    OverlayContainer,
  } = useSortable({ id })

  useEffect(() => {
    if (OverlayContainer) {
      OverlayContainer!.className += $(`bg-neutral-100 dark:bg-github-card`, !isiOS() && "rounded-2xl")
    }
  }, [OverlayContainer])

  return (
    <>
      <CardWrapper
        ref={setNodeRef}
        id={id}
        isDragging={isDragging}
        setHandleRef={setHandleRef}
      />
      {OverlayContainer && createPortal(<CardOverlay id={id} />, OverlayContainer)}
    </>
  )
}
