// Import necessary modules and components
import "./App.css";
import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import DashboardView from "./pages/DashboardView";
import PageNotFound from "./pages/PageNotFound";
import NewDashboardView from "./pages/NewDashboardView";
import { CircularProgress, Typography } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { fetchSettings, selectAllSettings } from "./store/slices/settingsSlice";
import {
  fetchDashboards,
  selectAllDashboards,
} from "./store/slices/dashboardsSlice";
import HomePage from "./pages/Homepage";
import websocket from "./store/DashboardWS";

function App() {
  const dispatch = useDispatch();
  const settings = useSelector(selectAllSettings);
  const settingsStatus = useSelector((state) => state.settings.status);
  const settingsError = useSelector((state) => state.settings.error);
  const dashboards = useSelector(selectAllDashboards);
  const dashboardsStatus = useSelector((state) => state.dashboards.status);
  const dashboardsError = useSelector((state) => state.dashboards.error);
  const [darkMode, setDarkMode] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  //Register websocket connection
  useEffect(() => {
    websocket.connect();

    return () => {
      websocket.disconnect()
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--background-color",
      theme.palette.background.default
    );
  }, [theme]);

  useEffect(() => {
    if (settingsStatus === "idle") {
      dispatch(fetchSettings());
    }
    if (dashboardsStatus === "idle") {
      dispatch(fetchDashboards());
    }
    if (dashboardsStatus === "succeeded" && settingsStatus === "succeeded") {
      setIsLoading(false);
    }
  }, [settingsStatus, dashboardsStatus, dispatch]);

  useEffect(() => {
    const darkModeSetting = settings.find((s) => s.name === "DarkMode");
    if (darkModeSetting) {
      setDarkMode(darkModeSetting.value === "true" ? true : false);
    }

    const editModeSetting = settings.find((s) => s.name === "EditMode");
    if (editModeSetting) {
      setEditMode(editModeSetting.value === "true" ? true : false);
    }
  }, [settings]);

  return isLoading ? (
    dashboardsError || settingsError ? (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ color: "red" }}>ERROR</h1>
          <Typography
            sx={{
              mt: 1,
              fontSize: "2.2rem",
              color: "text.primary",
            }}
          >
            Failed to connect to API server!
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontSize: "2.2rem",
              color: "text.primary",
            }}
          >
            (Please try again later)
          </Typography>
        </div>
      </div>
    ) : (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    )
  ) : (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<HomePage setDarkMode={setDarkMode}/>} />
        <Route path="/new" element={<NewDashboardView setDarkMode={setDarkMode} />} />
        {dashboards.map((dashboard) => (
          <Route
            key={dashboard.id}
            path={dashboard.path}
            element={
              <DashboardView dashboardID={dashboard.id} editMode={editMode} />
            }
          />
        ))}
        <Route path="/*" element={<PageNotFound />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
