import { useRegisterSW } from "virtual:pwa-register/react"
import { useEffect } from "react"

export function usePWA() {
  useRegisterSW()

  useEffect(() => {
    let refreshing = false

    // Listen for new service worker taking control
    const onControllerChange = () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    }

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)
    }

    return () => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
      }
    }
  }, [])
}
