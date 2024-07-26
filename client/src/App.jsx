import { useState, useEffect, createContext } from "react";
import PropTypes from "prop-types";
import {
  BrowserRouter as Router,
  Route,
  Routes,
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
import { checkJWT } from "./store/slices/usersSlice";

export const AuthContext = createContext();

// const userRouteAccess = {
//   admin: ["upload", "view"],
//   moderator: ["view"],
//   questioner: ["view"],
//   outcomeOwner: ["upload", "view"],
//   observer: ["view"],
// };

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const getUserData = async () => {
      try {
        await dispatch(checkJWT()).unwrap();
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Failed to authenticate:", error);
        setIsLoggedIn(false);
        navigate("/login");
      }
    };

    getUserData();
  }, [dispatch, navigate]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
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
              // <ProtectedRoute routeName="upload">
              <ExcelUpload />
              // { </ProtectedRoute> }
            }
          />
          <Route
            path="/"
            element={
              // <ProtectedRoute routeName="/">
              <MatchesView />
              // </ProtectedRoute>
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
