import { darkModeAtom } from "~/atoms/theme"

export function DarkModeToggle() {
  const [isDark, setIsDark] = useAtom(darkModeAtom)

  return (
    <button
      type="button"
      title="Toggle Dark Mode"
      aria-label="Toggle dark mode"
      className="icon-btn"
      onClick={() => setIsDark(!isDark)}
    >
      <span className="i-ph:moon dark:i-ph:sun" />
    </button>
  )
}
