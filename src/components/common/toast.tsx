import { useCallback, useRef } from "react"
import { useMount } from "react-use"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import type { ToastItem } from "~/atoms/types"
import { Timer } from "~/utils"

export function Toast() {
  const toastItems = useAtomValue(toastAtom)
  const [parent] = useAutoAnimate({ duration: 200 })
  return (
    <ol
      ref={parent}
      className={$(
        "fixed z-99 flex flex-col gap-2",
        // Just under the header on phones, so it clears the source bar on every route
        "inset-x-3 top-[calc(var(--header-h)+env(safe-area-inset-top)+0.5rem)]",
        "md:(inset-x-auto top-4 left-1/2 w-80 -translate-x-1/2)",
      )}
    >
      {
        toastItems.map(k => <Item key={k.id} info={k} />)
      }
    </ol>
  )
}

function Item({ info }: { info: ToastItem }) {
  const setToastItems = useSetAtom(toastAtom)
  const hidden = useCallback((dismiss = true) => {
    setToastItems(prev => prev.filter(k => k.id !== info.id))
    if (dismiss) {
      info.onDismiss?.()
    }
  }, [info, setToastItems])
  const timer = useRef<Timer | null>(null)

  useMount(() => {
    timer.current = new Timer(() => {
      hidden(true)
    }, info.duration ?? 5000)
    return () => timer.current?.clear()
  })

  const [hoverd, setHoverd] = useState(false)
  useEffect(() => {
    if (hoverd) {
      timer.current?.pause()
    } else {
      timer.current?.resume()
    }
  }, [hoverd])

  return (
    <li
      className="rounded-lg shadow-xl border border-neutral-200 bg-white text-neutral-900 dark:(border-github-border bg-github-card text-white) dark:shadow-none"
      onMouseEnter={() => setHoverd(true)}
      onMouseLeave={() => setHoverd(false)}
    >
      <div className="flex items-center gap-3 py-2 pl-3 pr-1">
        <span className="i-ph:info shrink-0 text-lg" />
        <span className="flex-1 text-sm font-medium">
          {info.msg}
        </span>
        {info.action && (
          <button
            type="button"
            className="h-9 px-3 rounded-md text-sm whitespace-nowrap cursor-pointer text-white bg-neutral-900 dark:(text-neutral-900 bg-white) active:opacity-80 transition-opacity"
            onClick={info.action.onClick}
          >
            {info.action.label}
          </button>
        )}
        <button
          type="button"
          aria-label="Dismiss"
          className="icon-btn size-9 text-lg"
          onClick={() => hidden(false)}
        >
          <span className="i-ph:x" />
        </button>
      </div>
    </li>
  )
}
