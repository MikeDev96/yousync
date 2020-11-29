import { ACTION_SET_SETTINGS, ACTION_SET_USERNAME, ACTION_SET_VOLUME, ACTION_TOGGLE_MUTE } from "./actions"

export const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_SET_VOLUME:
      return {
        ...state,
        persist: {
          ...state.persist,
          volume: action.payload,
          muted: false,
        }
      }
    case ACTION_TOGGLE_MUTE:
      return {
        ...state,
        persist: {
          ...state.persist,
          muted: !state.persist.muted,
        }
      }
    case ACTION_SET_USERNAME:
      return {
        ...state,
        persist: {
          ...state.persist,
          username: action.payload,
        }
      }
    case ACTION_SET_SETTINGS:
      return {
        ...state,
        persist: {
          ...state.persist,
          username: action.payload.username,
        }
      }
    default:
      return state
  }
}