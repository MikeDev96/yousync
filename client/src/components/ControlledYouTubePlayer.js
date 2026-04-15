import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from "react"
import YouTubeEmbeddedPlayer from "./YouTubeEmbeddedPlayer"
import useLazyStateRef from "../hooks/useLazyStateRef"

const ControlledYouTubePlayer = ({
  video, paused, time, onReady,
  ytPlayerRef, onPause, onPlay, onSeek,
  playbackRate, onPlaybackRateChange, onMute, onVolume,
  onDiff, onLoaded, ...restProps
}, ref) => {
  const playerRef = useRef()
  const playerRef2 = useRef()
  const preBufferState = useRef(0)
  const lastTime = useRef(-1)
  const pauseTimeoutHandle = useRef()
  const ignoreSeeking = useRef(false)

  useImperativeHandle(ytPlayerRef, () => playerRef2.current)
  useImperativeHandle(ref, () => playerRef.current)

  const [ready, setReady] = useState(false)
  const [preBuffered, setPreBuffered] = useState(false)

  const timeRef = useLazyStateRef(time)

  useEffect(() => {
    console.log("Setting pre-buffer state to 0")
    preBufferState.current = 0
    setPreBuffered(false)
    onLoaded(false)
  }, [video, onLoaded])

  useEffect(() => {
    if (ready) {
      console.log("Load %s at %s", video, timeRef.current)
      playerRef2.current.loadVideoById({
        videoId: video,
        startSeconds: timeRef.current,
      })
    }
  }, [video, ready, timeRef])

  useEffect(() => {
    if (!ready || preBufferState.current < 2) {
      return
    }

    if (paused) {
      console.log("Pause video")
      playerRef2.current.pauseVideo()
    }
    else {
      console.log("Play video")
      playerRef2.current.playVideo()
    }
  }, [paused, ready, video, preBuffered])

  useEffect(() => {
    if (ready) {
      if (playerRef2.current.getPlaybackRate() !== playbackRate) {
        playerRef2.current.setPlaybackRate(playbackRate)
      }
    }
  }, [playbackRate, ready])

  useEffect(() => {
    if (ready) {
      let muted = playerRef2.current.isMuted()
      if (typeof muted === "boolean") {
        onMute(muted)
      }

      let volume = playerRef2.current.getVolume()
      if (typeof volume === "number") {
        onVolume(volume)
      }

      const handle = setInterval(() => {
        const currentMuted = playerRef2.current.isMuted()
        if (currentMuted !== muted) {
          if (typeof currentMuted === "boolean") {
            onMute(currentMuted)
          }
          muted = currentMuted
        }

        const currentVolume = playerRef2.current.getVolume()
        if (currentVolume !== volume) {
          if (typeof currentVolume === "number") {
            onVolume(currentVolume)
          }
          volume = currentVolume
        }
      }, 1000)

      return () => {
        clearInterval(handle)
      }
    }
  }, [ready, onMute, onVolume])

  useEffect(() => {
    if (!ready || preBufferState.current < 2) {
      return
    }

    const currentTime = playerRef2.current.getCurrentTime() || 0
    const difference = currentTime - time
    const absDifference = Math.abs(difference)

    console.log("Difference between client and server is %s", difference)
    onDiff(difference)

    if (absDifference > 1) {
      console.log("Seeking to %s", time)
      ignoreSeeking.current = true
      playerRef2.current.seekTo(time)
    }
  }, [ready, time, preBuffered, onDiff])

  return (
    <YouTubeEmbeddedPlayer
      ref={playerRef}
      playerRef={playerRef2}
      onReady={useCallback(function (e) {
        console.log("Ready")
        setReady(true)
        onReady()
      }, [onReady])}
      onStateChange={useCallback(e => {
        // -1 (unstarted)
        // 0 (ended)
        // 1 (playing)
        // 2 (paused)
        // 3 (buffering)
        // 5 (video cued)
        // console.log(e.data)
        
        if (e.data !== window.YT.PlayerState.UNSTARTED) {
          onLoaded(true)
        }

        if (preBufferState.current < 2) {
          if (e.data === window.YT.PlayerState.BUFFERING) {
            if (preBufferState.current === 0) {
              console.log("Setting pre-buffer state to 1")
              preBufferState.current = 1
            }
          }
          else if (e.data === window.YT.PlayerState.PLAYING) {
            if (preBufferState.current === 1) {
              console.log("Setting pre-buffer state to 2")
              preBufferState.current = 2
              setPreBuffered(true)
            }
          }

          return
        }

        if (e.data === window.YT.PlayerState.BUFFERING) {
          clearTimeout(pauseTimeoutHandle.current)
          const currentTime = playerRef2.current.getCurrentTime()

          if (ignoreSeeking.current) {
            ignoreSeeking.current = false
            lastTime.current = currentTime
            return
          }

          if (lastTime.current >= 0 && Math.abs(currentTime - lastTime.current) > 1.5) {
            console.log(`Seek detected: ${lastTime.current.toFixed(2)}s → ${currentTime.toFixed(2)}s`)
            onSeek(currentTime, 0)
          }
        }

        if (e.data === window.YT.PlayerState.PLAYING) {
          clearTimeout(pauseTimeoutHandle.current)
          lastTime.current = playerRef2.current.getCurrentTime()
          onPlay()
        }

        if (e.data === window.YT.PlayerState.PAUSED) {
          pauseTimeoutHandle.current = setTimeout(() => {
            console.log("Real pause detected")
            lastTime.current = playerRef2.current.getCurrentTime()
            onPause()
          }, 200)
        }
      }, [onPause, onPlay, onSeek, preBufferState, onLoaded])}
      onPlaybackRateChange={useCallback(e => {
        if (e.data !== playbackRate) {
          onPlaybackRateChange(e.data)
        }
      }, [playbackRate, onPlaybackRateChange])}
      {...restProps}
    />
  )
}

export default forwardRef(ControlledYouTubePlayer)