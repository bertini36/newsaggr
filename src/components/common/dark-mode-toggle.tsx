import { darkModeAtom } from "~/atoms/theme"

export function DarkModeToggle() {
  const [isDark, setIsDark] = useAtom(darkModeAtom)

  return (
    <button
      type="button"
      title="Toggle Dark Mode"
      className="i-ph:moon dark:i-ph:sun text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors cursor-pointer text-xl"
      onClick={() => setIsDark(!isDark)}
    />
  )
}
