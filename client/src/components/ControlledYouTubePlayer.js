import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from "react"
import YouTubeEmbeddedPlayer from "./YouTubeEmbeddedPlayer"
import useLazyStateRef from "../hooks/useLazyStateRef"

const ControlledYouTubePlayer = ({
  video, paused, time, volume,
  onReady, onProgress, ytPlayerRef,
}, ref) => {
  const playerRef = useRef()
  const playerRef2 = useRef()

  useImperativeHandle(ytPlayerRef, () => playerRef2.current)

  useImperativeHandle(ref, () => playerRef.current)

  const [ready, setReady] = useState(false)
  const [playerState, setPlayerState] = useState(-1)

  const videoStateRef = useLazyStateRef(video)
  // const pausedStateRef = useLazyStateRef(paused)

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
    // [playerState] in dependency array improves responsiveness
    // when seeking
  }, [onProgress, ready, playerState])

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
        setPlayerState(e.data)
      }, [])}
      startTime={time}
    />
  )
}

export default forwardRef(ControlledYouTubePlayer)