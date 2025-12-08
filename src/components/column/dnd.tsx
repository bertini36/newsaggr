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
import { isMobile } from "react-device-detect"
import { DndContext } from "../common/dnd"
import { useSortable } from "../common/dnd/useSortable"
import { OverlayScrollbar } from "../common/overlay-scrollbar"
import type { ItemsProps } from "./card"
import { CardWrapper } from "./card"
import { currentSourcesAtom } from "~/atoms"

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

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-16">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <span className="i-ph:star text-6xl text-red-400" />
          <h2 className="text-2xl font-bold text-neutral-700">No Sources in Focus</h2>
          <p className="text-base text-neutral-600">
            Click on
            {" "}
            <span className="font-semibold text-neutral-700">Sources</span>
            {" "}
            in the navbar to browse and add sources to your Focus page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <DndWrapper items={items} setItems={setItems} isSingleColumn={isMobile}>
      <OverlayScrollbar defer className="overflow-x-auto">
        <motion.ol
          className={isMobile
            ? "flex px-2 gap-6 pb-4 scroll-smooth"
            : "grid w-full gap-6 p-2"}
          ref={parent}
          style={isMobile
            ? {
              // Horizontal scrolling layout
              }
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
          {items.map((id, index) => (
            <motion.li
              key={id}
              className={$(isMobile && "flex-shrink-0", isMobile && index === 0 && "ml-2", isMobile && index === items.length - 1 && "mr-2")}
              style={isMobile ? { width: `${width - 16 > WIDTH ? WIDTH : width - 16}px` } : undefined}
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
              <SortableCardWrapper id={id} />
            </motion.li>
          ))}
        </motion.ol>
      </OverlayScrollbar>
      {isMobile && (
        <div className="flex justify-center">
          <span className="text-sm text-gray-500 text-center">Swipe to see more</span>
        </div>
      )}
    </DndWrapper>
  )
}

function DndWrapper({ items, setItems, isSingleColumn, children }: PropsWithChildren<{
  items: SourceID[]
  setItems: (items: SourceID[]) => void
  isSingleColumn: boolean
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
      axis: isSingleColumn ? "horizontal" : "vertical",
    })
    setItems(update)
  }, [items, setItems, isSingleColumn])
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
            className={$("w-8 h-8 rounded-full bg-cover")}
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
      OverlayContainer!.className += $(`bg-neutral-100`, !isiOS() && "rounded-2xl")
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
