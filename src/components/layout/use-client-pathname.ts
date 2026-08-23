"use client"

import { useEffect, useState } from "react"

export function useClientPathname() {
  const [pathname, setPathname] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setPathname(window.location.pathname)
    update()

    window.addEventListener("popstate", update)

    const originalPush = window.history.pushState
    window.history.pushState = function (...args: Parameters<typeof originalPush>) {
      const result = originalPush.apply(this, args)
      update()
      return result
    }

    const originalReplace = window.history.replaceState
    window.history.replaceState = function (...args: Parameters<typeof originalReplace>) {
      const result = originalReplace.apply(this, args)
      update()
      return result
    }

    return () => {
      window.removeEventListener("popstate", update)
      window.history.pushState = originalPush
      window.history.replaceState = originalReplace
    }
  }, [])

  return pathname
}
