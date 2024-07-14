import { Grid, Button, Paper, Typography, Card } from "@mui/material";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { removeIconFromMap } from "../store/slices/componentsSlice";
import DeleteIcon from "@mui/icons-material/Delete";

function CollapsibleGridItem({ popup, onRemove }) {
  return (
    <Grid item xs={12}>
      <Paper style={{ margin: "8px", padding: "8px" }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item style={{ display: "flex", alignItems: "center" }}>
            <Typography style={{ marginLeft: "8px" }}>{popup}</Typography>
          </Grid>
          <Grid item>
            <Button variant="contained" color="error" onClick={onRemove}>
              <DeleteIcon />
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

function IconList({ mapId, icons }) {
  const dispatch = useDispatch();

  const handleRemove = (id) => {
    dispatch(removeIconFromMap({ mapId: mapId, id: id }));
  };

  return (
    <Card sx={{ mt: 1 }}>
      <Grid container>
        {icons.length !== 0 && (
          <Typography
            sx={{
              mt: 1,
              fontSize: "1.4rem",
              flexGrow: 1,
              textAlign: "center",
              color: "text.primary",
            }}
          >
            Available Icons
          </Typography>
        )}
        {Object.values(icons).map((icon) => (
          <CollapsibleGridItem
            key={icon.id}
            popup={icon.popup}
            onRemove={() => handleRemove(icon.id)}
          />
        ))}
      </Grid>
    </Card>
  );
}

CollapsibleGridItem.propTypes = {
  popup: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
};

IconList.propTypes = {
  mapId: PropTypes.string.isRequired,
  icons: PropTypes.array.isRequired,
};

export default IconList;
