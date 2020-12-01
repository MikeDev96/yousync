import React, { useCallback } from "react";
import { Typography, Button, makeStyles } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { APP_NAME } from "./Layout";
import AppContainer from "./AppContainer";

const useStyles = makeStyles(() => ({
  title: {
    marginTop: "1em",
  },
  buttonContainer: {
    textAlign: "center",
  },
}))

const Home = () => {
  const history = useHistory()

  const classes = useStyles()

  const createRoom = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.PUBLIC_URL}/api/room`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
        }
      })

      const data = await res.json()
      if (data.id) {
        history.push(`/room/${data.id}`)
      }
    }
    catch (err) {
      console.log([err])
    }
  }, [history])

  return (
    <AppContainer>
      <Typography align="center" className={classes.title} variant="h1" component="h2" gutterBottom>
        {`Welcome to ${APP_NAME}`}
      </Typography>
      <div className={classes.buttonContainer}>
        <Button variant="contained" color="primary" onClick={createRoom}>
          {"Create Room"}
        </Button>
      </div>
    </AppContainer>
  );
}

export default Home