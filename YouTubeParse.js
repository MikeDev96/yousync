const ytpl = require("ytpl")
const dt = require("duration-timestamp")
const qs = require("query-string")
const { youtube } = require("@googleapis/youtube")
const moment = require("moment")

module.exports = class {
  async parse(link) {
    const youtubePattern = /(?:https?:\/\/(?:www.)?)?(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([\w-]+)/g
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
      const yt = youtube({
        version: "v3",
        auth: process.env.GOOGLE_YOUTUBE_DATA_API_V3_API_KEY,
      })

      const res = await yt.videos.list({
        id,
        part: ["snippet", "contentDetails"],
      })

      if (res.status === 200) {
        const item = res.data.items[0]
        if (item) {
          const snippet = item.snippet
          const contentDetails = item.contentDetails

          return {
            videoId: id,
            title: snippet.title,
            author: snippet.channelTitle,
            thumbnail: snippet.thumbnails.medium.url,
            duration: moment.duration(contentDetails.duration).asSeconds(),
          }
        }
        else {
          throw new Error(`Couldn't find a video for id ${id}`)
        }
      }
      else {
        throw new Error(res.statusText)
      }
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