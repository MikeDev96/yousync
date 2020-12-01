import React from "react"
import "../App.css"
import { makeStyles, ThemeProvider, createMuiTheme, CssBaseline } from "@material-ui/core"
import "fontsource-roboto"
import { blue } from "@material-ui/core/colors"
import useDefaultUsername from "../hooks/useDefaultUsername"
import LayoutAppBar from "./LayoutAppBar"

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
        // "*": {
        //   "scrollbar-width": "thin",
        // },
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

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
  },
}))

const Layout = ({
  children,
}) => {
  const classes = useStyles()
  const username = useDefaultUsername()

  if (!username) {
    return null
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={classes.root}>
        <CssBaseline />
        <LayoutAppBar />
        {children}
      </div>
    </ThemeProvider>
  )
}

export default Layout