import React, { forwardRef } from "react"
import { Dialog, DialogTitle, TextField, DialogContent, DialogActions, Button, Grow, InputAdornment } from "@material-ui/core"
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
      syncThreshold: state.persist.syncThreshold,
    },
  })

  return (
    <Dialog onClose={onClose} open={open} TransitionComponent={Transition} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <form id="settings-form" onSubmit={handleSubmit(values => {
          const username = values.username
          const syncThreshold = parseFloat(values.syncThreshold)

          dispatch(setSettings(username, syncThreshold))
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
          <TextField
            margin="normal"
            label="Sync Threshold"
            fullWidth
            name="syncThreshold"
            type="number"
            inputRef={register({
              required: "Sync threshold is required",
              min: { value: 0.1, message: "The minimum the sync threshold can be is 0.1s. I hope you've got some God internet." },
              max: { value: 5, message: "This maximum the sync threshold can be is 5. Are you using 2G?" },
            })}
            error={!!errors.syncThreshold}
            helperText={(errors.syncThreshold && errors.syncThreshold.message) || "This is the maximum amount of time you can be out of sync with the server before you're forcibly re-sync'd"}
            endAdornment={<InputAdornment position="end">s</InputAdornment>}
            inputProps={{
              step: 0.1,
            }}
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