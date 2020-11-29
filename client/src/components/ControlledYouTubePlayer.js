import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from "react"
import YouTubeEmbeddedPlayer from "./YouTubeEmbeddedPlayer"
import useLazyStateRef from "../hooks/useLazyStateRef"

const ControlledYouTubePlayer = ({
  video, paused, time, onReady,
  ytPlayerRef, onPause, onPlay, onSeek,
  playbackRate, onPlaybackRateChange, onMute, onVolume,
}, ref) => {
  const playerRef = useRef()
  const playerRef2 = useRef()
  const pauseTick = useRef(0)
  const bufferingTick = useRef(0)
  const seekHandle = useRef()
  const preChecks = useRef(false)

  useImperativeHandle(ytPlayerRef, () => playerRef2.current)
  useImperativeHandle(ref, () => playerRef.current)

  const [ready, setReady] = useState(false)

  const videoStateRef = useLazyStateRef(video)

  useEffect(() => {
    if (ready) {
      console.log("Load video", video)
      playerRef2.current.loadVideoById({
        videoId: video,
      })
    }
  }, [video, ready])

  /*
    There was a bug when a video had finished playing,
    and then it was selected in the queue to play again,
    the server would start playing it but the client's player
    would still be paused causing a powerpoint effect.
    This was caused by the player being played before it was
    seeked back to the start and because the player was already
    at the end of the video, it immediately paused itself. By
    adding the dependancy on [paused] it will cause it to fire
    again once the [newTime] state has updated in Room.js

    This isn't good enough, the video now skips whenever its paused
    but my brain is fried, rethink tomorrow :)
  */
  useEffect(() => {
    if (ready) {
      // if (videoStateRef.current && !pausedStateRef.current) {
      if (videoStateRef.current) {
        // console.log(`Seek to ${time}`)
        playerRef2.current.seekTo(time)
      }
    }
  }, [/*paused,*/ ready, time, videoStateRef])

  useEffect(() => {
    if (ready) {
      if (paused) {
        console.log("Pause video")
        playerRef2.current.pauseVideo()
      }
      else {
        console.log("Play video")
        playerRef2.current.playVideo()
      }
    }
  }, [paused, ready, video])

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
    preChecks.current = false
  }, [video])

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

        if (e.data === window.YT.PlayerState.PLAYING) {
          preChecks.current = true
          onPlay()
        }
        else if (e.data === window.YT.PlayerState.PAUSED) {
          pauseTick.current = Date.now()

          if (seekHandle.current) {
            clearTimeout(seekHandle.current)
            seekHandle.current = undefined
          }

          seekHandle.current = setTimeout(() => {
            if (!preChecks.current) {
              return
            }

            onPause()
            // playerRef2.current.seekTo(curTime + 0.3)
          }, 200)
        }
        else if (e.data === window.YT.PlayerState.BUFFERING) {
          bufferingTick.current = Date.now()

          if (seekHandle.current) {
            clearTimeout(seekHandle.current)
            seekHandle.current = undefined
          }

          if (bufferingTick.current - pauseTick.current <= 200) {
            if (!preChecks.current) {
              return
            }

            onSeek(playerRef2.current.getCurrentTime() || 0)
          }
        }
      }, [onPause, onPlay, onSeek])}
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