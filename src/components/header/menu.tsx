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
                    shown ? "text-neutral-600" : "text-neutral-400 hover:text-neutral-600",
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
              "bg-white border border-neutral-300 rounded-lg",
            ])}
            initial={{
              scale: 0.9,
            }}
            animate={{
              scale: 1,
            }}
          >
            <ol className="bg-transparent p-2 rounded-lg color-base text-base">
              {enableLogin && (loggedIn
                ? (
                    <li onClick={logout}>
                      <span className="i-ph:sign-out inline-block" />
                      <span>Logout</span>
                    </li>
                  )
                : (
                    <li onClick={login}>
                      <span className="i-ph:sign-in inline-block" />
                      <span>Login with Github</span>
                    </li>
                  ))}
              {/* <ThemeToggle /> */}
              <li onClick={() => window.open(Homepage)} className="cursor-pointer [&_*]:cursor-pointer transition-all">
                <span className="i-ph:github-logo inline-block" />
                <span>Star on Github </span>
              </li>
              <li className="flex gap-2 items-center">
                <a
                  href="https://github.com/ourongxing/newsnow"
                >
                  <img
                    alt="GitHub stars badge"
                    src="https://img.shields.io/github/stars/ourongxing/newsnow?logo=github&style=flat&labelColor=%235e3c40&color=%23614447"
                  />
                </a>
                <a
                  href="https://github.com/ourongxing/newsnow/fork"
                >
                  <img
                    alt="GitHub forks badge"
                    src="https://img.shields.io/github/forks/ourongxing/newsnow?logo=github&style=flat&labelColor=%235e3c40&color=%23614447"
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
