import React, { Fragment } from "react"
import { Typography, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core"

const RoomStats = ({
  serverTime, difference,
}) => {
  return (
    <Fragment>
      <Typography variant="h6">Stats</Typography>
      <List component="nav" aria-label="main mailbox folders">
        <ListItem>
          <ListItemText primary="Server Time" secondary={`${serverTime} (${difference > 0 ? "+"+difference : difference})`} />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Video 2" />
        </ListItem>
      </List>
    </Fragment>
  )
}

export default RoomStats