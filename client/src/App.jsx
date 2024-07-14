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
import {
  selectAllDashboards,
} from "./store/slices/dashboardsSlice";
import HomePage from "./pages/Homepage";

function App() {
  const settingsStatus = useSelector((state) => state.settings.status);
  const dashboards = useSelector(selectAllDashboards);
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

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
