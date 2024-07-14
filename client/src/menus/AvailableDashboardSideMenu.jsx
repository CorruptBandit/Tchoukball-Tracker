import PropTypes from "prop-types";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Button,
  Typography
} from "@mui/material";
import { useSelector } from "react-redux";
import { selectAllDashboards } from "../store/slices/dashboardsSlice";
import { useNavigate } from "react-router-dom";

export default function DashboardSideMenu({ state, setState }) {
    const availableDashboard = useSelector(state => selectAllDashboards(state));
    const navigate = useNavigate();

    return (
      <Drawer anchor="left" open={state}>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            px: 2,
            pt: 1
          }}
        >
        Dashboard Menu
        </Typography>
        <List>
          {availableDashboard.map((dashboard) => (
            <ListItem key={dashboard.id} disablePadding>
              <ListItemButton
                onClick={() => navigate(dashboard.path)}
              >
                <ListItemText primary={dashboard.name} />
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
  );
}

DashboardSideMenu.propTypes = {
  state: PropTypes.bool.isRequired,
  setState: PropTypes.func.isRequired,
};
