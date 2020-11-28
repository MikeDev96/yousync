import React from "react"
import VideoItem from "./VideoItem"

const VideoRow = ({
  index, style, data
}) => {
  const { queue, activeVideo, playTime, classes, onVideoClick, onVideoRemove } = data
  const item = queue[index]

  return (
    <VideoItem
      key={index}
      classes={classes}
      elapsed={(index === activeVideo ? playTime : (item.elapsed / 1000)) / item.duration * 100}
      item={item}
      itemIndex={index}
      onVideoClick={onVideoClick}
      onVideoRemove={onVideoRemove}
      selected={index === activeVideo}
      style={style}
    />
  )
}

export default VideoRow