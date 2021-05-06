import React, { useCallback, useState } from "react";
import { Typography, Button, FormLabel, FormControl, FormGroup, FormControlLabel, Checkbox, makeStyles } from "@material-ui/core";
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

  const [controlState, setControlState] = useState({
    sponsor: true,
    intro: false,
    outro: false,
    interaction: false,
    selfpromo: false,
    music_offtopic: false
  });

  const handleControlChange = (event) => {
    setControlState({ ...controlState, [event.target.name]: event.target.checked });
  };

  const createRoom = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.PUBLIC_URL}/api/room`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(controlState)
      })

      const data = await res.json()
      if (data.id) {
        history.push(`/room/${data.id}`)
      }
    }
    catch (err) {
      console.log([err])
    }
  }, [history, controlState])

  return (
    <AppContainer>
      <Typography align="center" className={classes.title} variant="h2" component="h2" gutterBottom>
        {`Welcome to ${APP_NAME}`}
      </Typography>
      <div className={classes.buttonContainer}>
        <Button variant="contained" color="primary" onClick={createRoom}>
          {"Create Room"}
        </Button>
      </div>
      <div className={classes.buttonContainer} style={{ marginTop: '50px' }}>
        <FormControl>
          <FormLabel>Sponsor Controls</FormLabel>
          <FormGroup>
            {Object.keys(controlState).map(control => {
              return (
                <FormControlLabel
                  control={<Checkbox name={control} defaultChecked={controlState[control]} onChange={handleControlChange} />}
                  label={control[0].toUpperCase() + control.substring(1, control.length)}
                />
              )
            })}
          </FormGroup>
        </FormControl>
      </div>
    </AppContainer>
  );
}

export default Home