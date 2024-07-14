import { Box, Button, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";

function Text({ existing, submit }) {
  const [textName, setTextName] = useState(existing?.name || "");
  const [text, setText] = useState(existing?.text || "");
  const [fontSize, setFontSize] = useState(existing?.fontSize || 12);
  const [fontFamily, setFontFamily] = useState(existing?.fontFamily || "Arial");
  const [alignment, setAlignment] = useState(existing?.alignment || "center");

  useEffect(() => {
    setTextName(existing?.name || "");
    setText(existing?.text || "");
    setFontFamily(existing?.fontFamily || "Arial");
    setFontSize(existing?.fontSize || 12);
    setAlignment(existing?.alignment || "center");
  }, [existing]);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    submit({
      name: textName,
      text: text,
      fontSize: fontSize,
      fontFamily: fontFamily,
      alignment: alignment,
    });
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 1, p: 2 }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Typography variant="h6" sx={{ pb: 1 }}>
          {existing ? "Edit" : "Create"} Text
        </Typography>
      </div>
      <TextField
        fullWidth
        label="Text Name"
        variant="outlined"
        value={textName}
        onChange={(e) => setTextName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Content"
        variant="outlined"
        value={text}
        onChange={(e) => setText(e.target.value)}
        multiline
        rows={4}
        sx={{ mb: 2 }}
      />
      <ToggleButtonGroup
        value={alignment}
        exclusive
        onChange={(event, newAlignment) => {
          if (newAlignment !== null) {
            setAlignment(newAlignment);
          }
        }}
        aria-label="text alignment"
        fullWidth
        sx={{ mb: 2 }}
      >
        <ToggleButton value="left" aria-label="left aligned">
          Left
        </ToggleButton>
        <ToggleButton value="center" aria-label="centered">
          Center
        </ToggleButton>
        <ToggleButton value="right" aria-label="right aligned">
          Right
        </ToggleButton>
      </ToggleButtonGroup>
      <TextField
        fullWidth
        label="Font Size"
        variant="outlined"
        type="number"
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
        sx={{ mb: 2 }}
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button type="submit" variant="contained" color="primary">
          {existing ? "Edit" : "Create"} Text
        </Button>
      </div>
    </Box>
  );
}

Text.propTypes = {
  existing: PropTypes.object,
  submit: PropTypes.func.isRequired,
};

export default Text;
