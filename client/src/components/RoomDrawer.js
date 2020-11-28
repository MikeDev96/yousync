import React, { createElement, forwardRef, Fragment, useCallback } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Drawer from "@material-ui/core/Drawer"
import Toolbar from "@material-ui/core/Toolbar"
import List from "@material-ui/core/List"
import Divider from "@material-ui/core/Divider"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import { Avatar, IconButton, ListItemAvatar, ListSubheader, Slide, Tooltip } from "@material-ui/core"
import LinkIcon from "@material-ui/icons/Link"
import clsx from "clsx"
import MarqueeOverflow from "./MarqueeOverflow"
import DesktopAccessDisabled from "@material-ui/icons/DesktopAccessDisabled"
import VolumeOff from "@material-ui/icons/VolumeOff"
import VolumeDown from "@material-ui/icons/VolumeDown"
import VolumeUp from "@material-ui/icons/VolumeUp"
import { FixedSizeList } from "react-window"
import useBounds from "../hooks/useBounds"
import VideoRow from "./VideoRow"

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
    height: "100%",
    overflow: "hidden",
  },
  videoAvatarPlaceholder: {
    background: "transparent",
  },
  listRoot: {
    display: "grid",
    height: "100%",
    gridTemplateRows: "auto fit-content(50%) auto 1fr",
    backgroundColor: theme.palette.background.paper,
  },
  listSection: {
    overflow: "hidden",
    backgroundColor: "inherit",
  },
  ul: {
    display: "grid",
    height: "100%",
    // https://stackoverflow.com/a/43312314/13923787
    gridTemplateRows: "auto minmax(0, 1fr)",
    gridTemplateColumns: "minmax(0, 1fr)",
    padding: 0,
    backgroundColor: "inherit",
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
  queueSubheader: {
    display: "flex",
    justifyContent: "space-between",
  },
}))

const RoomDrawer = ({
  queue, clients, onVideoAdd, onVideoClick,
  activeVideo, playTime, onVideoRemove,
}) => {
  const classes = useStyles()
  const { bounds, register } = useBounds()

  const MarqueeOverflowUsername = useCallback(forwardRef((props, ref) => <span {...props} className={clsx(props.className, classes.userWrapper)} ref={ref} />), [])

  const handleAdd = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onVideoAdd(text)
    }
    catch (err) {
      console.log(err)
    }
  }

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
        <List className={classes.listRoot} dense subheader={<li />}>
          <li className={classes.listSection}>
            <ul className={classes.ul}>
              <ListSubheader>{"Users"}</ListSubheader>
              <div style={{ overflowX: "hidden", overflowY: "auto" }}>
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
              </div>
            </ul>
          </li>
          <Divider className={classes.divider} />
          <li className={classes.listSection}>
            <List dense className={classes.ul}>
              <ListSubheader className={classes.queueSubheader}>
                {"Queue"}
                <IconButton edge="end" onClick={handleAdd}>
                  <LinkIcon />
                </IconButton>
              </ListSubheader>
              <div ref={register} >
                {!!queue.length &&
                  <FixedSizeList
                    height={bounds.height}
                    itemSize={60}
                    itemCount={queue.length}
                    itemData={{
                      queue: queue, activeVideo, playTime, classes,
                      onVideoClick, onVideoRemove,
                    }}>
                    {VideoRow}
                  </FixedSizeList>
                }
                {!queue.length &&
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
              </div>
            </List>
          </li>
        </List>
      </div>
    </Drawer>
  )
}

export default RoomDrawer