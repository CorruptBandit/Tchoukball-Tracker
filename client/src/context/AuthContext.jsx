import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [email, setEmail] = useState(localStorage.getItem('email') || "");
  const [name, setName] = useState(localStorage.getItem('name') || "");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/validateToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Token validation failed');
        }

        const data = await response.json();

        setIsLoggedIn(true); // Only set isLoggedIn true if the server confirms the token is valid
        setIsAdmin(data.email === 'admin@admin.admin');
      } catch (error) {
        console.error('Error:', error);
        logout();
      }
    };

    checkAuth();
  }, []);


  const login = async (email, password) => {
    try {
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.log(data)
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      setEmail(data.email);
      setName(data.name);
      setIsAdmin(data.email === 'admin@admin.admin');
      setIsLoggedIn(true);
      // Update local storage
      localStorage.setItem('email', data.email);
      localStorage.setItem('name', data.name);
      return null;
    } catch (error) {
      console.error('Error:', error);
      return error.message || 'Login failed'; 
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      setEmail(email);
      setName(name);
      setIsLoggedIn(true);
      // Update local storage
      localStorage.setItem('email', email);
      localStorage.setItem('name', name);

      return null; // Registration success, no error message
    } catch (error) {
      console.error('Error:', error);
      return error.message || 'Registration failed'; // Return the error message
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setIsLoggedIn(false);
      setEmail('');
      setName('');
      setIsAdmin(false);
      // Clear local storage
      localStorage.removeItem('email');
      localStorage.removeItem('name');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, name, email, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
