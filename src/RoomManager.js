const { EventEmitter } = require("events")
const axios = require("axios")
const qs = require("query-string")
const fs = require("fs")
const YouTubeParse = require("../YouTubeParse")
const { v4: uuid } = require("uuid")
const pms = require("pretty-ms")
const StatusManager = require("./StatusManager")
const SponsorSkip = require("./SponsorSkip")
const { prettyJoin } = require("./helpers")

const DEFAULT_STATUS = "YouSync 😎 Welcome"

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
      speed: 1,
      statusText: DEFAULT_STATUS,
    }

    this.statusManager = new StatusManager(DEFAULT_STATUS, 3000)
    this.statusManager.on("update", status => {
      this.state.statusText = status
    })
    this.statusManager.on("timeout", status => {
      this.state.statusText = status
      this.emit("update")
    })

    this.sponsorSkip = new SponsorSkip({
      getElapsed: () => this.state.elapsed,
    })
      .on("sponsor", sponsor => {
        this.seek(sponsor.endTime, null, `Skipped ${prettyJoin(sponsor.categories)}`)
        this.emit("update")
      })
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

  play(username) {
    if (this.state.paused) {
      this.state.paused = false
      this.statusManager.setDefault("")
      this.statusManager.set(`${username} ▶️`)
      this.updateTime()
    }
  }

  pause(username) {
    if (!this.state.paused) {
      this.state.paused = true
      this.statusManager.setDefault(`${username} ⏸`)
      this.statusManager.set(`${username} ⏸`)
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

  seek(time, diff, username) {
    const seekText = diff ?
      `${diff < 0 ? "⏪" : "⏩"} ${Math.abs(diff)}s` :
      `${time * 1000 < this.state.elapsed ? "⏪" : "⏩"} ${pms(Math.round(time) * 1000, { colonNotation: true })}`

    this.statusManager.set(`${username} ${seekText}`)
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

        if (this.state.activeItem < 0) {
          this.selectVideo(0)
          this.statusManager.setDefault(`YouSync ⏸`)
        }

        this.statusManager.set(`${addedBy} 🎞️ Added Video`)
        this.emit("update")
      }
    }
    catch (err) {
      console.log(err)
      this.emit("error", err.message)
    }
  }

  userSelectVideo(videoIndex, username) {
    if (videoIndex === this.state.activeItem) {
      return
    }

    this.syncElapsed()
    this.selectVideo(videoIndex, true)
    this.statusManager.set(`${username} 👆 Changed Video`)
  }

  selectVideo(videoIndex, delay = false) {
    if (!this.state.queue[videoIndex]) {
      return
    }

    const newItem = this.state.queue[videoIndex]

    this.state = {
      ...this.state,
      video: newItem.videoId,
      activeItem: videoIndex,
      duration: newItem.duration,
    }

    // This still needs testing, but client is sending a seek which is cancelling it out :/
    this.updateTime(newItem.elapsed, delay)

    this.sponsorSkip.setVideo(newItem.videoId)
  }

  removeVideo(videoIndex, username) {
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
      this.resetPlayer()
    }
    else {
      if (decrementIndex) {
        this.selectVideo(Math.max(0, this.state.activeItem - 1), false)
      }
    }

    this.statusManager.set(`${username} ❌ Removed Video`)
  }

  startEndTimer(delay) {
    this.stopEndTimer()
    this.sponsorSkip.start()
    let delayed = false
    this.endHandle = setInterval(() => {
      if (delay && !delayed) {
        delayed = true
        return
      }

      if (this.state.elapsed >= this.state.duration * 1000) {
        this.stopEndTimer()

        this.state.elapsed = this.state.duration * 1000
        this.syncActiveItem()

        this.state.queue.splice(this.state.activeItem, 1)

        if (!this.state.queue.length) {
          this.resetPlayer()
          this.statusManager.clear()
        }
        else {
          const newActiveItem = this.state.queue[this.state.activeItem] ? this.state.activeItem : this.state.activeItem - 1
          const nextItem = this.state.queue[newActiveItem]

          this.state = {
            ...this.state,
            video: nextItem.videoId,
            activeItem: newActiveItem,
            duration: nextItem.duration,
          }

          // Add 1000ms to give clients a chance to buffer
          this.updateTime(nextItem.elapsed, true)
        }

        this.emit("update")
      }
      else {
        this.state.elapsed += 1000 * this.state.speed
        this.state.tick = Date.now()
        this.emit("time")
      }
    }, 1000)
  }

  resetPlayer() {
    this.state = {
      ...this.state,
      paused: true,
      elapsed: 0,
      video: "",
      duration: 0,
      activeItem: -1,
    }

    this.statusManager.setDefault(DEFAULT_STATUS)
  }

  stopEndTimer() {
    if (this.endHandle) {
      clearInterval(this.endHandle)
      this.endHandle = undefined
    }
    this.sponsorSkip.stop()
  }

  updateTime(elapsed, delay) {
    this.state.tick = Date.now()

    if (typeof elapsed === "number") {
      this.state.elapsed = elapsed
      this.syncActiveItem()
    }

    if (!this.state.paused) {
      this.startEndTimer(delay)
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

  setSpeed(speed, username) {
    this.statusManager.set(`${username} ${speed > this.state.speed ? "💨" : "🐌"} ${speed}x Speed`)
    this.state.elapsed += Date.now() - this.state.tick
    this.syncActiveItem()
    this.stopEndTimer()
    this.state.speed = speed
    this.startEndTimer()
  }
}

module.exports = RoomManager