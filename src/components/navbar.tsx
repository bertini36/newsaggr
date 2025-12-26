export function NavBar() {
  const { toggle } = useSearchBar()
  return (
    <nav className={$(
      "flex items-center gap-2 p-2 text-base",
    )}
    >
      <button
        type="button"
        onClick={() => toggle(true)}
        className={$(
          "cursor-pointer transition-colors",
          "px-3 py-1 tracking-wider font-semibold text-xl uppercase",
          "text-neutral-700 hover:text-neutral-700 hover:bg-neutral-100 rounded-md dark:text-white dark:hover:text-white dark:hover:bg-white/10",
        )}
      >
        Sources
      </button>

    </nav>
  )
}
