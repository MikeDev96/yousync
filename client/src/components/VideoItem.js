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
      <div className={classes.progressRoot}>
        <LinearProgress classes={{ bar: classes.progressBar, root: classes.progressRoot }} variant="determinate" value={elapsed} />
        {item.segments.map(seg => <div title={seg.category} key={seg.UUID} style={{ left: `${seg.startTime / item.duration * 100}%`, width: `${(seg.endTime - seg.startTime) / item.duration * 100}%`, background: colourMap[seg.category], opacity: 0.7, height: 2, position: "absolute" }} />)}
      </div>
      <ListItemSecondaryAction>
        <IconButton className={classes.removeIconButton} edge="end" onClick={e => handleVideoRemove(e, itemIndex)}>
          <CloseIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

const colourMap = {
  sponsor: "rgb(0, 212, 0)",
  intro: "rgb(0, 255, 255)",
  outro: "rgb(2, 2, 237)",
  interation: "rgb(204, 0, 255)",
  selfpromo: "rgb(255, 255, 0)",
  music_offtopic: "rgb(255, 153, 0)",
}

export default memo(forwardRef(VideoItem))