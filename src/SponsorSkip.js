const { EventEmitter } = require("events")
const { SponsorBlock } = require("sponsorblock-api")

const sponsorBlock = new SponsorBlock()

class SponsorSkip extends EventEmitter {
  constructor({ getElapsed }) {
    super()

    this.getElapsed = getElapsed

    this.sponsors = []
    this.sponsorHandle = []
  }

  start() {
    this.stop()
    const elapsed = this.getElapsed()
    this.sponsors.forEach(sponsor => {
      if (elapsed <= sponsor.startTime * 1000) {
        this.sponsorHandle.push(setTimeout(() => {
          this.emit("sponsor", sponsor)
        }, sponsor.startTime * 1000 - elapsed))
      }
    })
  }

  stop() {
    this.sponsorHandle.forEach(timer => clearTimeout(timer))
    this.sponsorHandle = []
  }

  setVideo(videoId, controls) {
    sponsorBlock.getSegments(
      videoId,
      controls.sponsor && "sponsor",
      controls.intro && "intro",
      controls.outro && "outro",
      controls.interaction && "interaction",
      controls.selfpromo && "selfpromo",
      controls.music_offtopic && "music_offtopic"
    )
      .then(segments => {
        const ranges = this.flattenSegments(segments)
        this.sponsors = ranges
      })
      .catch(err => {
        // 404: ResponseError: [SponsorBlock] Not Found
        if (err.status !== 404) {
          console.log(err)
        }
      })
  }

  flattenSegments(segments) {
    return segments.reduce((ranges, segment) => {
      const r = ranges.find(r => r.startTime <= segment.endTime && segment.startTime <= r.endTime)
      if (r) {
        r.startTime = Math.min(r.startTime, segment.startTime)
        r.endTime = Math.max(r.endTime, segment.endTime)
        if (!r.categories.includes(segment.category)) {
          r.categories.push(segment.category)
        }
      }
      else {
        ranges.push({ startTime: segment.startTime, endTime: segment.endTime, categories: [segment.category] })
      }
      return ranges
    }, [])
  }
}

module.exports = SponsorSkip