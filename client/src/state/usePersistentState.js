import throttle from "lodash/throttle"
import { useEffect, useRef } from "react"

const usePersistentState = (key, state) => {
  const saveState = useRef(throttle(state => localStorage.setItem(key, JSON.stringify(state)), 1000))

  useEffect(() => {
    saveState.current(state)
  }, [state])
}

export default usePersistentState