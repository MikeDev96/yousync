export const ACTION_SET_VOLUME = "SET_VOLUME"
export const ACTION_TOGGLE_MUTE = "TOGGLE_MUTE"
export const ACTION_SET_USERNAME = "SET_USERNAME"
export const ACTION_SET_SETTINGS = "SET_SETTINGS"
export const ACTION_SET_ROOM_NAME = "SET_ROOM_NAME"

export const setVolume = volume => {
  return {
    type: ACTION_SET_VOLUME,
    payload: volume,
  }
}

export const toggleMute = () => {
  return {
    type: ACTION_TOGGLE_MUTE,
  }
}

export const setUsername = username => {
  return {
    type: ACTION_SET_USERNAME,
    payload: username,
  }
}

export const setSettings = username => {
  return {
    type: ACTION_SET_SETTINGS,
    payload: { username },
  }
}

export const setRoomName = roomName => {
  return {
    type: ACTION_SET_ROOM_NAME,
    payload: { roomName },
  }
}