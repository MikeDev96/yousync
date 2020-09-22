import { useContext } from "react"
import { GlobalContext } from "./GlobalStateProvider"

const useGlobalState = () => {
  return useContext(GlobalContext)
}

export default useGlobalState