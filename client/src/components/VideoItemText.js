import React, { forwardRef, memo } from "react"
import ListItemText from "@material-ui/core/ListItemText"
import MarqueeOverflow from "./MarqueeOverflow"

const VideoItemText = ({
  title, author,
}, ref) => {
  return (
    <ListItemText
      primary={<MarqueeOverflow>{title}</MarqueeOverflow>}
      secondary={<MarqueeOverflow>{author}</MarqueeOverflow>}
      secondaryTypographyProps={{ component: "span" }}
      innerRef={ref}
    />
  )
}

export default memo(forwardRef(VideoItemText))