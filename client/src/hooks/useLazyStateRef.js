const { useRef, useEffect } = require("react")

const useLazyStateRef = state => {
  const ref = useRef(state)

  useEffect(() => {
    ref.current = state
  }, [state])

  return ref
}

export default useLazyStateRef