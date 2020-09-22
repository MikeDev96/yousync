import React from 'react';
import { fade, makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Avatar, Card, CardActionArea, CardContent, CardMedia, InputBase, LinearProgress, ListItemAvatar, ListSubheader, Slide, Tooltip } from '@material-ui/core';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import LinkIcon from '@material-ui/icons/Link';
import clsx from "clsx"

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
    right: 0,
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
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
}));

const RoomDrawer = ({
  queue, clients, onVideoAdd, onVideoClick,
  activeVideo, playTime,
}) => {
  const classes = useStyles();

  // const test = useContext(GlobalContext)

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
                  <ListItemAvatar style={{ minWidth: 32, display: "flex" }}>
                    <PlayCircleOutlineIcon style={{ width: 16 }} />
                  </ListItemAvatar>
                  <ListItemText primary={client.username} />
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
                        onVideoAdd(e.target.value)
                        e.target.value = ""
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
                          <Tooltip placement="left" title={`Added by ${item.addedBy}`}>
                            <Avatar className={classes.cardAvatar}>{item.addedBy.slice(0, 1)}</Avatar>
                          </Tooltip>
                        </CardMedia>
                        {/* selected={itemIndex === activeVideo} */}
                        <LinearProgress classes={{ bar: classes.progressBar, root: classes.progressRoot }} variant="determinate" value={(itemIndex === activeVideo ? playTime : (item.elapsed / 1000)) / item.duration * 100} />
                        <CardContent className={clsx(classes.cardContent, { selected: itemIndex === activeVideo })}>
                          {/* <Typography gutterBottom variant="h5" component="h2">{item.title}</Typography> */}
                          <Typography variant="body2" component="p">{item.title}</Typography>
                          <Typography variant="body2" component="p" color="textSecondary">{item.author}</Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </ListItem>
                </Slide>
              )}
            </ul>
          </li>
        </List>
      </div>
    </Drawer>
  )
}

export default RoomDrawer