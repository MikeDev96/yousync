const { EventEmitter } = require("events")
const axios = require("axios")
const qs = require("query-string")
const fs = require("fs")
const YouTubeParse = require("../YouTubeParse")
const { v4: uuid } = require("uuid")

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
      speed: 1,
    }
  }

  addClient(id, username) {
    if (id) {
      this.clients.push({
        id,
        username: username || "Unnamed User",
        ping: -1,
        syncDiff: 0,
        visibility: "unknown",
        muted: -1,
        volume: -1
      })
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
      this.state.paused = true
      this.state.pauser = username
      this.clearDelayedPlay()
      this.syncAndStop()
    }
  }

  syncElapsed() {
    this.state.elapsed += Date.now() - this.state.tick
    this.syncActiveItem()
  }

  syncAndStop() {
    this.syncElapsed()
    this.stopEndTimer()
  }

  seek(time) {
    // this.state.elapsed = time * 1000
    // this.state.tick = Date.now()
    // this.startEndTimer()
    this.updateTime(time * 1000)
  }

  async addVideo(videoId, addedBy) {
    try {
      const res = await new YouTubeParse().parse(videoId)
      if (res) {
        this.state = {
          ...this.state,
          queue: [
            ...this.state.queue,
            ...res.map(item => ({
              ...item,
              id: uuid(),
              addedBy,
              elapsed: 0,
            })),
          ],
        }

        if (this.state.activeItem < 0 || this.state.finished) {
          this.nextItem()
        }

        this.emit("update")
      }
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
        // paused: false,
        // pauser: "",
        video: newItem.videoId,
        activeItem: videoIndex,
        duration: newItem.duration,
      }

      const isItemFinished = newItem.elapsed === newItem.duration * 1000
      this.updateTime(isItemFinished ? 0 : newItem.elapsed)
    }
  }

  removeVideo(videoIndex) {
    if (!this.state.queue[videoIndex]) {
      return
    }

    const decrementIndex = videoIndex <= this.state.activeItem
    if (decrementIndex) {
      if (!this.state.paused) {
        this.syncAndStop()
      }
    }

    this.state.queue.splice(videoIndex, 1)

    if (!this.state.queue.length) {
      this.clearDelayedPlay()
      this.state = {
        ...this.state,
        elapsed: 0,
        video: "",
        duration: 0,
        activeItem: -1,
      }
    }
    else {
      if (decrementIndex) {
        this.buffering()
        this.selectVideo(Math.max(0, this.state.activeItem - 1))
        this.delayedPlay()
      }
    }
  }

  startEndTimer() {
    this.stopEndTimer()
    this.state.finished = false
    this.endHandle = setInterval(() => {
      if (this.state.elapsed >= this.state.duration * 1000) {
        this.stopEndTimer()

        this.state.elapsed = this.state.duration * 1000
        this.syncActiveItem()

        if (!this.state.queue[this.state.activeItem + 1]) {
          this.state.finished = true
          this.state.paused = true
          this.state.pauser = ""
        }
        else {
          this.nextItem()
        }

        this.removeVideo(0)
        this.emit("update")
      }
      else {
        this.state.elapsed += 1000 * this.state.speed
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
      video: nextItem.videoId,
      activeItem: nextItemIndex,
      duration: nextItem.duration,
    }

    // this.startEndTimer()
    this.buffering()
    this.updateTime(nextItem.elapsed)

    this.delayedPlay()
    // setTimeout(() => {
    //   this.play()
    //   this.emit("update")
    // }, 1000)
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

  setSpeed(speed) {
    this.state.elapsed += Date.now() - this.state.tick
    this.syncActiveItem()
    this.stopEndTimer()
    this.state.speed = speed
    this.startEndTimer()
  }

  delayedPlay() {
    this.clearDelayedPlay()
    this.playHandle = setTimeout(() => {
      this.playHandle = undefined
      this.play()
      this.emit("update")
    }, 1000)
  }

  buffering() {
    if (!this.state.paused) {
      this.state.paused = true
      this.state.pauser = "YouSync"
    }
  }

  clearDelayedPlay() {
    if (this.playHandle) {
      clearTimeout(this.playHandle)
      this.playHandle = undefined
    }
  }
}

module.exports = RoomManager