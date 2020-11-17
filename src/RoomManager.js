const { EventEmitter } = require("events")
const axios = require("axios")
const qs = require("query-string")
const fs = require("fs")

class RoomManager extends EventEmitter {
  constructor (id) {
    super()

    this.id = id
    this.clients = []
    this.state = {
      paused: true,
      pauser: "",
      tick: 0,
      elapsed: 0,
      video: "",
      duration: 0,
      queue: [],
      activeItem: -1,
      finished: false,
    }
  }

  addClient(id, username) {
    if (id) {
      // this.clients.push(client)
      this.clients.push({ id, username: username || "Unnamed User", ping: -1, syncDiff: 0 })
    }
  }

  updateClient(id, newClient) {
    if (id) {
      const clientIndex = this.clients.findIndex(c => c.id === id)
      if (clientIndex >= 0) {
        this.clients[clientIndex] = { ...this.clients[clientIndex], ...newClient }
        this.emit("client", this.clients[clientIndex])
      }
    }
  }

  removeClient(id) {
    if (id) {
      const clientIndex = this.clients.findIndex(c => c.id === id)
      if (clientIndex >= 0) {
        this.clients.splice(clientIndex, 1)
      }
    }
  }

  play() {
    if (this.state.paused) {
      if (this.state.finished) {
        this.selectVideo(0)
      }
      else {
        this.state.paused = false
        // this.state.pauser = ""
        this.updateTime()
      }
    }
  }

  pause(username) {
    if (!this.state.paused) {
      this.state.elapsed += Date.now() - this.state.tick
      this.state.paused = true
      this.state.pauser = username
      this.syncActiveItem()
      this.stopEndTimer()
    }
  }

  seek(time) {
    // this.state.elapsed = time * 1000
    // this.state.tick = Date.now()
    // this.startEndTimer()
    this.updateTime(time * 1000)
  }

  async addVideo(videoId, addedBy) {
    try {
      const videoInfo = await axios(`https://www.youtube.com/get_video_info?video_id=${videoId}`)
      if (videoInfo && videoInfo.data) {
        const decodedVideoData = decodeURI(videoInfo.data)
        const queryParams = qs.parse(decodedVideoData)
        if (queryParams && queryParams.player_response) {
          const playerResponse = JSON.parse(queryParams.player_response)
          if (playerResponse.playabilityStatus) {
            if (playerResponse.playabilityStatus.status === "OK") {
              const thumbails = playerResponse.videoDetails.thumbnail.thumbnails
              // Get the 2nd best quality thumbnail
              const thumbnail = thumbails[thumbails.length > 1 ? thumbails.length - 2 : 0]

              this.state = {
                ...this.state,
                queue: [
                  ...this.state.queue,
                  {
                    id: playerResponse.videoDetails.videoId,
                    title: playerResponse.videoDetails.title,
                    author: playerResponse.videoDetails.author,
                    thumbnail: thumbnail.url,
                    duration: parseInt(playerResponse.videoDetails.lengthSeconds),
                    addedBy,
                    elapsed: 0,
                  },
                ],
              }

              if (this.state.activeItem < 0 || this.state.finished) {
                this.nextItem()
              }

              this.emit("update")
              return
            }
            else {
              this.emit("error", playerResponse.playabilityStatus.reason)
              return
            }
          }
        }
      }

      this.emit("error", "Failed to get player response")
    }
    catch (err) {
      console.log(err)
      this.emit("error", err.message)
    }
  }

  selectVideo(videoIndex) {
    if (videoIndex in this.state.queue) {
      const prevItem = this.state.queue[this.state.activeItem]

      if (prevItem) {
        prevItem.elapsed = this.state.paused ?
          this.state.elapsed :
          this.state.elapsed + Date.now() - this.state.tick
      }

      const newItem = this.state.queue[videoIndex]

      this.state = {
        ...this.state,
        paused: false,
        // pauser: "",
        video: newItem.id,
        activeItem: videoIndex,
        duration: newItem.duration,
      }

      const isItemFinished = newItem.elapsed === newItem.duration * 1000
      this.updateTime(isItemFinished ? 0 : newItem.elapsed)
    }
  }

  removeVideo(videoIndex) {
    if (videoIndex in this.state.queue) {
      this.stopEndTimer()

      this.state.queue.splice(videoIndex, 1)

      if (!this.state.queue.length) {
        this.state = {
          ...this.state,
          elapsed: 0,
          video: "",
          duration: 0,
          activeItem: -1,
        }
      }
      else {
        this.selectVideo(videoIndex in this.state.queue ? videoIndex : videoIndex - 1)
      }
    }
  }

  startEndTimer() {
    this.stopEndTimer()
    this.state.finished = false
    this.endHandle = setInterval(() => {
      if (this.state.elapsed >= this.state.duration * 1000) {
        this.state.elapsed = this.state.duration * 1000
        this.syncActiveItem()

        if (!this.state.queue[this.state.activeItem + 1]) {
          this.state.finished = true
          this.state.paused = true
          this.state.pauser = ""
          this.emit("update")
        }
        else {
          this.nextItem()
          this.emit("update")
        }
      }
      else {
        this.state.elapsed += 1000
        this.state.tick = Date.now()
        this.emit("time")
      }
    }, 1000)
  }

  stopEndTimer() {
    if (this.endHandle) {
      clearInterval(this.endHandle)
      this.endHandle = undefined
    }
  }

  nextItem() {
    const nextItemIndex = this.state.activeItem + 1
    const nextItem = this.state.queue[nextItemIndex]

    // If it's finished, set it back to 0 so it plays again
    if (nextItem.elapsed === nextItem.duration * 1000) {
      nextItem.elapsed = 0
    }

    this.state = {
      ...this.state,
      // tick: Date.now(),
      // elapsed: 0,
      video: nextItem.id,
      activeItem: nextItemIndex,
      duration: nextItem.duration,
      paused: false,
      // pauser: "",
    }

    // this.startEndTimer()
    this.updateTime(nextItem.elapsed)
  }

  updateTime(elapsed) {
    this.state.tick = Date.now()

    if (typeof elapsed === "number") {
      this.state.elapsed = elapsed
      this.syncActiveItem()
    }

    if (!this.state.paused) {
      this.startEndTimer()
    }
  }

  syncActiveItem() {
    if (this.state.activeItem >= 0) {
      const item = this.state.queue[this.state.activeItem]
      if (item) {
        item.elapsed = this.state.elapsed
      }
    }
  }
}

module.exports = RoomManager