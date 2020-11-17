const cors = require("cors")
const WebSocket = require("ws")
const { isEqual } = require("lodash")
const queryString = require("query-string")
const RoomsManager = require("./src/RoomFactory")

const path = require("path")
const express = require("express")
const app = express()
const http = require("http").createServer(app)
// const io = require("socket.io")(http, { path: "/yousync/socket.io" })
const io = require("socket.io")(http, { pingInterval: 5000 })

// const app = express()
// const server = http.createServer(app)
// const wss = new WebSocket.Server({ server })
// const socket = io(server)

io.on("connection", socket => {
  if (!socket.handshake.query.id) {
    // return socket.close(4000, "No room id was provided")
    return socket.error("No room id was provided")
  }

  const room = RoomsManager.getRoom(socket.handshake.query.id)
  if (!room) {
    // return socket.disconnect(4001, "Room is provided is invalid")
    return socket.error("Room id provided is invalid")
  }

  const roomId = room.id.toString()
  socket.join(roomId)

  const username = socket.handshake.query.username
  room.addClient(socket.id, username)
  // socket.id







  socket.on("PLAY", () => {
    room.play()
    io.to(roomId).emit("STATE", room.state)
  })
  
  socket.on("PAUSE", () => {
    room.pause(username)
    io.to(roomId).emit("STATE", room.state)
  })

  socket.on("SEEK", time => {
    room.seek(time)
    io.to(roomId).emit("STATE", room.state)
  })

  socket.on("VIDEO", videoId => {
    room.addVideo(videoId, username)
  })

  socket.on("SELECT_VIDEO", videoIndex => {
    room.selectVideo(videoIndex)
    io.to(roomId).emit("STATE", room.state)
  })

  socket.on("REMOVE_VIDEO", videoIndex => {
    room.removeVideo(videoIndex)
    io.to(roomId).emit("STATE", room.state)
  })

  socket.on("PING", (ping, syncDiff) => {
    room.updateClient(socket.id, { ping, syncDiff })
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
app.use("/api", require("./src/routes"))

// if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")))

  app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"))
  })
// }



// app.use((req, res, next) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

http.listen(process.env.PORT || 4001, () => {
  console.log(`Example app listening on port ${http.address().port}`)
})