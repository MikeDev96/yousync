export const ACTION_SET_USERNAME = "SET_USERNAME"
export const ACTION_TOGGLE_MUTE = "TOGGLE_MUTE"

export const setVolume = volume => {
  return {
    type: ACTION_SET_USERNAME,
    payload: volume,
  }
}

export const toggleMute = () => {
  return {
    type: ACTION_TOGGLE_MUTE,
  }
}