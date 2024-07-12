import { Box, Button, TextField, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

function Chat({ existing, submit }) {
  const [chatName, setChatName] = useState(existing?.name || "");

  useEffect(() => {
    setChatName(existing?.name || "");
  }, [existing]);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    submit({
      name: chatName,
    });
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 1, p: 2 }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Typography variant="h6" sx={{ pb: 1 }}>
          {existing ? "Edit" : "Create"} Chat
        </Typography>
      </div>
      <TextField
        fullWidth
        label="Chat Name"
        variant="outlined"
        value={chatName}
        onChange={(e) => setChatName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button type="submit" variant="contained" color="primary">
          {existing ? "Edit" : "Create"} Chat
        </Button>
      </div>
    </Box>
  );
}

Chat.propTypes = {
  existing: PropTypes.object,
  submit: PropTypes.func.isRequired,
};

export default Chat;
