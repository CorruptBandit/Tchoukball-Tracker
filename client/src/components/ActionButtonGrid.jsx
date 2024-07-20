import React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

function ActionButtonGrid({ buttons }) {
  return (
    <Grid container spacing={1} padding={1}>
      {buttons?.map((button) => (
        <Grid item key={button.name}>
          <Button
            variant="contained"
            color="primary"
            onClick={button.onClick}
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
