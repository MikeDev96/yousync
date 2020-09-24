import { Fade } from "@material-ui/core"
import { makeStyles } from "@material-ui/core"
import React from "react"
import { Route, Switch } from "react-router-dom"
import Home from "./Home"
import Room from "./Room"

const routes = [
  { path: "/", Component: Home, exact: true },
  { path: "/room/:roomId", Component: Room },
]

const useStyles = makeStyles(() => ({
  route: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  root: {
    width: "100%",
    height: "100%",
    position: "relative",
  }
}))

const Routes = () => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {routes.map(({ path, Component, exact }) => (
        <Route key={path} exact={exact} path={path}>
          {({ match }) => (
            <Fade in={match !== null} unmountOnExit timeout={600}>
              <div className={classes.route}>
                <Component />
              </div>
            </Fade>
          )}
        </Route>
      ))}
    </div>
  )
}

export default Routes