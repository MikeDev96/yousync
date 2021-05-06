import React, { useRef, useEffect, useCallback, useState, Fragment } from "react"
import "../App.css"
import useLazyStateRef from "../hooks/useLazyStateRef"
import ControlledYouTubePlayer from "./ControlledYouTubePlayer"
import { makeStyles, Typography, Toolbar, Snackbar, Fade } from "@material-ui/core"
import "fontsource-roboto"
import { useParams, useHistory } from "react-router-dom"
import io from "socket.io-client"
import Alert from "@material-ui/lab/Alert"
import useDefaultUsername from "../hooks/useDefaultUsername"
import RoomDrawer from "./RoomDrawer"
import usePrevious from "../hooks/usePrevious"
import useVisibility from "../hooks/useVisibility"
import { setRoomName } from "../state/actions"
import useGlobalState from "../state/useGlobalState"

const useStyles = makeStyles((theme) => ({
  main: {
    flexGrow: 1,
    display: "grid",
    padding: theme.spacing(2),
    gridTemplateRows: "auto minmax(0, 1fr)",
    height: "100vh",
  },
  playerContainer: {
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
  },
  player: {
    borderRadius: theme.spacing(0.5),
  },
  splash: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    display: "flex",
    alignItems: "start",
    justifyContent: "center",
    flexDirection: "column",
    borderRadius: theme.spacing(0.5),
  },
  splashHeader: {
    padding: theme.spacing(1, 2),
    background: "rgba(0,0,0,.6)",
    borderTopRightRadius: theme.spacing(1),
    borderBottomRightRadius: theme.spacing(1),
    maxWidth: 400,
    zIndex: 1,
  },
  splashHeaderText: {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
  splashLogo: {
    position: "absolute",
    left: "50%",
    top: "50%",
    animation: "$beat 3s infinite ease-in-out",
    marginLeft: -48,
    marginTop: -48,
  },
  "@keyframes beat": {
    "0%": {
      transform: "scale(0.9)",
    },
    "50%": {
      transform: "scale(1)",
    },
    "100%": {
      transform: "scale(0.9)",
    },
  }
}))

const initialState = {
  paused: true,
  tick: 0,
  elapsed: 0,
  video: "",
  duration: 0,
  queue: [],
  activeItem: -1,
  speed: 1,
  statusText: "",
}

const Room = () => {
  const { roomId } = useParams()
  const history = useHistory()
  const classes = useStyles()

  const [playerState, setPlayerState] = useState(initialState)
  const [clientsState, setClientsState] = useState([])
  const [ready, setReady] = useState(false)
  const [diff, setDiff] = useState(0)
  const [snackbarError, setSnackbarOpen] = useState("")
  const [playerBounds, setPlayerBounds] = useState([0, 0, 0])
  const [muted, setMuted] = useState(-1)
  const [volume, setVolume] = useState(-1)
  const [status, setStatus] = useState("")
  const [loaded, setLoaded] = useState(false)

  const playerRef = useRef()
  const webSocketRef = useRef()
  const ytPlayerRef = useRef()
  const playerContainerRef = useRef()

  const playerStateRef = useLazyStateRef(playerState)
  const prevClientsState = usePrevious(clientsState)
  const diffRef = useLazyStateRef(diff)
  const { dispatch } = useGlobalState()

  const username = useDefaultUsername()
  const visibility = useVisibility()

  const play = useCallback(() => {
    if (playerStateRef.current.paused) {
      webSocketRef.current.emit("PLAY")
    }
  }, [playerStateRef])

  const pause = useCallback(() => {
    if (!playerStateRef.current.paused) {
      webSocketRef.current.emit("PAUSE")
    }
  }, [playerStateRef])

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

    const handleStatus = statusText => {
      if (statusText) {
        setStatus(statusText)
      }
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
      handleStatus(data.player.statusText)
    })

    socket.on("STATE", data => {
      setPlayerState(data)
      handleStatus(data.statusText)
    })
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
      webSocketRef.current.emit("PING", ms, parseFloat(diffRef.current.toFixed(2)))
    })
    // socket.on("disconnect", () => history.replace("/"))

    return () => {
      socket.disconnect()
    }
  }, [history, roomId, username, diffRef])

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

  useEffect(() => {
    if (ready) {
      webSocketRef.current.emit("CLIENT_UPDATE", visibility, muted, parseFloat(volume.toFixed(2)))
    }
  }, [ready, visibility, muted, volume])

  useEffect(() => {
    dispatch(setRoomName(roomId ? roomId.split("-").map(w => `${w[0].toUpperCase()}${w.slice(1)}`).join(" ") : ""))
  }, [dispatch, roomId])

  return (
    <Fragment>
      <main className={classes.main}>
        <Toolbar variant="dense" />
        <div ref={playerContainerRef} className={classes.playerContainer}>
          <div style={{ width: playerBounds[0], height: playerBounds[1], marginLeft: playerBounds[2], position: "relative" }}>
            <div className={classes.splash} style={{ background: playerState.activeItem < 0 || !loaded ? "#282828" : null }}>
              <Fade in={!!playerState.statusText}>
                <Typography className={classes.splashHeader} variant="h6" style={{ display: "flex", alignItems: "center" }}>
                  <div className={classes.splashHeaderText}>{status}</div>
                </Typography>
              </Fade>
              {(playerState.activeItem < 0 || !loaded) && <img className={classes.splashLogo} src={`${process.env.PUBLIC_URL}/favicon-96x96.png`} alt="Home" />}
            </div>
            <ControlledYouTubePlayer
              className={classes.player}
              ytPlayerRef={ytPlayerRef}
              ref={playerRef}
              video={playerState.video}
              duration={playerState.duration}
              paused={playerState.paused}
              time={playerState.elapsed / 1000}
              onReady={useCallback(() => {
                setReady(true)
              }, [])}
              onPause={pause}
              onPlay={play}
              onSeek={useCallback((seconds, diff) => webSocketRef.current.emit("SEEK", seconds, diff), [])}
              playbackRate={playerState.speed}
              onPlaybackRateChange={useCallback(speed => webSocketRef.current.emit("SET_SPEED", speed), [])}
              onMute={useCallback(muted => setMuted(+muted), [])}
              onVolume={setVolume}
              onDiff={setDiff}
              onLoaded={setLoaded}
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
        onVideoClick={useCallback(videoIndex => {
          if (videoIndex !== playerStateRef.current.activeItem) {
            webSocketRef.current.emit("SELECT_VIDEO", videoIndex)
          }
        }, [playerStateRef])}
        onVideoRemove={useCallback(videoIndex => webSocketRef.current.emit("REMOVE_VIDEO", videoIndex), [])}
        activeVideo={playerState.activeItem}
        playTime={Math.max(Math.min(playerState.elapsed / 1000, playerState.duration), 0)}
      />
    </Fragment>
  )
}

export default Room