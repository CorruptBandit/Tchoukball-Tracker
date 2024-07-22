import React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

function ActionButtonGrid({ buttons, onClick }) {
  return (
    <Grid container spacing={2}>
      {buttons?.map((name) => (
        <Grid item key={name} xs={6} sm={3}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => onClick(name)}
            fullWidth
          >
            {name}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
}

ActionButtonGrid.propTypes = {
  buttons: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ActionButtonGrid;
