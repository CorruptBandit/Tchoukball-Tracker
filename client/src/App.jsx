import React, { useState, useEffect, createContext } from "react";
import PropTypes from "prop-types";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import ExcelUpload from "./components/ExcelUpload"; // Adjust the path as necessary
import SpreadsheetViewer from "./components/SpreadsheetViewer"; // Adjust the path as necessary
import Login from "./pages/Login"; // Adjust the path as necessary
import TrackerView from "./pages/TrackerView";
import MatchesView from "./pages/MatchesView";
import PageNotFound from "./pages/PageNotFound";
import CreateMatchView from "./pages/CreateMatchView";
import { createTheme } from "@mui/material";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // Correct import statement

export const AuthContext = createContext();

export const getTokenFromCookies = () => {
  return Cookies.get("auth_token");
};

export const checkTokenStatus = () => {
  const token = getTokenFromCookies();
  console.log(token)
  if (!token) {
    return false;
  }
  const decodedToken = jwtDecode(token);
  const tokenExp = decodedToken.exp;
  const now = new Date().getTime() / 1000;

  return now <= tokenExp;
};

const userRouteAccess = {
  admin: ["upload", "view"],
  moderator: ["view"],
  questioner: ["view"],
  outcomeOwner: ["upload", "view"],
  observer: ["view"],
};

const ProtectedRoute = ({ routeName, children }) => {
  if (!checkTokenStatus()) {
    return <Navigate to="/login" />;
  }
  return children;
};

ProtectedRoute.propTypes = {
  routeName: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    async function getUserData() {
      const token = getTokenFromCookies();
      if (!checkTokenStatus()) {
        console.log("Bad");
        Cookies.remove("auth_token");
        setIsLoggedIn(false);
        navigate("/login");
      } else {
        console.log("Good");
        setIsLoggedIn(true);
      }
    }
    getUserData();
  }, [dispatch, navigate]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#1976d2",
      },
      background: {
        default: "#f5f5f5",
      },
    },
  });

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/upload"
            element={
              <ProtectedRoute routeName="upload">
                <ExcelUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute routeName="/">
                <MatchesView />
              </ProtectedRoute>
            }
          />
          <Route path="/create-match" element={<CreateMatchView />} />
          <Route
            path="/match/:matchId/third/:third"
            element={<TrackerView />}
          />
          <Route path="/view" element={<SpreadsheetViewer />} />
          <Route path="/*" element={<PageNotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
