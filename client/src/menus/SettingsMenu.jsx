import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  Switch,
  FormControlLabel,
  FormGroup,
  Typography,
  Modal,
  TextField,
} from "@mui/material";
import {
  selectAllSettings,
  updateSetting,
} from "../store/slices/settingsSlice";
import {
  selectDashboardById,
  updateDashboard,
} from "../store/slices/dashboardsSlice";
import { useTheme } from "@emotion/react";

export default function SettingsMenu({ dashboardID, isOpen, handleClose, setLocalDarkMode}) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const settings = useSelector((state) => selectAllSettings(state));
  const dashboard = useSelector((state) =>
    selectDashboardById(state, dashboardID)
  );

  const [title, setTitle] = useState(dashboard?.name);
  const [darkMode, setDarkMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [titleChange, setTitleChange] = useState(false);

  useEffect(() => {
    if (dashboardID) {
      setDarkMode(
        ToBoolean(settings.find((setting) => setting.name === "DarkMode")?.value)
      );
    } else {
      setDarkMode(theme.palette.mode === 'dark'); 
    }

    setEditMode(
      ToBoolean(settings.find((setting) => setting.name === "EditMode")?.value)
    );
  }, [dashboardID, theme, settings]);

  const ToBoolean = (value) => {
    if (value === "true") {
      return true;
    } else if (value === "false") {
      return false;
    } else if (typeof value === "boolean") {
      return value;
    } else {
      return false;
    }
  };

  const handleEditMode = () => {
    handleSettingChange("EditMode", !editMode);
  };

  const handleDarkMode = () => {
    if (dashboardID) {
      handleSettingChange("DarkMode", !darkMode);
    } else {
      setDarkMode(!darkMode)
      setLocalDarkMode(!darkMode);
    }
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
    setTitleChange(true);
  };

  function close() {
    if (titleChange && dashboardID) {
      dispatch(updateDashboard({ id: dashboardID, name: title }));
      setTitleChange(false);
    }
    handleClose();
  }

  const handleSettingChange = (settingName, value) => {
    const setting = settings.find((setting) => setting.name === settingName);
    if (!setting) {
      return console.error("Failed to find setting!");
    }

    dispatch(
      updateSetting({
        id: setting.id,
        value: value,
      })
    );
  };

  return isOpen ? (
    <Modal
      open={isOpen}
      onClose={handleClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        outline: "none",
      }}
      className="modal-content"
    >
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 3,
          bgcolor: "background.paper",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" component="h2" sx={{ mt: -2 }}>
          Settings
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={handleDarkMode} />}
            label="Dark Mode"
          />
          {dashboardID && (
            <>
              <FormControlLabel
                control={
                  <Switch checked={editMode} onChange={handleEditMode} />
                }
                label="Edit Mode"
              />
              <TextField
                label="Dashboard Title"
                variant="outlined"
                value={title}
                onChange={handleTitleChange}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </FormGroup>
        <Button variant="contained" onClick={close} sx={{ mt: 2 }}>
          Save
        </Button>
      </Card>
    </Modal>
  ) : null;
}

SettingsMenu.propTypes = {
  dashboardID: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  setLocalDarkMode: PropTypes.func,
};
