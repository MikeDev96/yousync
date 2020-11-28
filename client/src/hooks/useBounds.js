import { useCallback, useEffect, useRef, useState } from "react"

const useBounds = () => {
  const ref = useRef()
  const [bounds, setBounds] = useState(new DOMRectReadOnly())

  useEffect(() => {
    setBounds(ref.current.getBoundingClientRect())

    const ro = new ResizeObserver(entries => {
      setBounds(entries[0].contentRect)
    })
    const el = ref.current
    ro.observe(el)

    return () => {
      ro.unobserve(el)
    }
  }, [setBounds])

  return {
    bounds,
    register: useCallback(ref2 => {
      ref.current = ref2
    }, [])
  }
}

export default useBounds