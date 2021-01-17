const { EventEmitter } = require("events")

class StatusManager extends EventEmitter {
  constructor (defaultStatus = "", timeout) {
    super()
    this.setDefault(defaultStatus)
    this.timeout = timeout
  }

  set(status) {
    this._set(status, "update", true)
  }

  clear() {
    this._set(this.defaultStatus, "update", false)
  }

  setDefault(defaultStatus) {
    this.defaultStatus = defaultStatus
  }

  _set(status, event, timeout) {
    this.status = status
    this.emit(event, status)

    this._clearTimeout()

    if (timeout && this.timeout > 0) {
      this.handle = setTimeout(() => {
        this._set(this.defaultStatus, "timeout")
      }, this.timeout)
    }
  }

  _clearTimeout() {
    if (this.handle) {
      clearTimeout(this.handle)
      this.handle = null
    }
  }
}

module.exports = StatusManager