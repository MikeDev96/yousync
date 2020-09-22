const express = require("express")
const { uniqueNamesGenerator, adjectives, colors, animals } = require("unique-names-generator")
const RoomFactory = require("./RoomFactory")

const router = express.Router()

router.post("/room", (req, res) => {
  res.send(RoomFactory.createRoom(req.query.username, req.query.video))
})

router.get("/username", (req, res) => {
  const capitalizedName = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    style: "capital",
    separator: " "
  })

  res.json(capitalizedName)
})

module.exports = router