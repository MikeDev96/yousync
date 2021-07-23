const cors = require("cors")
const RoomsManager = require("./src/RoomFactory")

const path = require("path")
const express = require("express")
const app = express()
const bodyParser = require('body-parser');
const http = require("http").createServer(app)
const io = require("socket.io")(http, { pingInterval: 5000 })
require("dotenv").config()

io.on("connection", socket => {
  if (!socket.handshake.query.id) {
    return socket.error("No room id was provided")
  }

  const room = RoomsManager.getRoom(socket.handshake.query.id)
  if (!room) {
    return socket.error("Room id provided is invalid")
  }

  const roomId = room.id.toString()
  socket.join(roomId)

  const username = socket.handshake.query.username
  room.addClient(socket.id, username)

  socket.on("PLAY", () => {
    room.play(username)
    io.to(roomId).emit("STATE", room.state)
  })

  socket.on("PAUSE", () => {
    room.pause(username)
    io.to(roomId).emit("STATE", room.state)
  })

  socket.on("SEEK", (time, diff) => {
    room.seek(time, diff, username)
    io.to(roomId).emit("STATE", room.state)
  })

  socket.on("VIDEO", link => {
    room.addVideo(link, username)
  })

  socket.on("SELECT_VIDEO", videoIndex => {
    room.userSelectVideo(videoIndex, username)
    io.to(roomId).emit("STATE", room.state)
  })

  socket.on("REMOVE_VIDEO", videoIndex => {
    room.removeVideo(videoIndex, username)
    io.to(roomId).emit("STATE", room.state)
  })

  socket.on("SET_SPEED", speed => {
    room.setSpeed(speed, username)
    io.to(roomId).emit("STATE", room.state)
  })

  socket.on("PING", (ping, syncDiff) => {
    room.updateClient(socket.id, { ping, syncDiff })
  })

  socket.on("CLIENT_UPDATE", (visibility, muted, volume) => {
    room.updateClient(socket.id, { visibility, muted, volume })
  })

  io.to(roomId).emit("INITIAL_STATE", {
    player: room.state,
    clients: room.clients,
  })

  socket.on("disconnect", () => {
    room.removeClient(socket.id)

    io.to(roomId).emit("CLIENTS_STATE", room.clients)
  })
})

RoomsManager.on("create", room => {
  room.on("update", () => {
    io.to(room.id).emit("STATE", room.state)
  })

  room.on("time", () => {
    io.to(room.id).emit("ELAPSED", room.state.elapsed)
  })

  room.on("error", err => {
    io.to(room.id).emit("ERROR", err)
  })

  room.on("client", client => {
    io.to(room.id).emit("CLIENT", client)
  })
})

app.use(cors())
app.use(bodyParser.json())
app.use("/api", require("./src/routes"))

app.use(express.static(path.join(__dirname, "client/build")))

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "client/build", "index.html"))
})

http.listen(process.env.PORT || 4001, () => {
  console.log(`Example app listening on port ${http.address().port}`)
})