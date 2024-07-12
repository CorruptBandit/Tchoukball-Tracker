import PropTypes from "prop-types";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Button,
  Typography
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import WebAssetIcon from "@mui/icons-material/WebAsset";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ChatIcon from '@mui/icons-material/Chat';
import ComponentSelectorMenu from "./ComponentSelectorMenu";
import { useState } from "react";

export default function ComponentSideMenu({ dashboardID, state, setState, handleComponent }) {
  const [type, setType] = useState("texts");
  const [showModal, setShowModal] = useState(false);

  const availableComponents = [
    { type: "chats", name: "Chats", icon: <ChatIcon />},
    { type: "maps", name: "Maps", icon: <MapIcon /> },
    { type: "graphs", name: "Graphs", icon: <BarChartIcon /> },
    { type: "texts", name: "Texts", icon: <DescriptionIcon /> },
    { type: "images", name: "Images", icon: <ImageIcon /> },
    { type: "videos", name: "Videos", icon: <VideocamIcon /> },
    { type: "webpages", name: "Web Pages", icon: <WebAssetIcon /> },
    { type: "datasources", name: "Data Sources", icon: <CloudDownloadIcon /> },
  ];

  const clickButton = (type) => {
    setType(type);
    setShowModal(true);
    setState(false);
  };

  return (
    <div>
      <ComponentSelectorMenu
        dashboardID={dashboardID}
        open={showModal}
        type={type}
        handleComponent={handleComponent}
        handleClose={() => {
          setShowModal(!showModal);
        }}
      />
      <Drawer anchor="left" open={state}>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            px: 2,
            pt: 1
          }}
        >
        Component Menu
        </Typography>
        <List>
          {availableComponents.map((component) => (
            <ListItem key={component.type} disablePadding>
              <ListItemButton
                onClick={() => {
                  clickButton(component.type);
                }}
              >
                <ListItemIcon>{component.icon}</ListItemIcon>
                <ListItemText primary={component.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          onClick={() => {
            setState(false);
          }}
          sx={{ mt: 2, mx: 2 }}
        >
          Close
        </Button>
      </Drawer>
    </div>
  );
}

ComponentSideMenu.propTypes = {
  dashboardID: PropTypes.string.isRequired,
  handleComponent: PropTypes.func.isRequired,
  state: PropTypes.bool.isRequired,
  setState: PropTypes.func.isRequired,
};
