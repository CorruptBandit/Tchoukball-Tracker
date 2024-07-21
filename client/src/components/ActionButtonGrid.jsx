import React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

function ActionButtonGrid({ buttons }) {
  return (
    <Grid container spacing={2}>
      {buttons?.map((button) => (
        <Grid item key={button.name} xs={6} sm={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={button.onClick}
            fullWidth
          >
            {button.name}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
}

ActionButtonGrid.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    })
  ).isRequired,
};

export default ActionButtonGrid;
