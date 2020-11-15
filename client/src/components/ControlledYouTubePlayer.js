import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from "react"
import YouTubeEmbeddedPlayer from "./YouTubeEmbeddedPlayer"
import useLazyStateRef from "../hooks/useLazyStateRef"

const ControlledYouTubePlayer = ({
  video, paused, time, onReady,
  ytPlayerRef, onPause, onPlay, onSeek,
}, ref) => {
  const playerRef = useRef()
  const playerRef2 = useRef()
  const pauseTick = useRef(0)
  const bufferingTick = useRef(0)
  const seekHandle = useRef()

  useImperativeHandle(ytPlayerRef, () => playerRef2.current)
  useImperativeHandle(ref, () => playerRef.current)

  const [ready, setReady] = useState(false)

  const videoStateRef = useLazyStateRef(video)

  useEffect(() => {
    if (ready) {
      if (video) {
        console.log("Load video", video)
        playerRef2.current.cueVideoById({
          videoId: video,
        })
      }
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
        console.log(e.data)
        if (e.data === 1) {
          onPlay()
        }
        else if (e.data === 2) {
          const curTime = playerRef2.current.getCurrentTime() || 0

          pauseTick.current = Date.now()
          seekHandle.current = setTimeout(() => {
            onPause()
            playerRef2.current.seekTo(curTime + 0.3)
          }, 200)
        }
        else if (e.data === 3) {
          bufferingTick.current = Date.now()

          if (seekHandle.current) {
            clearTimeout(seekHandle.current)
            seekHandle.current = undefined
          }

          if (bufferingTick.current - pauseTick.current <= 200) {
            onSeek(playerRef2.current.getCurrentTime() || 0)
          }
        }
      }, [onPause, onPlay, onSeek])}
      startTime={time}
    />
  )
}

export default forwardRef(ControlledYouTubePlayer)