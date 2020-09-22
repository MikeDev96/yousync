import React, { useCallback } from "react";
import { Typography, Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { APP_NAME } from "./Layout";
import AppContainer from "./AppContainer";

const Home = () => {
  const history = useHistory()

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
        history.replace(`/room/${data.id}`)
      }
    }
    catch (err) {
      console.log([err])
    }
  }, [history])

  return (
    <AppContainer>
      <Typography align="center" variant="h1" component="h2" gutterBottom>
        Welcome to {APP_NAME}
      </Typography>
      <Button variant="contained" color="primary" onClick={createRoom}>
        Create Room
      </Button>
      </AppContainer>
  );
}

export default Home