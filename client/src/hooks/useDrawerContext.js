import { useContext, useEffect } from "react"
import { DrawerContext } from "../components/DrawerProvider"

const useDrawerContext = () => {
  const ctx = useContext(DrawerContext)
  const { enable, disable } = ctx

  useEffect(() => {
    enable()
    return disable
  }, [enable, disable])

  return ctx
}

export default useDrawerContext