import React, { createContext, useCallback, useState } from "react"

export const DrawerContext = createContext()

const DrawerProvider = ({
  children,
}) => {
  const [open, setOpen] = useState(false)
  const [enabled, setEnabled] = useState(false)

  return (
    <DrawerContext.Provider
      value={{
        open,
        toggle: useCallback(() => setOpen(o => !o), []),
        enabled,
        enable: useCallback(() => setEnabled(true), []),
        disable: useCallback(() => setEnabled(false), [])
      }}
    >
      {children}
    </DrawerContext.Provider>
  )
}

export default DrawerProvider