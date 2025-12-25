import { motion } from "framer-motion"

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
  const { loggedIn, login, logout, userInfo, enableLogin } = useLogin()
  const [shown, show] = useState(false)
  return (
    <span className="relative" onMouseEnter={() => show(true)} onMouseLeave={() => show(false)}>
      <span className="flex items-center">
        {
          enableLogin && loggedIn && userInfo.avatar
            ? (
                <button
                  type="button"
                  className="h-6 w-6 rounded-full bg-cover"
                  style={
                    {
                      backgroundImage: `url(${userInfo.avatar}&s=24)`,
                    }
                  }
                >
                </button>
              )
            : (
                <button
                  type="button"
                  className={$(
                    "i-ph:dots-three-circle text-2xl transition-colors cursor-pointer",
                    shown ? "text-neutral-600 dark:text-white" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-white",
                  )}
                />
              )
        }
      </span>
      {shown && (
        <div className="absolute right-0 z-99 bg-transparent pt-4 top-4">
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
              {enableLogin && (loggedIn
                ? (
                    <li onClick={logout} className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/10 rounded-md transition-colors text-neutral-800 dark:text-white">
                      <span className="i-ph:sign-out inline-block" />
                      <span>Logout</span>
                    </li>
                  )
                : (
                    <li onClick={login} className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/10 rounded-md transition-colors text-neutral-800 dark:text-white">
                      <span className="i-ph:sign-in inline-block" />
                      <span>Login with Github</span>
                    </li>
                  ))}
              {/* <ThemeToggle /> */}
              <li onClick={() => window.open(Homepage)} className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/10 rounded-md transition-colors [&_*]:cursor-pointer text-neutral-800 dark:text-white">
                <span className="i-ph:github-logo inline-block" />
                <span>Star on Github </span>
              </li>
              <li className="flex gap-2 items-center">
                <a
                  href="https://github.com/bertini36/newsaggr"
                >
                  <img
                    alt="GitHub stars badge"
                    src="https://img.shields.io/github/stars/bertini36/newsaggr?logo=github&style=flat&labelColor=%235e3c40&color=%23614447"
                  />
                </a>
                <a
                  href="https://github.com/bertini36/newsaggr/fork"
                >
                  <img
                    alt="GitHub forks badge"
                    src="https://img.shields.io/github/forks/bertini36/newsaggr?logo=github&style=flat&labelColor=%235e3c40&color=%23614447"
                  />
                </a>
              </li>
            </ol>
          </motion.div>
        </div>
      )}
    </span>
  )
}
