import React, { createElement, Fragment } from 'react';
import { fade, makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Avatar, Card, CardActionArea, CardContent, CardMedia, IconButton, InputBase, LinearProgress, ListSubheader, Slide, Tooltip } from '@material-ui/core';
import LinkIcon from '@material-ui/icons/Link';
import YouTubeIcon from '@material-ui/icons/YouTube';
import CloseIcon from '@material-ui/icons/Close';
import clsx from "clsx"
import MarqueeOverflow from './MarqueeOverflow';
import DesktopAccessDisabled from '@material-ui/icons/DesktopAccessDisabled';
import VolumeOff from '@material-ui/icons/VolumeOff';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    width: "100%",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: 'auto',
    overflowX: "hidden",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  cardImage: {
    height: (drawerWidth - theme.spacing(4)) / 16 * 9,
    position: "relative",
  },
  cardContent: {
    padding: theme.spacing(1),
    background: theme.palette.grey[700],
    "&> .MuiTypography-root": {
      // display: block;/* Change it as per your requirement. */
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    "&.selected": {
      background: theme.palette.secondary.main,
    },
  },
  cardAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    position: "absolute",
    bottom: 0,
    left: 0,
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
  },
  cardPlaceholder: {
    display: "flex",
    background: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  cardPlaceholderIcon: {
    color: "red",
    fontSize: "4em",
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    // marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    // [theme.breakpoints.up('sm')]: {
    //   marginLeft: theme.spacing(3),
    //   width: 'auto',
    // },
  },
  searchIcon: {
    padding: theme.spacing(0, 1),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(3)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    // [theme.breakpoints.up('md')]: {
    //   width: '20ch',
    // },
  },
  listRoot: {
    // width: '100%',
    // maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    // position: 'relative',
    // overflow: 'auto',
    // maxHeight: 300,
  },
  listSection: {
    backgroundColor: 'inherit',
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0,
  },
  divider: {
    marginTop: theme.spacing(1),
  },
  progressRoot: {
    height: 2,
  },
  progressBar: {
    backgroundColor: "red",
  },
  userAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
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
    // flexGrow: 1,
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
  removeIconButton: {
    padding: theme.spacing(0.5),
    position: "absolute",
    right: 0,
    margin: theme.spacing(0.5),
  },
  visibilityIcon: {
    fontSize: "inherit",
    marginRight: theme.spacing(0.5),
  },
  volumeIcon: {
    fontSize: "inherit",
    marginRight: theme.spacing(0.5),
  },
}));

const RoomDrawer = ({
  queue, clients, onVideoAdd, onVideoClick,
  activeVideo, playTime, onVideoRemove,
}) => {
  const classes = useStyles();

  const map = new Map()
  const queueSafeDupes = queue.reduce((acc, cur) => {
    if (!map.has(cur.id)) {
      map.set(cur.id, 100)
    }

    const count = map.get(cur.id) - 1
    map.set(cur.id, count)

    acc.push({ ...cur, key: `${cur.id}_${count}` })

    return acc
  }, [])

  const handleVideoRemove = (e, itemIndex) => {
    e.stopPropagation()
    onVideoRemove(itemIndex)
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
              {clients.map(client => (
                <Slide key={client.id} in direction="left">
                  <ListItem button>
                    <ListItemText
                      classes={{ primary: classes.usernameContainer }}
                      primary={
                        <Fragment>
                          <MarqueeOverflow className={classes.username}>
                            <span className={classes.userWrapper}>
                              {client.visibility === "hidden" && <DesktopAccessDisabled className={classes.visibilityIcon} />}
                              {client.volume >= 0 && client.muted >= 0 &&
                                createElement(client.muted ? VolumeOff : client.volume < 50 ? VolumeDown : VolumeUp, { className: classes.volumeIcon })
                              }
                              {client.username}
                            </span>
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
          <li className={classes.listSection}>
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
                    inputProps={{ 'aria-label': 'search' }}
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
          <li className={classes.listSection}>
            <ul className={classes.ul}>
              <ListSubheader>{"Queue"}</ListSubheader>
              {queueSafeDupes.map((item, itemIndex) =>
                <Slide key={item.key} in direction="left">
                  <ListItem onClick={() => onVideoClick(itemIndex)}>
                    <Card className={classes.root}>
                      <CardActionArea>
                        <CardMedia
                          className={classes.cardImage}
                          image={item.thumbnail}
                        >
                          <IconButton component="div" className={classes.removeIconButton} onClick={e => handleVideoRemove(e, itemIndex)}>
                            <CloseIcon />
                          </IconButton>
                          <Tooltip placement="left" title={`Added by ${item.addedBy}`}>
                            <Avatar className={classes.cardAvatar}>{item.addedBy.slice(0, 1)}</Avatar>
                          </Tooltip>
                        </CardMedia>
                        <LinearProgress classes={{ bar: classes.progressBar, root: classes.progressRoot }} variant="determinate" value={(itemIndex === activeVideo ? playTime : (item.elapsed / 1000)) / item.duration * 100} />
                        <CardContent className={clsx(classes.cardContent, { selected: itemIndex === activeVideo })}>
                          <Typography variant="body2" component="p">{item.title}</Typography>
                          <Typography variant="body2" component="p" color="textSecondary">{item.author}</Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </ListItem>
                </Slide>
              )}
              {!queueSafeDupes.length &&
                <ListItem>
                  <Card className={classes.root}>
                    <CardActionArea>
                      <CardMedia className={clsx(classes.cardImage, classes.cardPlaceholder)}>
                        <YouTubeIcon className={classes.cardPlaceholderIcon} />
                      </CardMedia>
                      <CardContent className={classes.cardContent}>
                        <Typography variant="body2" component="p" align="center">{"Added videos appear here"}</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </ListItem>
              }
            </ul>
          </li>
        </List>
      </div>
    </Drawer>
  )
}

export default RoomDrawer