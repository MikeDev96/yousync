import React, { useState, useCallback } from "react"
import { FormControl, IconButton, InputAdornment, Input, InputLabel } from "@material-ui/core"
import QueueIcon from '@material-ui/icons/Queue';

const AddVideoForm = ({
  onAdd,
}) => {
  const [value, setValue] = useState("")

  const handleSubmit = e => {
    e.preventDefault()

    if (value) {
      onAdd(value)
      setValue("")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormControl size="small" margin="normal" fullWidth>
        <InputLabel shrink>Add Video</InputLabel>
        <Input
          value={value}
          onChange={useCallback(e => setValue(e.target.value), [])}
          placeholder="Paste a YouTube URL..."
          type="text"
          endAdornment={
            <InputAdornment position="end">
              <IconButton type="submit">
                <QueueIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    </form>
  )
}

export default AddVideoForm