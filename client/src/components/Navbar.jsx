import { useState } from "react";
import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import logo from "../assets/logo-red.png";
import { Menu, Settings } from "@mui/icons-material";
import PropTypes from "prop-types";
import SettingsModal from '../menus/SettingsMenu';
import { selectSettingByName } from "../store/slices/settingsSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Navbar({ dashboardID, toggleComponentMenu, title, setDarkMode}) {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const editMode = useSelector((state) => selectSettingByName(state, "EditMode"));

  const handleOpenSettings = () => setIsSettingsOpen(true);
  const handleCloseSettings = () => setIsSettingsOpen(false);

  return (
    <div>
      <AppBar sx={{ bgcolor: 'background.default' }}>
        <Container>
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            {editMode?.value === "true" &&
            <IconButton
              aria-label="component menu toggle"
              onClick={toggleComponentMenu}
              sx={{backgroundColor: "background.paper.default"}}
            >
              <Menu />
            </IconButton>
            }

            <Box
              sx={{
                maxWidth: "125px",
                height: "auto",
                padding: "10px 5px 5px 5px",
              }}
            >
              <img
                src={logo}
                alt="Fujitsu logo"
                onClick={()=> navigate('/')}
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                flexGrow: 1,
                textAlign: "center",
                color: "text.primary",
              }}
            >
              {title}
            </Typography>

            <IconButton
              aria-label="settings menu toggle"
              onClick={handleOpenSettings}
              sx={{backgroundColor: "background.paper.default"}}
            >
              <Settings />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <SettingsModal
        dashboardID={dashboardID}
        isOpen={isSettingsOpen}
        handleClose={handleCloseSettings}
        title={title}
        setLocalDarkMode={setDarkMode}
      />
    </div>
  );
}

Navbar.propTypes = {
  dashboardID: PropTypes.string,
  toggleComponentMenu: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  setDarkMode: PropTypes.func,
};
