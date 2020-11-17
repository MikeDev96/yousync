import React, { useRef, useEffect, useCallback, useState, Fragment } from "react";
import "../App.css";
import useLazyStateRef from "../hooks/useLazyStateRef";
import ControlledYouTubePlayer from "./ControlledYouTubePlayer";
import { makeStyles, Typography, Toolbar, Grow, Snackbar } from "@material-ui/core";
import "fontsource-roboto";
import PauseIcon from "@material-ui/icons/Pause";
import { useParams, useHistory } from "react-router-dom";
import io from "socket.io-client"
import Alert from "@material-ui/lab/Alert"
import useDefaultUsername from "../hooks/useDefaultUsername";
import RoomDrawer from "./RoomDrawer";
import usePrevious from "../hooks/usePrevious";
import useGlobalState from "../state/useGlobalState";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "rgba(255,255,255,.5)",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    height: "100vh",
    // Required for the fluid video player
    overflow: "hidden",
  },
  bar1Buffer: {
    backgroundColor: "red",
  },
  // menuButton: {
  //   marginRight: theme.spacing(2),
  // },
  volumeButton: {
    marginRight: theme.spacing(2),
  },
  // buffer: rgba(255,255,255,.2)
  timePlayed: {
    marginRight: theme.spacing(2),
  },
  syncDiff: {
    flexGrow: 1,
  },
  sliderRoot: {
    width: 64,
    // marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    color: "white",
  },
  timeSlider: {
    // marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    color: "white",
    height: 4,
    padding: 0,
    "&:focus > .MuiSlider-thumb, &:hover > .MuiSlider-thumb, &$active": {
      display: "initial",
    },
    // Makes the scrubber easier to grab
    marginTop: -10,
    paddingTop: 10,
  },
  timeSliderRail: {
    // marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    color: "white",
    height: 4,
  },
  timeSliderThumb: {
    marginTop: -4,
    color: "red",
    zIndex: 1101,
    display: "none",
  },
  timeSliderTrack: {
    height: 4,
    color: "red",
  },
  avatars: {
    marginRight: theme.spacing(2),
    "& > *": {
      width: theme.spacing(4),
      height: theme.spacing(4),
    }
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
    borderColor: "#fff",
  },

  videoBackground: {
    position: "relative",
    overflow: "hidden",
    width: "100vw",
    height: "100vh",

    "& > iframe": {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "100vw",
      height: "100vh",
      transform: "translate(-50%, -50%)",
      "@media (min-aspect-ratio: 16/9)": {
        height: "56.25vw",
      },
      "@media (max-aspect-ratio: 16/9)": {
        width: "177.78vh",
      },
    },
  },
  main: {
    flexGrow: 1,
    display: "grid",
    padding: theme.spacing(3),
    gridTemplateRows: "auto auto minmax(0, 1fr)",
    height: "100vh",
  },
  playerContainer: {
    overflow: "hidden",
  },
  chinContainer: {
    display: "flex",
    flexDirection: "column",
  },
}))

