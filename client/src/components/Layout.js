import React, { useCallback } from "react"
import "../App.css"
import AppBar from "@material-ui/core/AppBar"
import { Toolbar, IconButton, Typography, makeStyles, ThemeProvider, createMuiTheme, CssBaseline, Button } from "@material-ui/core"
import "fontsource-roboto"
import SettingsIcon from "@material-ui/icons/Settings";
import SettingsDialog from "./SettingsDialog"
import { useQueryParams, BooleanParam, withDefault } from "use-query-params"
import { blue } from "@material-ui/core/colors"
import { Link as RouterLink } from "react-router-dom"
import useDefaultUsername from "../hooks/useDefaultUsername"

export const APP_NAME = "YouSync"

const darkTheme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: blue,
    // secondary: {
    //   main: "#5e3c6f",
    // },
    type: "dark",
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        "*": {
          "scrollbar-width": "thin",
        },
        "::-webkit-scrollbar": {
          background: "#303030",
          width: 7,
        },
        "::-webkit-scrollbar-track": {
          background: "#606060",
        },
        "::-webkit-scrollbar-thumb": {
          background: "#9e9e9e",
          borderRadius: 10,
        },
      }
    }
  }
})

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  menuButton: {
    textTransform: "none",
  },
  spacer: {
    flexGrow: 1,
  },
  container: {
    marginTop: theme.spacing(3),
    maxWidth: "none",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
}))

const Layout = ({
  children,
}) => {
  const classes = useStyles()
  const username = useDefaultUsername()

  const [query, setQuery] = useQueryParams({
    settings: withDefault(BooleanParam, false),
  })

  const handleOpen = useCallback(() => setQuery({ settings: true }), [setQuery])
  const handleClose = useCallback(() => setQuery({ settings: undefined }), [setQuery])

  if (!username) {
    return null
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar className={classes.appBar} position="fixed">
          <Toolbar variant="dense">
            <Button startIcon={<img src={`${process.env.PUBLIC_URL}/favicon-32x32.png`} alt="Home" />} component={RouterLink} to="/" edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
              <Typography variant="h6" className={classes.title}>
                {APP_NAME}
              </Typography>
            </Button>
            <div className={classes.spacer} />
            <IconButton edge="end" onClick={handleOpen}>
              <SettingsIcon />
            </IconButton>
            <SettingsDialog open={query.settings} onClose={handleClose} />
          </Toolbar>
        </AppBar>
        {/* <main className={classes.content}>
          <Toolbar variant="dense" />
          {children}
        </main>
        <Test /> */}
        {children}
      </div>
    </ThemeProvider>
  )
}

export default Layout