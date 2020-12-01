import React, { useCallback } from "react"
import "../App.css"
import AppBar from "@material-ui/core/AppBar"
import { Toolbar, IconButton, Typography, makeStyles, Button } from "@material-ui/core"
import "fontsource-roboto"
import SettingsIcon from "@material-ui/icons/Settings"
import MenuIcon from "@material-ui/icons/Menu"
import SettingsDialog from "./SettingsDialog"
import { useQueryParams, BooleanParam, withDefault } from "use-query-params"
import { Link as RouterLink } from "react-router-dom"
import useDefaultUsername from "../hooks/useDefaultUsername"
import useDrawerContext from "../hooks/useDrawerContext"

const useStyles = makeStyles((theme) => ({
  homeButton: {
    textTransform: "none",
  },
  spacer: {
    flexGrow: 1,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  menuButton: {
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  buttonContainer: {
    marginRight: -theme.spacing(1.5),
  },
}))

const LayoutAppBar = () => {
  const classes = useStyles()
  const username = useDefaultUsername()
  const { toggle, enabled } = useDrawerContext()

  const [query, setQuery] = useQueryParams({
    settings: withDefault(BooleanParam, false),
  })

  const handleOpen = useCallback(() => setQuery({ settings: true }), [setQuery])
  const handleClose = useCallback(() => setQuery({ settings: undefined }), [setQuery])

  if (!username) {
    return null
  }

  return (
    <AppBar className={classes.appBar} position="fixed">
      <Toolbar variant="dense">
        <Button startIcon={<img src={`${process.env.PUBLIC_URL}/favicon-32x32.png`} alt="Home" />} component={RouterLink} to="/" edge="start" className={classes.homeButton} color="inherit" aria-label="menu">
          <Typography variant="h6">
            {"YouSync"}
          </Typography>
        </Button>
        <div className={classes.spacer} />
        <div className={classes.buttonContainer}>
          <IconButton onClick={handleOpen}>
            <SettingsIcon />
          </IconButton>
          {enabled &&
            <IconButton className={classes.menuButton} onClick={toggle}>
              <MenuIcon />
            </IconButton>
          }
        </div>
        <SettingsDialog open={query.settings} onClose={handleClose} />
      </Toolbar>
    </AppBar>
  )
}

export default LayoutAppBar