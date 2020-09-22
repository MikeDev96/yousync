import React, { useState, useCallback, forwardRef } from "react"
import { Dialog, DialogTitle, TextField, DialogContent, DialogContentText, DialogActions, Button, Grow } from "@material-ui/core"
import useDefaultUsername from "../hooks/useDefaultUsername"

const Transition = forwardRef((props, ref) => <Grow ref={ref} {...props} />)

const SettingsDialog = ({
  open, onClose,
}) => {
  // const [open, setOpen] = useState(false)

  const [username, changeUsername] = useDefaultUsername()
  const [newUsername, setNewUsername] = useState(username)

  const handleSave = useCallback(() => {
    changeUsername(newUsername)
    onClose()
  }, [changeUsername, newUsername, onClose])

  return (
    <Dialog onClose={onClose} open={open} TransitionComponent={Transition}>
      <DialogTitle>Settings</DialogTitle>
      {/* <form className={classes.form}>
        <TextField label="Username" />
      </form> */}
      <DialogContent>
        <DialogContentText>
          Provide a username so other users know who you are.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Username"
          fullWidth
          value={newUsername}
          onChange={useCallback(e => setNewUsername(e.target.value), [])}
          onKeyPress={e => {
            if (e.key === "Enter") {
              handleSave()
            }
          }}
        />
        {/* <FormControl fullWidth>
  <InputLabel htmlFor="my-input">Email address</InputLabel>
  <Avatar />
        </FormControl> */}
        {/* <Button variant="contained" color="primary">Upload</Button> */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
          </Button>
        <Button onClick={handleSave} color="primary">
          Save
          </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsDialog