import { makeStyles } from "@material-ui/core"
import clsx from "clsx"
import React, { cloneElement, useLayoutEffect, useMemo, useRef, useState } from "react"

const MarqueeOverflow = ({
  className, children, ...restProps
}) => {
  const outerRef = useRef()
  const innerRef = useRef()

  const [diff, setDiff] = useState(0)

  useLayoutEffect(() => {
    const outerWidth = outerRef.current.getBoundingClientRect()
    const innerWidth = innerRef.current.getBoundingClientRect()

    setDiff(innerWidth.width - outerWidth.width)
  }, [children])

  const useStyles = useMemo(() => makeStyles((theme) => {
    const classes = {
      outer: {
        position: "relative",
      },
      inner: {},
    }

    if (diff > 0) {
      const moveSpeed = 30
      const moveTime = diff / moveSpeed
      const fadeTime = 0.4
      const pauseTime = 1
      
      const totalTime = fadeTime + pauseTime + moveTime + pauseTime + fadeTime
    
      const fadePerc = fadeTime / totalTime * 100
      const pausePerc = pauseTime / totalTime * 100
      const movePerc = moveTime / totalTime * 100
    
      const perc1 = fadePerc
      const perc2 = fadePerc + pausePerc
      const perc3 = fadePerc + pausePerc + movePerc
      const perc4 = fadePerc + pausePerc + movePerc + pausePerc

      classes["inner"] = {
        position: "absolute",
        animation: `$marquee ${totalTime}s linear infinite`,
      }

      classes["@keyframes marquee"] = {
        "0%": {
          transform: "translateX(0px)",
          opacity: 0,
        },
        [`${perc1}%`]: {
          transform: "translateX(0px)",
          opacity: 1,
        },
        [`${perc2}%`]: {
          transform: "translateX(0px)",
          opacity: 1,
        },
        [`${perc3}%`]: {
          transform: `translateX(-${diff}px)`,
          opacity: 1,
        },
        [`${perc4}%`]: {
          transform: `translateX(-${diff}px)`,
          opacity: 1,
        },
        "100%": {
          transform: `translateX(-${diff}px)`,
          opacity: 0,
        },
      }
    }

    return classes
  }), [diff])

  const classes = useStyles()

  return (
    <div className={clsx(className, classes.outer)} ref={outerRef} {...restProps}>
      {cloneElement(children, { ...children.props, className: diff > 0 ? classes.inner : undefined, ref: innerRef })}
    </div>
  )
}

export default MarqueeOverflow