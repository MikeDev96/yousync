const ytdl = require("ytdl-core")
const { EventEmitter } = require("events")
const { json } = require("express")

class RoomManager extends EventEmitter {
  constructor(id) {
    super()

    this.id = id
    this.clients = []
    this.state = {
      paused: true,
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
      this.clients.push({ id, username: username || "Unnamed User" })
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
        this.updateTime()
      }
    }
  }

  pause() {
    if (!this.state.paused) {
      this.state.elapsed += Date.now() - this.state.tick
      this.state.paused = true
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
      const res = await ytdl.getBasicInfo(videoId)
      this.state = {
        // paused: false,
        // tick: Date.now(),
        // elapsed: 0,
        // video: "",
        // duration: 0,
        // queue: [],
        // activeItem: -1,

        // video: res.videoDetails.videoId,
        ...this.state,
        queue: [
          ...this.state.queue,
          {
            id: res.videoDetails.videoId,
            title: res.videoDetails.title,
            author: res.videoDetails.author.name,
            thumbnail: res.videoDetails.thumbnail.thumbnails[0].url,
            duration: parseInt(res.videoDetails.lengthSeconds),
            addedBy,
            elapsed: 0,
          },
        ],
        // activeItem: this.state.queue.length,
        // duration: parseInt(res.videoDetails.lengthSeconds),
      }

      if (this.state.activeItem < 0 || this.state.finished) {
        this.nextItem()
      }

      this.emit("update")
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
        video: newItem.id,
        activeItem: videoIndex,
        duration: newItem.duration,
      }

      const isItemFinished = newItem.elapsed === newItem.duration * 1000
      this.updateTime(isItemFinished ? 0 : newItem.elapsed)
    }
  }

  startEndTimer() {
    this.stopEndTimer()
    this.state.finished = false
    this.endHandle = setTimeout(() => {
      this.endHandle = undefined
      this.state.elapsed = this.state.duration * 1000
      this.syncActiveItem()

      if (!this.state.queue[this.state.activeItem + 1]) {
        this.state.finished = true
        this.state.paused = true
        this.emit("update")
      }
      else {
        this.nextItem()
        this.emit("update")
      }
    }, this.state.duration * 1000 - this.state.elapsed)
  }

  stopEndTimer() {
    if (this.endHandle) {
      clearTimeout(this.endHandle)
      this.endHandle = undefined
    }
  }

  nextItem() {
    const nextItemIndex = this.state.activeItem + 1
    const nextItem = this.state.queue[nextItemIndex]

    this.state = {
      ...this.state,
      // tick: Date.now(),
      // elapsed: 0,
      video: nextItem.id,
      activeItem: nextItemIndex,
      duration: nextItem.duration,
      paused: false,
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

    this.startEndTimer()
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