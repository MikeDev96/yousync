import React, { forwardRef, Fragment, memo } from "react"
import ListItem from "@material-ui/core/ListItem"
import { Avatar, IconButton, LinearProgress, ListItemAvatar, ListItemSecondaryAction, Tooltip } from "@material-ui/core"
import CloseIcon from "@material-ui/icons/Close"
import clsx from "clsx"
import VideoItemText from "./VideoItemText"

const VideoItem = ({
  onVideoClick, onVideoRemove, selected, elapsed,
  item, itemIndex, classes, style,
}, ref) => {
  const handleVideoRemove = (e, itemIndex) => {
    e.stopPropagation()
    onVideoRemove(itemIndex)
  }

  return (
    <ListItem ContainerProps={{ style }} button onClick={() => onVideoClick(itemIndex)} selected={selected} innerRef={ref}>
      <ListItemAvatar className={classes.video}>
        <Fragment>
          <Avatar alt={item.title} src={item.thumbnail} variant="rounded" />
          <Tooltip placement="left" title={`Added by ${item.addedBy}`}>
            <Avatar className={clsx(classes.videoAvatar, { selected })}>{item.addedBy.slice(0, 1)}</Avatar>
          </Tooltip>
        </Fragment>
      </ListItemAvatar>
      <VideoItemText title={item.title} author={item.author} />
      <LinearProgress classes={{ bar: classes.progressBar, root: classes.progressRoot }} variant="determinate" value={elapsed} />
      <ListItemSecondaryAction>
        <IconButton className={classes.removeIconButton} edge="end" onClick={e => handleVideoRemove(e, itemIndex)}>
          <CloseIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default memo(forwardRef(VideoItem))