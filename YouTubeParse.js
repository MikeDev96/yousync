const ytpl = require("ytpl")
const axios = require("axios")
const dt = require("duration-timestamp")
const qs = require("query-string")

module.exports = class {
  async parse(link) {
    const youtubePattern = /(?:https?:\/\/www.)?youtu(?:be.com\/watch\?v=|.be\/)([\w-]+)/g
    const youtubeMatch = youtubePattern.exec(link)
    if (youtubeMatch) {
      try {
        const video = await this.getVideo(youtubeMatch[1])
        if (video) {
          return [video]
        }

        return []
      }
      catch (err) {
        throw err
      }
    }
    else {
      const youtubePlaylistPattern = /(?:https?:\/\/www.)?youtube.com\/playlist\?list=([\w-]+)/g
      const youtubePlaylistMatch = youtubePlaylistPattern.exec(link)
      if (youtubePlaylistMatch) {
        try {
          const videos = this.getPlaylist(youtubePlaylistMatch[1])
          return videos
        }
        catch (err) {
          console.log(err)
          throw err
        }
      }
    }
  }

  async getVideo(id) {
    try {
      const videoInfo = await axios(`https://www.youtube.com/get_video_info?video_id=${id}&eurl=${encodeURIComponent(`https://youtube.googleapis.com/v/${id}`)}&html5=1&c=TVHTML5&cver=6.20180913`)
      if (videoInfo && videoInfo.data) {
        const queryParams = qs.parse(videoInfo.data)
        if (queryParams && queryParams.player_response) {
          const playerResponse = JSON.parse(queryParams.player_response)
          if (playerResponse.playabilityStatus) {
            if (playerResponse.playabilityStatus.status === "OK") {
              const thumbails = playerResponse.videoDetails.thumbnail.thumbnails
              // Get the 2nd best quality thumbnail
              const thumbnail = thumbails[thumbails.length > 1 ? thumbails.length - 2 : 0]

              return {
                videoId: playerResponse.videoDetails.videoId,
                title: playerResponse.videoDetails.title,
                author: playerResponse.videoDetails.author,
                thumbnail: thumbnail.url,
                duration: parseInt(playerResponse.videoDetails.lengthSeconds),
              }
            }
            else {
              throw new Error(playerResponse.playabilityStatus.reason)
            }
          }
        }
      }

      throw new Error("Failed to get player response")
    }
    catch (err) {
      console.log(err)
      throw err
    }
  }

  async getPlaylist(id) {
    try {
      const res = await ytpl(id, { limit: Infinity })
      if (res && res.items) {
        return res.items.map(item => ({
          videoId: item.id,
          author: item.author.name,
          title: item.title,
          thumbnail: item.thumbnails[item.thumbnails.length - 1].url,
          duration: dt.parse(item.duration).total,
        }))
      }

      // Only gets the first 200 videos :/
      // const res = await axios(`https://www.youtube.com/list_ajax?style=json&action_get_list=1&list=${id}`)

      // if (res && res.data && res.data.video) {
      //   return res.data.video.map(item => ({
      //     videoId: item.encrypted_id,
      //     author: item.author,
      //     title: item.title,
      //     thumbnail: item.thumbnail,
      //     duration: dt.parse(item.duration).total,
      //   }))
      // }

      return []
    }
    catch (err) {
      console.log(err)
      throw err
    }
  }
}