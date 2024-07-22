import React, { useState, useEffect, createContext } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ExcelUpload from './components/ExcelUpload'; // Adjust the path as necessary
import SpreadsheetViewer from './components/SpreadsheetViewer'; // Adjust the path as necessary
import Login from './pages/Login'; // Adjust the path as necessary
import TrackerView from "./pages/TrackerView";
import MatchesView from "./pages/MatchesView";
import PageNotFound from "./pages/PageNotFound";
import CreateMatchView from "./pages/CreateMatchView";
import { createTheme } from "@mui/material";


export const AuthContext = createContext();

export const checkTokenStatus = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;

  const tokenBody = JSON.parse(atob(token.split('.')[1]));
  const tokenExp = tokenBody.exp;
  const now = new Date().getTime() / 1000;

  return now <= tokenExp;
};

const userRouteAccess = {
  admin: ['upload', 'view'],
  moderator: ['view'],
  questioner: ['view'],
  outcomeOwner: ['upload', 'view'],
  observer: ['view']
};

const ProtectedRoute = ({ routeName }) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem('auth_token');

  if (checkTokenStatus()) {
    const userRole = JSON.parse(atob(token.split('.')[1])).role;
    <Navigate to="/login" />
  }
};

ProtectedRoute.propTypes = {
  routeName: PropTypes.string.isRequired
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dispatch = useDispatch();

  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      background: {
        default: '#f5f5f5',
      },
    },
  });

  // useEffect(() => {
  //   const token = localStorage.getItem('auth_token');
  //   async function getUserData() {
  //     if (!checkTokenStatus()) {
  //       localStorage.removeItem('auth_token');
  //       setIsLoggedIn(false);
  //       return;

  //   getUserData();
  // }, [dispatch]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<ProtectedRoute routeName="upload"><ExcelUpload /></ProtectedRoute>} />
          <Route path="/" element={<MatchesView />} />
          <Route path="/create-match" element={<CreateMatchView />} />
          <Route path="/match/:matchId/third/:third" element={<TrackerView />} />
          <Route path="/view" element={<SpreadsheetViewer/>} />
          <Route path="/*" element={<PageNotFound/>} />
        </Routes>
      </Router>
    </AuthContext.Provider>
)}


export default App;
