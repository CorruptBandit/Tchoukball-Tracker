import PropTypes from "prop-types";
import {
  Modal,
  Card,
  Box,
  Button,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ComponentList from "../components/ComponentList";
import { fetchComponents } from "../store/slices/componentsSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDashboardById } from "../store/slices/dashboardsSlice";
import CreateComponentMenu from "./CreateComponentMenu";

function ComponentSelectorMenu({
  dashboardID,
  open,
  type,
  handleComponent,
  handleClose,
}) {
  const title = type[0].toUpperCase() + type.slice(1);
  const dashboard = useSelector((state) =>
    selectDashboardById(state, dashboardID)
  );
  const componentStatus = useSelector((state) => state.components[type].status);
  const components = useSelector((state) => state.components[type].entities);
  const [create, setCreate] = useState(Object.values(components).length === 0);
  const [modifyComponent, setModifyComponent] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    if (componentStatus === "idle") {
      dispatch(fetchComponents(type));
    }
  }, [componentStatus, type, dispatch]);

  useEffect(() => {
    setCreate(Object.values(components).length === 0);
  }, [components, type]);

  const handleEdit = (id) => {
    if (id === modifyComponent) {
      setModifyComponent(undefined);
      return;
    }
    setCreate(false);
    setModifyComponent(id);
  };

  const toggleCreator = () => {
    setCreate(!create);
    setModifyComponent(undefined);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        pt: 12,
        overflow: "scroll" 
      }}
    >
      <Card
        sx={{
          p: 3,
          width: "50%",
          alignContent: "center",
          justifyContent: "center",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              mb: 2,
              width: "100%",
              textAlign: "center",
            }}
          >
            {title}
          </Typography>
        </div>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ComponentList
            type={type}
            existing={dashboard ? dashboard.components : []}
            handleEdit={handleEdit}
            handleComponent={handleComponent}
          />
        </Box>
        <div style={{ display: "flex", justifyContent: "right" }}>
          <FormControlLabel
            value="start"
            control={
              <Switch
                checked={create}
                onChange={toggleCreator}
                color="primary"
              />
            }
            label="Create New"
            labelPlacement="start"
          />
        </div>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CreateComponentMenu
            shown={create || modifyComponent !== undefined}
            type={type}
            handleComponent={handleComponent}
            id={modifyComponent}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        </Box>
      </Card>
    </Modal>
  );
}

ComponentSelectorMenu.propTypes = {
  dashboardID: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  handleComponent: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default ComponentSelectorMenu;