function Room() {
  const { roomId } = useParams()
  const history = useHistory()

  const classes = useStyles()

  const [playerState, setPlayerState] = useState({
    paused: true,
    pauser: "",
    tick: 0,
    elapsed: 0,
    video: "",
    duration: 0,
    queue: [],
    activeItem: -1,
    finished: true,
    speed: 1,
  })

  const [clientsState, setClientsState] = useState([])
  const [ready, setReady] = useState(false)
  const [newTime, setNewTime] = useState(0)
  const [diff, setDiff] = useState(0)
  const [snackbarError, setSnackbarOpen] = useState("")
  const [playerBounds, setPlayerBounds] = useState([0, 0, 0])
  const [init, setInit] = useState(false)

  const playerRef = useRef()
  const webSocketRef = useRef()
  const ytPlayerRef = useRef()
  const playerContainerRef = useRef()

  const playerStateRef = useLazyStateRef(playerState)
  const prevClientsState = usePrevious(clientsState)
  const diffRef = useLazyStateRef(diff)

  const username = useDefaultUsername()
  const { state } = useGlobalState()

  const someVideos = !!playerState.queue.length

  const play = useCallback(() => webSocketRef.current.emit("PLAY"), [])
  const pause = useCallback(() => webSocketRef.current.emit("PAUSE"), [])

  const handleSnackbarClose = (e, reason) => {
    if (reason === "clickaway") {
      return
    }

    setSnackbarOpen("")
  }

  useEffect(() => {
    const socketOptions = {
      query: {
        id: roomId,
        username,
      },
      path: `${process.env.PUBLIC_URL}/socket.io`,
      transports: ["websocket", "polling"],
    }

    // https://github.com/facebook/create-react-app/issues/5280
    const socket = process.env.NODE_ENV === "development" ?
      io(process.env.REACT_APP_DEV_WS_URL, socketOptions) :
      io(socketOptions)

    socket.on("connect", () => {
      console.log("WS open")

      webSocketRef.current = socket
    })

    socket.on("error", err => {
      console.log(err)

      switch (err) {
        case "No room id was provided":
        case "Room id provided is invalid": {
          history.replace("/")
          break
        }
        default:
          break
      }
    })

    socket.on("INITIAL_STATE", data => {
      setPlayerState(data.player)
      setClientsState(data.clients)
      setInit(true)
    })

    socket.on("STATE", data => setPlayerState(data))
    socket.on("ELAPSED", ms => setPlayerState(ps => ({ ...ps, elapsed: ms })))
    socket.on("CLIENTS_STATE", data => setClientsState(data))
    socket.on("CLIENT", newClient => {
      setClientsState(cs => {
        const clientIndex = cs.findIndex(c => c.id === newClient.id)
        if (clientIndex >= 0) {
          const newClientsState = [...cs]
          newClientsState[clientIndex] = newClient
          return newClientsState
        }

        return cs
      })
    })
    socket.on("ERROR", err => setSnackbarOpen(err))

    socket.on("pong", ms => {
      webSocketRef.current.emit("PING", ms, diffRef.current.toFixed(2))
    })
    // socket.on("disconnect", () => history.replace("/"))

    return () => {
      socket.disconnect()
    }
  }, [history, roomId, username, diffRef])

  useEffect(() => {
    if (ready) {
      if (playerStateRef.current.video) {
        const serverTime = playerState.elapsed
        const serverTimeRound = serverTime / 1000
        const livePlayTime = ytPlayerRef.current.getCurrentTime() || 0
        const difference = livePlayTime - serverTimeRound
        const differenceAbs = Math.abs(livePlayTime - serverTimeRound)

        console.log("Server:", parseFloat(serverTimeRound.toFixed(2)), "Client:", parseFloat(livePlayTime.toFixed(2)), "Diff:", difference.toFixed(2), "paused", playerStateRef.current.paused, "elapsed", playerState.elapsed)
        setDiff(difference)

        if (differenceAbs > state.persist.syncThreshold) {
          console.log("Diff", difference, "is more than 1 second, syncing...")
          setNewTime(serverTimeRound)
        }
      }
    }
  }, [playerState.elapsed, playerStateRef, ready, state.persist.syncThreshold])

  useEffect(() => {
    let sound = ""

    if (prevClientsState.length !== clientsState.length) {
      if (clientsState.length > prevClientsState.length) {
        sound = `${process.env.PUBLIC_URL}/sounds/bell.mp3`
      }
      else if (clientsState.length < prevClientsState.length) {
        sound = `${process.env.PUBLIC_URL}/sounds/bell_rev.mp3`
      }
    }

    if (sound) {
      const audio = new Audio(sound)
      audio.play()
    }
  }, [clientsState.length, prevClientsState.length])

  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      const containerWidth = entries[0].contentRect.width
      const iframeHeight = Math.ceil(entries[0].contentRect.height - 0)
      const iframeWidth = Math.floor(iframeHeight * (16 / 9))

      if (iframeWidth > containerWidth) {
        setPlayerBounds([containerWidth, Math.ceil(containerWidth * (9 / 16)), 0])
      }
      else {
        const constrainedWidth = Math.min(iframeWidth, containerWidth)
        setPlayerBounds([constrainedWidth, iframeHeight, (containerWidth - constrainedWidth) / 2])
      }
    })

    const el = playerContainerRef.current
    ro.observe(el)

    return () => {
      ro.unobserve(el)
    }
  }, [])

  return (
    <Fragment>
      <main className={classes.main}>
        <Toolbar variant="dense" />
        <div style={{ marginLeft: playerBounds[2] }}>
          <Typography variant="h5" gutterBottom={playerState.activeItem < 0}>
            {playerState.activeItem >= 0 ? playerState.queue[playerState.activeItem].title :
              roomId ? `Welcome, you're in room '${roomId.split("-").map(w => `${w[0].toUpperCase()}${w.slice(1)}`).join(" ")}'` : "Welcome"
            }
          </Typography>
          {playerState.activeItem >= 0 && <Typography variant="subtitle1" color="textSecondary" gutterBottom>{playerState.queue[playerState.activeItem].author}</Typography>}
        </div>
        <div ref={playerContainerRef} className={classes.playerContainer}>
          <div style={{ width: playerBounds[0], height: playerBounds[1], marginLeft: playerBounds[2], position: "relative" }}>
            <Grow in={init && (!someVideos || (playerState.paused && !playerState.finished))}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.8)", borderRadius: 8, padding: 16, }}>
                  {!someVideos || !playerState.pauser ? <div style={{ fontSize: "12em" }}>{"😎"}</div> : <PauseIcon style={{ fontSize: "16em" }} />}
                  <Typography variant="h4" style={{ padding: "8px 16px", maxWidth: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                    {!someVideos || !playerState.pauser ? "Welcome to YouSync" : `Paused by ${playerState.pauser}`}
                  </Typography>
                  {(!someVideos || !playerState.pauser) && <Typography variant="subtitle1" color="textSecondary">{"Created by Mike"}</Typography>}
                </div>
              </div>
            </Grow>
            <ControlledYouTubePlayer
              ytPlayerRef={ytPlayerRef}
              ref={playerRef}
              video={playerState.video}
              duration={playerState.duration}
              paused={playerState.paused}
              time={newTime}
              onReady={useCallback(() => {
                setReady(true)
              }, [])}
              onPause={pause}
              onPlay={play}
              onSeek={useCallback(seconds => webSocketRef.current.emit("SEEK", seconds), [])}
              playbackRate={playerState.speed}
              onPlaybackRateChange={useCallback(speed => webSocketRef.current.emit("SET_SPEED", speed), [])}
            />
          </div>
        </div>
        <Snackbar open={!!snackbarError} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert elevation={6} variant="filled" onClose={handleSnackbarClose} severity="error">
            {snackbarError}
          </Alert>
        </Snackbar>
      </main>
      <RoomDrawer
        queue={playerState.queue}
        clients={clientsState}
        onVideoAdd={url => webSocketRef.current.emit("VIDEO", url)}
        onVideoClick={videoIndex => webSocketRef.current.emit("SELECT_VIDEO", videoIndex)}
        onVideoRemove={videoIndex => webSocketRef.current.emit("REMOVE_VIDEO", videoIndex)}
        activeVideo={playerState.activeItem}
        playTime={playerState.elapsed / 1000}
      />
    </Fragment>
  );
}

export default Room