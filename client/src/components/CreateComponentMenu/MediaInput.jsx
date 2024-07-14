import { Box, Button, TextField, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

function MediaInput({ existing, type, submit }) {
  const [name, setName] = useState(existing?.name || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [src, setSrc] = useState(existing?.src || "");

  useEffect(() => {
    setName(existing?.name || "");
    setDescription(existing?.description || "");
    setSrc(existing?.src || "");
  }, [existing]);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    submit({
      name,
      description,
      src,
    });
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 1, p: 2 }}>
      <Typography variant="h6" textAlign="center">
        {existing ? "Edit" : "Create"} {type}
      </Typography>
      <TextField
        fullWidth
        label="Name"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Description"
        variant="outlined"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        rows={3}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Source URL"
        variant="outlined"
        value={src}
        onChange={(e) => setSrc(e.target.value)}
        sx={{ mb: 2 }}
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button type="submit" variant="contained" color="primary">
          {existing ? "Edit" : "Create"} {type}
        </Button>
      </div>
    </Box>
  );
}

MediaInput.propTypes = {
  existing: PropTypes.object,
  type: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
};

export default MediaInput;
