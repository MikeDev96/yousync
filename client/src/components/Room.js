import React, { useRef, useEffect, useCallback, useState, Fragment } from "react";
import "../App.css";
import useLazyStateRef from "../hooks/useLazyStateRef";
import ControlledYouTubePlayer from "./ControlledYouTubePlayer";
import { makeStyles, Typography, AppBar, Toolbar, IconButton, Chip, Tooltip, Slider, Avatar, Grow, Snackbar } from "@material-ui/core";
import AvatarGroup from "@material-ui/lab/AvatarGroup"
import 'fontsource-roboto';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import VolumeMuteIcon from '@material-ui/icons/VolumeMute';
import ReplayIcon from '@material-ui/icons/Replay';
import { useParams, useHistory } from "react-router-dom";
import io from "socket.io-client"
import Alert from "@material-ui/lab/Alert"
import useDefaultUsername from "../hooks/useDefaultUsername";
import RoomDrawer from "./RoomDrawer";
import usePrevious from "../hooks/usePrevious";
import useGlobalState from "../state/useGlobalState";
import { setVolume, toggleMute } from "../state/actions";

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
    '&:focus > .MuiSlider-thumb, &:hover > .MuiSlider-thumb, &$active': {
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
    tick: 0,
    elapsed: 0,
    video: "",
    duration: 0,
    queue: [],
    activeItem: -1,
    finished: true,
  })

  const [clientsState, setClientsState] = useState([])
  const [ready, setReady] = useState(false)
  const [playTime, setPlayTime] = useState(0)
  const [newTime, setNewTime] = useState(0)
  const [ping, setPing] = useState(-1)
  const [diff, setDiff] = useState(0)
  const [seek, setSeek] = useState(0)
  const [userSeek, setUserSeek] = useState(-1)
  const [, setBuffered] = useState(0)
  const [snackbarError, setSnackbarOpen] = useState("")
  const [playerBounds, setPlayerBounds] = useState([0, 0, 0])

  const playerRef = useRef()
  const webSocketRef = useRef()
  const ytPlayerRef = useRef()
  const playerContainerRef = useRef()
  const chinContainerRef = useRef()

  const playerStateRef = useLazyStateRef(playerState)
  const prevClientsState = usePrevious(clientsState)

  const username = useDefaultUsername()
  const { state, dispatch } = useGlobalState()

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
    })

    socket.on("STATE", data => setPlayerState(data))
    socket.on("ELAPSED", ms => setPlayerState(ps => ({ ...ps, elapsed: ms })))
    socket.on("CLIENTS_STATE", data => setClientsState(data))
    socket.on("ERROR", err => setSnackbarOpen(err))

    socket.on("pong", ms => setPing(ms))
    socket.on("disconnect", () => history.replace("/"))

    return () => {
      socket.disconnect()
    }
  }, [history, roomId, username])

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
      const iframeHeight = Math.ceil(entries[0].contentRect.height - chinContainerRef.current.clientHeight)
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
          <div style={{ width: playerBounds[0], height: playerBounds[1], marginLeft: playerBounds[2] }}>
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
              onProgress={useCallback((playTime, duration, buffered) => {
                setPlayTime(playTime)
                setSeek(playTime / duration)
                setBuffered(buffered)
              }, [])}
              volume={state.persist.muted ? 0 : state.persist.volume}
            />
          </div>
          <div ref={chinContainerRef} className={classes.chinContainer} style={{ width: playerBounds[0], marginLeft: playerBounds[2] }}>
            <Slider
              // ThumbComponent={props => {
              //   if (userSeek >= 0) {
              //     return <Tooltip arrow placement="top" title={sToTimestamp(userSeek / 100 * playerState.duration)} open TransitionProps={{ timeout: 0 }}>
              //       <span {...props} />
              //     </Tooltip>
              //   }
              //   else {
              //     return <span {...props} />
              //   }
              // }}
              classes={{ root: classes.timeSlider, rail: classes.timeSliderRail, track: classes.timeSliderTrack, thumb: classes.timeSliderThumb }}
              value={userSeek >= 0 ? userSeek : seek * 100}
              onChange={(_e, value) => setUserSeek(value)}
              step={0.01}
              onChangeCommitted={(_e, value) => {
                webSocketRef.current.emit("SEEK", value / 100 * playerState.duration)
                setUserSeek(-1)
              }}
            />
            <AppBar component="div" color="secondary" position="static">
              <Toolbar variant="dense">
                <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={playerState.paused ? play : pause}>
                  {playerState.finished ? <ReplayIcon /> : playerState.paused ? <PlayArrowIcon /> : <PauseIcon />}
                </IconButton>
                <IconButton className={classes.volumeButton} color="inherit" aria-label="menu" onClick={() => dispatch(toggleMute())}>
                  {state.persist.volume === 0 || state.persist.muted ? <VolumeMuteIcon /> : state.persist.volume < 50 ? <VolumeDown /> : <VolumeUp />}
                </IconButton>
                <Slider className={classes.sliderRoot} value={state.persist.muted ? 0 : state.persist.volume} onChange={(_e, value) => dispatch(setVolume(value))} />
                <Typography className={classes.timePlayed}>{sToTimestamp(playTime)} / {sToTimestamp(playerState.duration)}</Typography>
                <Tooltip title="This is how many seconds behind or ahead of the server you are & your latency">
                  <Chip color="primary" size="small" label={`${diff > 0 ? "+" : ""}${diff.toFixed(2)}s / ${ping}ms`} />
                </Tooltip>
                <Typography className={classes.syncDiff} />
                <AvatarGroup className={classes.avatars} max={15}>
                  {clientsState.map(client =>
                    <Grow key={client.id} in timeout={600}>
                      <Tooltip title={client.username}>
                        <Avatar className={classes.avatar}>{client.username[0].toUpperCase()}</Avatar>
                      </Tooltip>
                    </Grow>
                  )}
                </AvatarGroup>
                <IconButton edge="end" color="inherit" aria-label="menu" onClick={() => playerRef.current.requestFullscreen()}>
                  <FullscreenIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
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
        activeVideo={playerState.activeItem}
        playTime={playerState.elapsed / 1000}
      />
    </Fragment>
  );
}

const sToTimestamp = s => {
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor(s % 3600 / 60)
  const seconds = Math.floor(s % 3600 % 60)

  const hoursStr = hours > 0 ? `${hours.toString().padStart(2, "0")}:` : ""

  return `${hoursStr}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}


export default Room