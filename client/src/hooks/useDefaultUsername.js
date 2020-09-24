import { useCallback, useEffect } from "react"
import { setUsername } from "../state/actions"
import useGlobalState from "../state/useGlobalState"

const useDefaultUsername = () => {
  const { state, dispatch } = useGlobalState()

  const getUsername = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.PUBLIC_URL}/api/username`, {
        headers: {
          "Accept": "application/json",
        }
      })

      const newUsername = await res.json()
      if (newUsername) {
        dispatch(setUsername(newUsername))
      }
    }
    catch (err) {
      console.log(err)
    }
  }, [])

  useEffect(() => {
    if (!state.persist.username) {
      getUsername()
    }
  }, [state.persist.username, getUsername])

  return state.persist.username
}

export default useDefaultUsername