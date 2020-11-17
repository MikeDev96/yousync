import React, { useEffect, forwardRef, useRef, useImperativeHandle } from "react"

const YouTubeEmbeddedPlayer = ({
  playerRef, onReady, onStateChange, onPlaybackRateChange,
}, ref) => {
  const tempRef = useRef({
    onReady,
    onStateChange,
    onPlaybackRateChange,
  })

  const ref2 = useRef()

  useImperativeHandle(ref, () => ref2.current)

  useEffect(() => {
    tempRef.current = {
      onReady,
      onStateChange,
      onPlaybackRateChange,
    }
  }, [onReady, onStateChange, onPlaybackRateChange])

  useEffect(() => {
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"

    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    const doThis = () => {
      const player = new window.YT.Player("player", {
        width: "100%",
        height: "100%",
        // videoId: "bScsFi6DaoM",
        playerVars: {
          modestbranding: 1,
          playsinline: 1,//t
          // mute: 1,
          autoplay: 0,
          // origin: "http://localhost:3000"
        },
        events: {
          onReady: function(e) {
            // console.log("onReady", e)
            tempRef.current.onReady(e)
          },
          onStateChange: function(e) {
            // console.log("onStateChange", e)
            tempRef.current.onStateChange(e)
          },
          onError: function(e){
            console.log(e)
          },
          onPlaybackRateChange: function(e) {
            tempRef.current.onPlaybackRateChange(e)
          }
        }
      })

      playerRef.current = player
      //player.getIframe()
      ref2.current = player.getIframe()
    }

    if (window.onYouTubeIframeAPIReady) {
      doThis()
    }
    else {
      window.onYouTubeIframeAPIReady = () => {
        doThis()
      }
    }

    return () => {
      tag.remove()
    }
  }, [playerRef])

  return (
    <div id="player" ref={ref} />
  //   <iframe ref={ref} id="player" type="text/html" width="640" height="360"
  // src="http://www.youtube.com/embed/VQwM1oMzne4?enablejsapi=1"
  // frameborder="0"></iframe>
  )
}

export default forwardRef(YouTubeEmbeddedPlayer)