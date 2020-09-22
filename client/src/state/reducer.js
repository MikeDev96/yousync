import { ACTION_SET_USERNAME, ACTION_TOGGLE_MUTE } from "./actions"

export const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_SET_USERNAME:
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
    default:
      return state
  }
}