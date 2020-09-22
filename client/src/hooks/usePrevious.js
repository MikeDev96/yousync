import { useEffect, useState } from "react"

const usePrevious = state => {
  const [prevState, setPrevState] = useState(state)

  useEffect(() => {
    setPrevState(state)
  }, [state])

  return prevState
}

export default usePrevious