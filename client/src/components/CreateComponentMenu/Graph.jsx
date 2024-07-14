import { Autocomplete, Box, Button, FormControl, TextField, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { fetchComponents, selectAllDatasources } from "../../store/slices/componentsSlice";
import { useDispatch, useSelector } from "react-redux";

function Graph({ existing, submit }) {
  const dispatch = useDispatch();
  const dataSources = useSelector((state) => selectAllDatasources(state));
  const dataSourceStatus = useSelector(
    (state) => state.components.datasources.status
  );
  const [graphName, setGraphName] = useState(existing?.name || "");
  const [selectedSource, setSelectedSource] = useState(
    dataSources.find((ds) => ds.id === existing?.datasource) || null
  );

  useEffect(() => {
    if (dataSourceStatus === "idle") {
      dispatch(fetchComponents("datasources"));
    }
  }, [dataSourceStatus, dispatch]);

  useEffect(() => {
    setGraphName(existing?.name || "");
    setSelectedSource(
      dataSources.find((ds) => ds.id === existing?.datasource) || null
    );
  }, [dataSources, existing]);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    submit({
      name: graphName,
      datasource: selectedSource.id,
    });
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 1, p: 2 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ pb: 2 }}>
          {existing ? "Edit" : "Create"} Graph
        </Typography>
        <TextField
          fullWidth
          label="Graph Name"
          variant="outlined"
          value={graphName}
          onChange={(e) => setGraphName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 3 }}>
          <Autocomplete
            options={dataSources}
            getOptionLabel={(option) => option.name}
            value={selectedSource}
            onChange={(event, newValue) => setSelectedSource(newValue)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                label={`${existing ? "Edit" : "Select"} Datasource`}
                fullWidth
              />
            )}
          />
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ width: "100%" }}
        >
          {existing ? "Edit" : "Create"} Graph
        </Button>
      </div>
    </Box>
  );
}

Graph.propTypes = {
  existing: PropTypes.object,
  submit: PropTypes.func.isRequired,
};

export default Graph;
