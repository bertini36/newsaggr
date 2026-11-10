import type { PropsWithChildren } from "react"
import { useClickAway } from "react-use"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "@tanstack/react-router"
import { FontSelector } from "./font-selector"
import { Footer } from "~/components/footer"
import { useSearchBar } from "~/hooks/useSearch"

interface MenuItemProps {
  icon: string
  onClick: () => void
}

function MenuItem({ icon, onClick, children }: PropsWithChildren<MenuItemProps>) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-4 min-h-12 rounded-md text-left cursor-pointer text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 active:bg-neutral-500/15 transition-colors"
      >
        <span className={$(icon, "text-lg")} />
        <span>{children}</span>
      </button>
    </li>
  )
}

export function Menu() {
  const { loggedIn, loginWithGoogle, loginWithGithub, logout, userInfo, enableLogin, providers } = useLogin()
  const { toggle } = useSearchBar()
  const [shown, show] = useState(false)
  const navigate = useNavigate()
  const isPhone = useIsPhone()
  const ref = useRef<HTMLSpanElement>(null)

  useClickAway(ref, () => {
    show(false)
  })

  const items = (
    <ol className="flex flex-col p-2 text-base">
      <MenuItem
        icon="i-ph:list-plus"
        onClick={() => {
          toggle(true)
          show(false)
        }}
      >
        Add sources
      </MenuItem>
      {enableLogin && loggedIn && (
        <MenuItem
          icon="i-ph:bookmark-simple"
          onClick={() => {
            navigate({ to: "/saved" })
            show(false)
          }}
        >
          Saved news
        </MenuItem>
      )}
      {enableLogin && loggedIn && <FontSelector />}
      {enableLogin && loggedIn && (
        <MenuItem
          icon="i-ph:plus-circle"
          onClick={() => {
            navigate({ to: "/request-source" })
            show(false)
          }}
        >
          Request source
        </MenuItem>
      )}
      <MenuItem icon="i-ph:star" onClick={() => window.open(Homepage)}>Star on Github</MenuItem>
      {enableLogin && (loggedIn
        ? <MenuItem icon="i-ph:sign-out" onClick={logout}>Logout</MenuItem>
        : (
            <>
              {providers.google && <MenuItem icon="i-ph:google-logo" onClick={loginWithGoogle}>Login with Google</MenuItem>}
              {providers.github && <MenuItem icon="i-ph:github-logo" onClick={loginWithGithub}>Login with Github</MenuItem>}
            </>
          ))}
    </ol>
  )

  return (
    <span ref={ref} className="relative">
      <button
        type="button"
        title="Menu"
        aria-label="Menu"
        aria-expanded={shown}
        onClick={() => show(!shown)}
        className={$("icon-btn", shown && "text-neutral-800 dark:text-white")}
      >
        {
          enableLogin && loggedIn && userInfo.avatar
            ? (
                <span
                  className="h-7 w-7 rounded-full bg-cover"
                  style={
                    {
                      backgroundImage: `url(${userInfo.type === "github" ? `${userInfo.avatar}&s=56` : userInfo.avatar})`,
                    }
                  }
                />
              )
            : <span className="i-ph:dots-three-circle text-2xl" />
        }
      </button>
      <AnimatePresence>
        {shown && isPhone && (
          <>
            <motion.div
              className="fixed inset-0 z-998 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => show(false)}
            />
            <motion.div
              role="dialog"
              aria-label="Menu"
              className="fixed inset-x-0 bottom-0 z-999 max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-2xl border-t border-neutral-200 dark:border-github-border bg-white dark:bg-github-card text-neutral-800 dark:text-white pb-[env(safe-area-inset-bottom)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-neutral-400/50" />
              {items}
              <div className="flex flex-col items-center gap-0.5 pb-4 pt-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
                <a target="_blank" href={`${Homepage}/releases/tag/v${Version}`}>{`v${Version}`}</a>
                <Footer />
              </div>
            </motion.div>
          </>
        )}
        {shown && !isPhone && (
          <motion.div
            className="absolute right-0 top-full z-999 mt-1 w-60 bg-white dark:bg-github-card border border-neutral-300 dark:border-github-border rounded-lg shadow-lg dark:shadow-none text-neutral-800 dark:text-white"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            {items}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
