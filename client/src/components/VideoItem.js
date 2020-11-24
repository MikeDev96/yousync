import React, { forwardRef, Fragment, memo } from "react"
import { makeStyles } from "@material-ui/core/styles"
import ListItem from "@material-ui/core/ListItem"
import { Avatar, IconButton, LinearProgress, ListItemAvatar, ListItemSecondaryAction, Tooltip } from "@material-ui/core"
import CloseIcon from "@material-ui/icons/Close"
import clsx from "clsx"
import VideoItemText from "./VideoItemText"

const useStyles = makeStyles((theme) => ({
  video: {
    position: "relative",
  },
  videoAvatar: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    position: "absolute",
    right: 0,
    bottom: theme.spacing(-0.5),
    margin: `0 ${theme.spacing(1.5)}px 0 0`,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
    fontSize: theme.spacing(1.5),
    border: "solid 2px #424242",
    padding: theme.spacing(1),
    "&.selected": {
      borderColor: "#606060",
    }
  },
  progressRoot: {
    height: 2,
    position: "absolute",
    bottom: 0,
    width: "100%",
    left: 0,
    background: "transparent",
  },
  progressBar: {
    backgroundColor: "red",
  },
  removeIconButton: {
    padding: theme.spacing(0.5),
  },
}));

const VideoItem = ({
  onVideoClick, onVideoRemove, selected, elapsed,
  item, itemIndex,
}, ref) => {
  const classes = useStyles()

  const handleVideoRemove = (e, itemIndex) => {
    e.stopPropagation()
    onVideoRemove(itemIndex)
  }

  return (
    <ListItem button onClick={() => onVideoClick(itemIndex)} selected={selected} innerRef={ref}>
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