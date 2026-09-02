const express = require("express")
const { uniqueNamesGenerator, adjectives, colors, animals } = require("unique-names-generator")
const RoomFactory = require("./RoomFactory")

const router = express.Router()

router.post("/room", (req, res) => {
  res.send(RoomFactory.createRoom(req.query.username, req.query.video, req.body))
})

// What the container healthcheck polls, and the quickest way to ask a running
// instance which build it is. The commit fields are stamped in by CI and are
// empty in a hand-built image.
router.get("/health", (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    commit: process.env.APP_COMMIT || null,
    commitMessage: process.env.APP_COMMIT_MESSAGE || null,
  })
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