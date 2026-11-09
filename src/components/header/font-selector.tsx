import { useFont } from "~/hooks/useFont"

export function FontSelector() {
  const { fontId, setFont, fonts } = useFont()
  const [expanded, setExpanded] = useState(false)

  const currentFont = fonts.find(f => f.id === fontId)

  return (
    <li>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(prev => !prev)}
        className="flex w-full items-center gap-3 px-4 min-h-12 rounded-md text-left cursor-pointer text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 active:bg-neutral-500/15 transition-colors"
      >
        <span className="i-ph:text-aa text-lg" />
        <span>Font</span>
        <span className="flex items-center gap-1 ml-auto text-neutral-500 dark:text-neutral-400">
          <span className="text-sm truncate max-w-28">{currentFont?.name || "Roboto Flex"}</span>
          <span className={$("i-ph:caret-down text-xs transition-transform", expanded && "rotate-180")} />
        </span>
      </button>
      {expanded && (
        <ul className="mt-1 mb-1 max-h-60 overflow-y-auto overscroll-contain rounded-lg border border-neutral-200 dark:border-github-border p-1">
          {fonts.map(font => (
            <li key={font.id}>
              <button
                type="button"
                onClick={() => {
                  setFont(font.id)
                  setExpanded(false)
                }}
                className={$([
                  "flex w-full items-center justify-between gap-2 px-3 min-h-11 rounded-md text-left text-sm cursor-pointer transition-colors",
                  fontId === font.id
                    ? "bg-neutral-200 dark:bg-white/20 text-neutral-900 dark:text-white"
                    : "hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300",
                ])}
                style={{ fontFamily: font.family }}
              >
                <span className="flex flex-col">
                  <span>{font.name}</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{font.category}</span>
                </span>
                {fontId === font.id && <span className="i-ph:check text-green-600 dark:text-green-400" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
