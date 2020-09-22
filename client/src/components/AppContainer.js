import React, { forwardRef } from "react";
import { makeStyles, Toolbar } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    height: "100vh",
  },
}))

const AppContainer = ({
  children,
}, ref) => {
  const classes = useStyles()

  return (
    <main className={classes.content} ref={ref}>
      <Toolbar variant="dense" />
      {children}
    </main>
  );
}

export default forwardRef(AppContainer)