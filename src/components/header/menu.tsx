import { useClickAway } from "react-use"
import { motion } from "framer-motion"
import { useNavigate } from "@tanstack/react-router"
import { FontSelector } from "./font-selector"
import { useSearchBar } from "~/hooks/useSearch"

// function ThemeToggle() {
//   const { isDark, toggleDark } = useDark()
//   return (
//     <li onClick={toggleDark} className="cursor-pointer [&_*]:cursor-pointer transition-all">
//       <span className={$("inline-block", isDark ? "i-ph-moon-stars-duotone" : "i-ph-sun-dim-duotone")} />
//       <span>
//         {isDark ? "Light mode" : "Dark mode"}
//       </span>
//     </li>
//   )
// }

export function Menu() {
  const { loggedIn, loginWithGoogle, loginWithGithub, logout, userInfo, enableLogin, providers } = useLogin()
  const { toggle } = useSearchBar()
  const [shown, show] = useState(false)
  const navigate = useNavigate()
  const ref = useRef<HTMLSpanElement>(null)

  useClickAway(ref, () => {
    show(false)
  })

  return (
    <span ref={ref} className="relative">
      <span className="flex items-center">
        {
          enableLogin && loggedIn && userInfo.avatar
            ? (
                <button
                  type="button"
                  onClick={() => show(!shown)}
                  className="h-6 w-6 rounded-full bg-cover"
                  style={
                    {
                      backgroundImage: `url(${userInfo.type === "github" ? `${userInfo.avatar}&s=24` : userInfo.avatar})`,
                    }
                  }
                >
                </button>
              )
            : (
                <button
                  type="button"
                  onClick={() => show(!shown)}
                  className={$(
                    "i-ph:dots-three-circle text-2xl transition-colors cursor-pointer",
                    shown ? "text-neutral-600 dark:text-white" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-white",
                  )}
                />
              )
        }
      </span>
      {shown && (
        <div className="absolute right-0 z-999 bg-transparent pt-4 top-4">
          <motion.div
            id="dropdown-menu"
            className={$([
              "w-200px",
              "bg-white dark:bg-github-card border border-neutral-300 dark:border-github-border rounded-lg shadow-lg dark:shadow-none",
              "text-neutral-800 dark:text-white",
            ])}
            initial={{
              scale: 0.9,
            }}
            animate={{
              scale: 1,
            }}
          >
            <ol className="bg-transparent p-2 rounded-lg text-base">
              <li
                onClick={() => {
                  toggle(true)
                  show(false)
                }}
                className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/10 rounded-md transition-colors text-neutral-800 dark:text-white"
              >
                <span className="i-ph:list-plus inline-block" />
                <span>Add sources</span>
              </li>
              {enableLogin && loggedIn && (
                <li
                  onClick={() => {
                    navigate({ to: "/saved" })
                    show(false)
                  }}
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/10 rounded-md transition-colors text-neutral-800 dark:text-white"
                >
                  <span className="i-ph:bookmark-simple inline-block" />
                  <span>Saved news</span>
                </li>
              )}
              {enableLogin && loggedIn && (
                <FontSelector />
              )}
              {enableLogin && loggedIn && (
                <li
                  onClick={() => {
                    navigate({ to: "/request-source" })
                    show(false)
                  }}
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/10 rounded-md transition-colors text-neutral-800 dark:text-white"
                >
                  <span className="i-ph:plus-circle inline-block" />
                  <span>Request source</span>
                </li>
              )}
              {enableLogin && (loggedIn
                ? (
                    <li onClick={logout} className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/10 rounded-md transition-colors text-neutral-800 dark:text-white">
                      <span className="i-ph:sign-out inline-block" />
                      <span>Logout</span>
                    </li>
                  )
                : (
                    <>
                      {providers.google && (
                        <li onClick={loginWithGoogle} className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/10 rounded-md transition-colors text-neutral-800 dark:text-white">
                          <span className="i-ph:google-logo inline-block" />
                          <span>Login with Google</span>
                        </li>
                      )}
                      {providers.github && (
                        <li onClick={loginWithGithub} className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/10 rounded-md transition-colors text-neutral-800 dark:text-white">
                          <span className="i-ph:github-logo inline-block" />
                          <span>Login with Github</span>
                        </li>
                      )}
                    </>
                  ))}
              {/* <ThemeToggle /> */}
              <li onClick={() => window.open(Homepage)} className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/10 rounded-md transition-colors [&_*]:cursor-pointer text-neutral-800 dark:text-white">
                <span className="i-ph:github-logo inline-block" />
                <span>Star on Github </span>
              </li>
            </ol>
          </motion.div>
        </div>
      )}
    </span>
  )
}
