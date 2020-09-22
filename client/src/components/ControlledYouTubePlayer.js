import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from "react"
import YouTubeEmbeddedPlayer from "./YouTubeEmbeddedPlayer"
import useLazyStateRef from "../hooks/useLazyStateRef"

const ControlledYouTubePlayer = ({
  video, paused, time, volume,
  onReady, onProgress,
}, ref) => {
  const playerRef = useRef()
  const playerRef2 = useRef()

  useImperativeHandle(ref, () => playerRef.current)

  const [ready, setReady] = useState(false)

  const videoStateRef = useLazyStateRef(video)
  const pausedStateRef = useLazyStateRef(paused)

  useEffect(() => {
    console.log({ready,video})
    if (ready) {
      if (video) {
        console.log("Load video", video)
        playerRef2.current.cueVideoById({
          videoId: video,
        })
      }
    }
  }, [video, ready])

  useEffect(() => {
    if (ready) {
      // if (videoStateRef.current && !pausedStateRef.current) {
      if (videoStateRef.current) {
        playerRef2.current.seekTo(time)
      }
    }
  }, [pausedStateRef, ready, time, videoStateRef])

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
      const callback = () => {
        const playTime = playerRef2.current.getCurrentTime() || 0
        const duration = playerRef2.current.getDuration() || 0
        const buffered = playerRef2.current.getVideoLoadedFraction() || 0
        onProgress(playTime, duration, buffered)
      }

      callback()
      const handle = setInterval(callback, 1000)

      return () => {
        clearInterval(handle)
      }
    }
  }, [onProgress, ready])

  useEffect(() => {
    if (ready) {
      playerRef2.current.setVolume(volume)
    }
  }, [volume, ready])

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
        // console.log(e.data)
      }, [])}
      startTime={time}
    />
  )
}

export default forwardRef(ControlledYouTubePlayer)