import React, { useState, useEffect, createContext } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './store/slices/userSlice'; // Adjust the path as necessary
import ExcelUpload from './components/ExcelUpload'; // Adjust the path as necessary
import SpreadsheetViewer from './components/SpreadsheetViewer'; // Adjust the path as necessary
import Login from './pages/Login'; // Adjust the path as necessary

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

const PageNotFound = () => <div>Page Not Found</div>;

const ProtectedRoute = ({ routeName }) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem('auth_token');
  const settingsStatus = useSelector((state) => state.settings.status);
  const settingGroupsStatus = useSelector((state) => state.settings.settingGroups.status);

  // useEffect(() => {
  //   if (settingsStatus === 'idle') {
  //     dispatch(fetchSettings());
  //   }
  // }, [settingsStatus, dispatch]);

  // useEffect(() => {
  //   if (settingGroupsStatus === 'idle') {
  //     dispatch(fetchSettingGroups());
  //   }
  // }, [settingGroupsStatus, dispatch]);

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

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    async function getUserData() {
      if (!checkTokenStatus()) {
        localStorage.removeItem('auth_token');
        setIsLoggedIn(false);
        return;
      }

      try {
        const data = await dispatch(fetchUser(token)).unwrap();
        if (data.status === 'success') {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('auth_token');
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        localStorage.removeItem('auth_token');
        setIsLoggedIn(false);
      }
    }

    getUserData();
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <Router>
        <Routes>
          <Route path="/" element={<SpreadsheetViewer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<ProtectedRoute routeName="upload"><ExcelUpload /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
