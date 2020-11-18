import { useEffect, useState } from "react"

const useVisibility = () => {
  const [visible, setVisible] = useState(document.visibilityState)

  useEffect(() => {
    const callback = () => setVisible(document.visibilityState)
    document.addEventListener("visibilitychange", callback)

    return () => {
      document.removeEventListener("visibilitychange", callback)
    }
  }, [])

  return visible
}

export default useVisibility