import { useCallback, useMemo, useRef } from "react"
import { useMount, useWindowSize } from "react-use"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import type { ToastItem } from "~/atoms/types"
import { Timer } from "~/utils"

const WIDTH = 320
export function Toast() {
  const { width } = useWindowSize()
  const center = useMemo(() => {
    const t = (width - WIDTH) / 2
    return t > width * 0.9 ? width * 0.9 : t
  }, [width])
  const toastItems = useAtomValue(toastAtom)
  const [parent] = useAutoAnimate({ duration: 200 })
  return (
    <ol
      ref={parent}
      style={{
        width: WIDTH,
        left: center,
      }}
      className="absolute top-4 z-99 flex flex-col gap-2"
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
      className={$(
        "bg-white rounded-lg shadow-xl relative border border-neutral-200",
      )}
      onMouseEnter={() => setHoverd(true)}
      onMouseLeave={() => setHoverd(false)}
    >
      <div className={$(
        "p-2 rounded-lg w-full",
        "flex items-center gap-2",
      )}
      >
        {
          hoverd
            ? <button type="button" className="i-ph:x-circle text-black text-lg cursor-pointer" onClick={() => hidden(false)} />
            : <span className="i-ph:info text-black text-lg" />
        }
        <div className="flex justify-between w-full items-center gap-4">
          <span className="text-black font-medium text-sm">
            {info.msg}
          </span>
          {info.action && (
            <button
              type="button"
              className="text-sm text-white bg-black px-3 py-1 rounded hover:opacity-80 transition-opacity whitespace-nowrap cursor-pointer"
              onClick={info.action.onClick}
            >
              {info.action.label}
            </button>
          )}
        </div>
      </div>
    </li>
  )
}
