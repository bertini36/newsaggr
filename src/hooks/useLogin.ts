const userAtom = atomWithStorage<{
  name?: string
  avatar?: string
  type?: "github" | "google"
}>("user", {})

const jwtAtom = atomWithStorage("jwt", "")

const enableLoginAtom = atomWithStorage<{
  enable: boolean
  providers?: {
    google: boolean
    github: boolean
  }
}>("login", {
  enable: true,
})

enableLoginAtom.onMount = (set) => {
  myFetch("/enable-login").then((r) => {
    set(r)
  }).catch((e) => {
    if (e.statusCode === 506) {
      set({ enable: false })
      localStorage.removeItem("jwt")
    }
  })
}

export function useLogin() {
  const userInfo = useAtomValue(userAtom)
  const jwt = useAtomValue(jwtAtom)
  const enableLogin = useAtomValue(enableLoginAtom)

  const loginWithGoogle = useCallback(() => {
    window.location.href = "/api/login-google"
  }, [])

  const loginWithGithub = useCallback(() => {
    window.location.href = "/api/login"
  }, [])

  // Backward compatibility: default to GitHub
  const login = useCallback(() => {
    window.location.href = "/api/login"
  }, [])

  const logout = useCallback(() => {
    window.localStorage.clear()
    window.location.reload()
  }, [])

  return {
    loggedIn: !!jwt,
    userInfo,
    enableLogin: !!enableLogin.enable,
    providers: enableLogin.providers || { google: false, github: false },
    logout,
    login,
    loginWithGoogle,
    loginWithGithub,
  }
}
