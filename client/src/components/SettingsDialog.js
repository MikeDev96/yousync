import React, { forwardRef } from "react"
import { Dialog, DialogTitle, TextField, DialogContent, DialogActions, Button, Grow } from "@material-ui/core"
import useGlobalState from "../state/useGlobalState"
import { setSettings } from "../state/actions"
import { useForm } from "react-hook-form"

const Transition = forwardRef((props, ref) => <Grow ref={ref} {...props} />)

const SettingsDialog = ({
  open, onClose,
}) => {
  const { state, dispatch } = useGlobalState()

  const { handleSubmit, register, errors, reset } = useForm({
    defaultValues: {
      username: state.persist.username,
    },
  })

  return (
    <Dialog onClose={onClose} open={open} TransitionComponent={Transition} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <form id="settings-form" onSubmit={handleSubmit(values => {
          const username = values.username

          dispatch(setSettings(username))
          reset(values)
          onClose()
        })}>
          <TextField
            name="username"
            autoFocus
            margin="normal"
            label="Username"
            fullWidth
            inputRef={register({
              required: "Username is required",
            })}
            error={!!errors.username}
            helperText={(errors.username && errors.username.message) || "I'm sure you can figure out what this is :)"}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button form="settings-form" type="submit" color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsDialog