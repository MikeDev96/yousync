import { makeStyles } from "@material-ui/core"
import clsx from "clsx"
import React, { createElement, useLayoutEffect, useRef, useState } from "react"

const useStyles = makeStyles(theme => {
  const classes = {
    outer: {
      position: "relative",
      overflow: "hidden",
    },
    inner: {
      display: "inline-flex",
      whiteSpace: "nowrap",
    },
    max: {
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
  }

  for (let diff = 1; diff <= 1000; diff++) {
    const moveSpeed = 30
    const moveTime = diff / moveSpeed
    const fadeTime = 0.4
    const pauseTime = 1

    const totalTime = fadeTime + pauseTime + moveTime + pauseTime + fadeTime

    const fadePerc = fadeTime / totalTime * 100
    const pausePerc = pauseTime / totalTime * 100
    const movePerc = moveTime / totalTime * 100

    const perc1 = fadePerc.toFixed(2)
    const perc2 = (fadePerc + pausePerc).toFixed(2)
    const perc3 = (fadePerc + pausePerc + movePerc).toFixed(2)
    const perc4 = (fadePerc + pausePerc + movePerc + pausePerc).toFixed(2)

    classes[`inner-${diff}`] = {
      animation: `$marquee-${diff} ${totalTime.toFixed(2)}s linear infinite`,
    }

    classes[`@keyframes marquee-${diff}`] = {
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
})

const MarqueeOverflow = ({
  className, children, component = "span", ...restProps
}) => {
  const outerRef = useRef()
  const innerRef = useRef()

  const [diff, setDiff] = useState(0)

  const classes = useStyles()

  useLayoutEffect(() => {
    const outerWidth = outerRef.current.getBoundingClientRect()
    const innerWidth = innerRef.current.getBoundingClientRect()

    setDiff(Math.ceil(innerWidth.width - outerWidth.width))
  }, [children])

  return (
    <div className={clsx(className, classes.outer, { [classes.max]: diff > 1000 })} ref={outerRef} {...restProps}>
      {createElement(component, {
        className: diff <= 1000 && clsx(classes.inner, { [classes[`inner-${diff}`]]: diff > 0 }),
        ref: innerRef,
      }, children)}
    </div>
  )
}

export default MarqueeOverflow