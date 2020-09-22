import React, { Fragment } from "react"
import { List, ListItem, ListItemText, makeStyles, ListItemAvatar, Avatar, Grow, ListItemSecondaryAction, Tooltip } from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  },
  addVideoPaper: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  listItemAvatarRoot: {
    // minWidth: theme.overrides.MuiAvatar.root.height / 9 * 16 + (theme.overrides.MuiListItemAvatar.root.minWidth - theme.overrides.MuiAvatar.root.height)
    minWidth: 40 / 9 * 16 + theme.spacing(2),
  },
  avatarRoot: {
    borderRadius: 0,
    // width: theme.overrides.MuiAvatar.root.height / 9 * 16,
    width: 40 / 9 * 16,
  },
  addedAvatar: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
}));

const RoomQueue = ({
  queue, activeVideo, onVideoClick,
}) => {
  const classes = useStyles();

  return (
    <Fragment>
      {/* <Typography variant="h6" sub>Add Video</Typography>
      <Paper className={classes.addVideoPaper}>
        <form className={classes.root} noValidate autoComplete="off">
          <TextField
            id="standard-basic"
            label="YouTube Link"
            value={url}
            onChange={e => setUrl(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <YouTubeIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit">
                    <YouTubeIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </form>
      </Paper> */}
      {!!queue.length && <List dense>
        {queue.map((item, itemIndex) =>
          <Grow key={itemIndex} in timeout={600}>
            {/* This div is needed so the grow animation works */}
            <div>
            <ListItem button selected={itemIndex === activeVideo} onClick={() => onVideoClick(itemIndex)}>
              <ListItemAvatar className={classes.listItemAvatarRoot}>
                {/* <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" /> */}
                <Avatar className={classes.avatarRoot} src={item.thumbnail} />
              </ListItemAvatar>
              <ListItemText primary={item.title} secondary={item.author} />
              {/* Div required so grow animation works o.0 */}
              {/* <div> */}
              <ListItemSecondaryAction>
                <Tooltip title="Added by Mike">
                  <Avatar className={classes.addedAvatar}>M</Avatar>
                </Tooltip>
              </ListItemSecondaryAction>
              {/* </div> */}
            </ListItem>
            </div>
          </Grow>
        )}
        {/* <ListItem button selected>
          <ListItemText primary="Video 1" />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Video 2" />
        </ListItem> */}
      </List>
}
    </Fragment>
  )
}

export default RoomQueue