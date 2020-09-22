import { useCallback, useEffect, useState } from "react"

const useDefaultUsername = () => {
  const [username, setUsername] = useState(() => localStorage.getItem("username"))

  const getUsername = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.PUBLIC_URL}/api/username`, {
        headers: {
          "Accept": "application/json",
        }
      })

      const newUsername = await res.json()
      if (newUsername) {
        localStorage.setItem("username", newUsername)
        setUsername(newUsername)
      }
    }
    catch (err) {
      console.log(err)
    }
  }, [])

  const changeUsername = useCallback(newUsername => {
    if (newUsername) {
      localStorage.setItem("username", newUsername)
      setUsername(newUsername)
    }
  }, [])

  useEffect(() => {
    if (!username) {
      getUsername()
    }
  }, [username, getUsername])

  return [username, changeUsername]
}

export default useDefaultUsername