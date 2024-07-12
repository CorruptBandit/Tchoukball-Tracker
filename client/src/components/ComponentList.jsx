import {
  Grid,
  Button,
  Paper,
  Typography,
  Checkbox,
} from "@mui/material";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { deleteComponent } from "../store/slices/componentsSlice";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function CollapsibleGridItem({
  id,
  name,
  onToggle,
  onEdit,
  onRemove,
  isChecked,
}) {
  return (
    <Grid item xs={12}>
      <Paper style={{ margin: "8px", padding: "8px" }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              checked={isChecked}
              onChange={(event) => onToggle(id, event.target.checked)}
              color="primary"
            />
            <Typography
              variant="h6"
              component="h3"
              style={{ marginLeft: "8px" }}
            >
              {name}
            </Typography>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={onEdit} sx={{mr: 1}}>
              <EditIcon />
            </Button>
            <Button variant="contained" color="error" onClick={onRemove}>
              <DeleteIcon />
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

function ComponentList({ type, existing, handleEdit, handleComponent }) {
  const components = useSelector((state) => state.components[type].entities);
  const dispatch = useDispatch();

  const handleToggle = (id, isChecked) => {
    handleComponent(id, type, isChecked ? "add" : "remove");
  };

  const handleRemove = (id) => {
    dispatch(deleteComponent({ type: type, id: id }));
    handleComponent(id, type, "remove");
  };

  return (
    <Grid container>
      {Object.values(components).map((component) => (
        <CollapsibleGridItem
          key={component.id}
          id={component.id}
          name={component.name}
          onToggle={handleToggle}
          onEdit={() => handleEdit(component.id)}
          onRemove={() => handleRemove(component.id)}
          isChecked={existing.some(
            (e) => e.componentID === component.id && e.type === type
          )}
        />
      ))}
    </Grid>
  );
}

CollapsibleGridItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  isChecked: PropTypes.bool.isRequired,
};

ComponentList.propTypes = {
  type: PropTypes.string.isRequired,
  existing: PropTypes.array.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleComponent: PropTypes.func.isRequired,
};

export default ComponentList;
