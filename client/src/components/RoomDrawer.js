import React, { createElement, forwardRef, Fragment, useMemo } from "react"
import { fade, makeStyles } from "@material-ui/core/styles"
import Drawer from "@material-ui/core/Drawer"
import Toolbar from "@material-ui/core/Toolbar"
import List from "@material-ui/core/List"
import Divider from "@material-ui/core/Divider"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import { Avatar, InputBase, ListItemAvatar, ListSubheader, Slide, Tooltip } from "@material-ui/core"
import LinkIcon from "@material-ui/icons/Link"
import clsx from "clsx"
import MarqueeOverflow from "./MarqueeOverflow"
import DesktopAccessDisabled from "@material-ui/icons/DesktopAccessDisabled"
import VolumeOff from "@material-ui/icons/VolumeOff"
import VolumeDown from "@material-ui/icons/VolumeDown"
import VolumeUp from "@material-ui/icons/VolumeUp"
import VideoItem from "./VideoItem"

const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: "auto",
    overflowX: "hidden",
  },
  videoAvatarPlaceholder: {
    background: "transparent",
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
  },
  searchIcon: {
    padding: theme.spacing(0, 1),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(3)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
  },
  ul: {
    padding: 0,
  },
  divider: {
    marginTop: theme.spacing(1),
  },
  usernameContainer: {
    display: "flex",
  },
  username: {
    display: "flex",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flexBasis: "50%",
  },
  userWrapper: {
    display: "inline-flex",
    alignItems: "center",
  },
  ping: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flexBasis: "50%",
    marginLeft: theme.spacing(1),
    textAlign: "right",
  },
  visibilityIcon: {
    fontSize: "inherit",
    marginRight: theme.spacing(0.5),
  },
  volumeIcon: {
    fontSize: "inherit",
    marginRight: theme.spacing(0.5),
  },
}))

const RoomDrawer = ({
  queue, clients, onVideoAdd, onVideoClick,
  activeVideo, playTime, onVideoRemove,
}) => {
  const classes = useStyles()

  const [queueSafeDupes] = useMemo(() => queue.reduce(([acc, map], cur) => {
    if (!map.has(cur.id)) {
      map.set(cur.id, 100)
    }

    const count = map.get(cur.id) - 1
    map.set(cur.id, count)

    acc.push({ ...cur, key: `${cur.id}_${count}` })

    return [acc, map]
  }, [[], new Map()]), [queue])

  const MarqueeOverflowUsername = forwardRef((props, ref) => <span {...props} className={clsx(props.className, classes.userWrapper)} ref={ref} />)

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="right"
    >
      <Toolbar variant="dense" />
      <div className={classes.drawerContainer}>
        <List dense subheader={<li />}>
          <li>
            <ul className={classes.ul}>
              <ListSubheader>{"Users"}</ListSubheader>
              {clients.map(client => (
                <Slide key={client.id} in direction="left">
                  <ListItem button>
                    <ListItemText
                      classes={{ primary: classes.usernameContainer }}
                      primary={
                        <Fragment>
                          <MarqueeOverflow component={MarqueeOverflowUsername} className={classes.username}>
                            {client.visibility === "hidden" &&
                              <Tooltip placement="left" title="User isn't watching">
                                <DesktopAccessDisabled className={classes.visibilityIcon} />
                              </Tooltip>
                            }
                            {client.volume >= 0 && client.muted >= 0 &&
                              <Tooltip placement="left" title={client.muted ? "Muted" : `Volume: ${client.volume}%`}>
                                {createElement(client.muted ? VolumeOff : client.volume < 50 ? VolumeDown : VolumeUp, { className: classes.volumeIcon })}
                              </Tooltip>
                            }
                            {client.username}
                          </MarqueeOverflow>
                          <span className={classes.ping}>{client.syncDiff}s/{client.ping}ms</span>
                        </Fragment>
                      }
                    />
                  </ListItem>
                </Slide>
              ))}
            </ul>
          </li>
          <Divider className={classes.divider} />
          <li>
            <ul className={classes.ul}>
              <ListSubheader>{"Add Video"}</ListSubheader>
              <ListItem>
                <div className={classes.search}>
                  <div className={classes.searchIcon}>
                    <LinkIcon />
                  </div>
                  <InputBase
                    placeholder="Paste link"
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                    }}
                    inputProps={{ "aria-label": "search" }}
                    onKeyPress={e => {
                      if (e.key === "Enter") {
                        const match = /(?:https?:\/\/www.)?youtu(?:be.com\/watch\?v=|.be\/)([\w-]+)/.exec(e.target.value)
                        if (match) {
                          const [, videoId] = match
                          onVideoAdd(videoId)
                          e.target.value = ""
                        }
                      }
                    }}
                  />
                </div>
              </ListItem>
            </ul>
          </li>
          <Divider className={classes.divider} />
          <li>
            <List dense className={classes.ul}>
              <ListSubheader>{"Queue"}</ListSubheader>
              {queueSafeDupes.map((item, itemIndex) =>
                <Slide key={item.key} in direction="left">
                  <VideoItem
                    elapsed={(itemIndex === activeVideo ? playTime : (item.elapsed / 1000)) / item.duration * 100}
                    item={item}
                    itemIndex={itemIndex}
                    onVideoClick={onVideoClick}
                    onVideoRemove={onVideoRemove}
                    selected={itemIndex === activeVideo}
                  />
                </Slide>
              )}
              {!queueSafeDupes.length &&
                <ListItem button selected>
                  <ListItemAvatar className={classes.video}>
                    <Avatar className={classes.videoAvatarPlaceholder} variant="rounded" src="/favicon-96x96.png" />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<MarqueeOverflow>{"Add a video to get started"}</MarqueeOverflow>}
                    secondary={"Created by Mike"}
                  />
                </ListItem>
              }
            </List>
          </li>
        </List>
      </div>
    </Drawer>
  )
}

export default RoomDrawer