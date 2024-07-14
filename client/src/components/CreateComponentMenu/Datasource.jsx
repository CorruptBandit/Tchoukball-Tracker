import { Box, Button, TextField, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

function Datasource({ existing, submit }) {
  const [name, setName] = useState(existing?.name || "");
  const [requestType, setRequestType] = useState(existing?.requestType || "");
  const [url, setUrl] = useState(existing?.url || "");
  const [poll, setPoll] = useState(existing?.poll || "");
  const [payload, setPayload] = useState(existing?.payload || {});

  useEffect(() => {
    setName(existing?.name || "");
    setRequestType(existing?.requestType || "");
    setUrl(existing?.url || "");
    setPoll(existing?.poll || "");
    setPayload(existing?.payload || {});
  }, [existing]);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    submit({
      name,
      requestType,
      url,
      poll,
      payload,
    });
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 1, p: 2 }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Typography variant="h6" sx={{ pb: 1 }}>
          {existing ? "Edit" : "Create"} Data Source
        </Typography>
      </div>
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
        label="Request Type"
        variant="outlined"
        value={requestType}
        onChange={(e) => setRequestType(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Url"
        variant="outlined"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Poll Rate"
        variant="outlined"
        value={poll}
        onChange={(e) => setPoll(parseInt(e.target.value))}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Request Payload"
        variant="outlined"
        value={JSON.stringify(payload)}
        onChange={(e) => setPayload(JSON.parse(e.target.value))}
        multiline
        rows={4}
        sx={{ mb: 2 }}
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button type="submit" variant="contained" color="primary">
          {existing ? "Edit" : "Create"} Data Source
        </Button>
      </div>
    </Box>
  );
}

Datasource.propTypes = {
  existing: PropTypes.object,
  submit: PropTypes.func.isRequired,
};

export default Datasource;
