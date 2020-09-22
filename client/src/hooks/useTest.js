import { useEffect, useRef, useState } from "react"

const useTest = (mainRef, elemRef) => {
  const [data, setData] = useState([0,0])

  const mainBoundsRef = useRef()
  const elemBoundsRef = useRef()

  // console.log({mainRef, elemRef})
  useEffect(() => {
    if (mainRef.current && elemRef.current) {
      const mainBounds = mainRef.current.getBoundingClientRect()
      const elemBounds = elemRef.current.getBoundingClientRect()

      console.log({mainBounds, elemBounds})

      const heightLeft = mainBounds.height - elemBounds.top
      const vidWidth = heightLeft / 9 * 16
      const padding = (mainBounds.width - vidWidth) / 2

      // setData([vidWidth, padding])
    }

    const ro = new ResizeObserver(entries => {      
      entries.forEach(entry => {
        if (entry.target === mainRef.current) {
          mainBoundsRef.current = entry.contentRect
        }
        else if (entry.target === elemRef.current) {
          elemBoundsRef.current = entry.contentRect
        }
      })

      // const [mainEntry, elemEntry] = entries

      const heightLeft = mainBoundsRef.current.height - elemBoundsRef.current.top - 48 - 4 - 180
      const vidWidth = heightLeft / 9 * 16
      const padding = (mainBoundsRef.current.width - vidWidth) / 2

      // console.log({entries, heightLeft})
      console.log([vidWidth, heightLeft, padding])

      setData([vidWidth, padding])
    })

    ro.observe(mainRef.current, {box: "border-box"})
    ro.observe(elemRef.current, {box: "border-box"})
  }, [elemRef, mainRef])

  return data
}

export default useTest