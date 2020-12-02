import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from "react"
import YouTubeEmbeddedPlayer from "./YouTubeEmbeddedPlayer"
import useLazyStateRef from "../hooks/useLazyStateRef"

const ControlledYouTubePlayer = ({
  video, paused, time, onReady,
  ytPlayerRef, onPause, onPlay, onSeek,
  playbackRate, onPlaybackRateChange, onMute, onVolume,
  onDiff,
}, ref) => {
  const playerRef = useRef()
  const playerRef2 = useRef()
  const pauseTick = useRef(0)
  const seekHandle = useRef()
  const preBufferState = useRef(0)
  const prevCurrentTime = useRef(0)
  const prevCurrentTimeTick = useRef(0)

  useImperativeHandle(ytPlayerRef, () => playerRef2.current)
  useImperativeHandle(ref, () => playerRef.current)

  const [ready, setReady] = useState(false)
  const [preBuffered, setPreBuffered] = useState(false)

  const timeRef = useLazyStateRef(time)

  const clearSeekCheck = useCallback(() => {
    if (seekHandle.current) {
      clearTimeout(seekHandle.current)
      seekHandle.current = undefined
    }
  }, [])

  useEffect(() => {
    console.log("Setting pre-buffer state to 0")
    preBufferState.current = 0
    prevCurrentTime.current = 0
    setPreBuffered(false)
    clearSeekCheck()
  }, [video, clearSeekCheck])

  useEffect(() => {
    if (ready) {
      console.log("Load %s at %.2fs", video, timeRef.current)
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

    console.log("Difference between client and server is %.2fs", difference)
    onDiff(difference)

    if (absDifference > 1) {
      console.log("Seeking to %.2fs", time)
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

        if (e.data === window.YT.PlayerState.PLAYING) {
          onPlay()
        }
        else if (e.data === window.YT.PlayerState.PAUSED) {
          pauseTick.current = Date.now()

          clearSeekCheck()
          seekHandle.current = setTimeout(() => {
            onPause()
            // playerRef2.current.seekTo(curTime + 0.3)
          }, 200)
        }
        else if (e.data === window.YT.PlayerState.BUFFERING) {
          const currentTime = playerRef2.current.getCurrentTime() || 0

          clearSeekCheck()
          if (Date.now() - pauseTick.current <= 200) {
            onSeek(currentTime)
          }
          else {
            // Attempt to detect seeking with arrow keys
            const prevCurrentTimeEstimate = prevCurrentTime.current + ((Date.now() - prevCurrentTimeTick.current) / 1000)
            const seekDiff = currentTime - prevCurrentTimeEstimate
            const absSeekDiff = Math.abs(seekDiff)
  
            const syncDiff = Math.abs(timeRef.current - currentTime)
  
            if (absSeekDiff >= 4.8 && absSeekDiff <= 5.2 && syncDiff >= 4 && syncDiff <= 6) {
              onSeek(playerRef2.current.getCurrentTime() || 0)
              console.log("Seeked %s5s with arrow key", seekDiff < 1 ? "-" : "+")
            }
          }
        }

        prevCurrentTime.current = playerRef2.current.getCurrentTime() || 0
        prevCurrentTimeTick.current = Date.now()
      }, [onPause, onPlay, onSeek, preBufferState, clearSeekCheck, timeRef])}
      onPlaybackRateChange={useCallback(e => {
        if (e.data !== playbackRate) {
          onPlaybackRateChange(e.data)
        }
      }, [playbackRate, onPlaybackRateChange])}
      startTime={time}
    />
  )
}

export default forwardRef(ControlledYouTubePlayer)