const randomWords = require("random-words")
const { EventEmitter } = require("events")
const RoomManager = require("./RoomManager")

class RoomFactory extends EventEmitter {
  constructor() {
    super()

    this.rooms = {}
  }

  createRoom(username, video) {
    const id = randomWords({ exactly: 3, join: "-", maxLength: 5 })
    const room = new RoomManager(id)

    if (username && video) {
      room.addVideo(`https://www.youtube.com/watch?v=${video}`, username).then(() => {
        room.selectVideo(0)
        room.pause()
      })
    }

    this.emit("create", room)

    return (this.rooms[room.id] = room)
  }

  getRoom(id) {
    return this.rooms[id]
  }
}

module.exports = new RoomFactory()