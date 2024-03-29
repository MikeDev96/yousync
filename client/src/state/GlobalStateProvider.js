import React, { createContext, useReducer } from "react"
import { reducer } from "./reducer"
import usePersistentState from "./usePersistentState"

export const GlobalContext = createContext()

const initialState = {
  persist: {
    username: "",
    volume: 100,
    muted: false,
    ...JSON.parse(localStorage.getItem("persist")),
  },
  roomName: "",
}

const GlobalStateProvider = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  usePersistentState("persist", state.persist)

  return (
    <GlobalContext.Provider value={{ state, dispatch }} >
      {children}
    </GlobalContext.Provider>
  )
}

export default GlobalStateProvider