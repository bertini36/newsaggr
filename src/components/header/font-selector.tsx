import { useFont } from "~/hooks/useFont"

export function FontSelector() {
  const { fontId, setFont, fonts } = useFont()
  const [expanded, setExpanded] = useState(false)

  const currentFont = fonts.find(f => f.id === fontId)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpanded(prev => !prev)
  }

  const handleSelectFont = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setFont(id)
    setExpanded(false)
  }

  return (
    <li
      onClick={handleToggle}
      onMouseDown={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
      className="relative flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/10 rounded-md transition-colors text-neutral-800 dark:text-white"
    >
      <span className="i-ph:text-aa inline-block" />
      <span>Font</span>
      <div className="flex items-center gap-1 ml-auto text-neutral-500 dark:text-neutral-400">
        <span className="text-sm truncate max-w-20">{currentFont?.name || "Roboto Flex"}</span>
        <span className={$("i-ph:caret-down inline-block transition-transform text-xs", expanded && "rotate-180")} />
      </div>
      {expanded && (
        <div
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto py-1 px-2 bg-white dark:bg-github-card border border-neutral-200 dark:border-github-border rounded-lg shadow-lg"
        >
          {fonts.map(font => (
            <div
              key={font.id}
              onClick={e => handleSelectFont(e, font.id)}
              className={$([
                "px-3 py-2 cursor-pointer rounded-md transition-colors text-sm",
                fontId === font.id
                  ? "bg-neutral-200 dark:bg-white/20 text-neutral-900 dark:text-white"
                  : "hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300",
              ])}
              style={{ fontFamily: font.family }}
            >
              <div className="flex items-center justify-between">
                <span>{font.name}</span>
                {fontId === font.id && (
                  <span className="i-ph:check text-green-600 dark:text-green-400" />
                )}
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                {font.category}
              </span>
            </div>
          ))}
        </div>
      )}
    </li>
  )
}
