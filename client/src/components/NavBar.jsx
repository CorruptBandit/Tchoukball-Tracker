import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/usersSlice'; // Ensure you have a logout action

const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        <li style={liStyle}><Link to="/" style={linkStyle}>Home</Link></li>
        <li style={liStyle}><button onClick={handleSignOut} style={buttonStyle}>Sign Out</button></li>
      </ul>
    </nav>
  );
};

const navStyle = {
  position: 'fixed',
  top: 0,
  width: '100%',
  backgroundColor: '#333',
  color: '#fff',
  padding: '10px 0',
  textAlign: 'center',
  zIndex: 1000, // Ensure it's above other content
};

const ulStyle = {
  listStyleType: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center', // Ensure items are centered vertically
  height: '100%',
};

const liStyle = {
  margin: '0 15px',
};

const linkStyle = {
  color: '#fff',
  textDecoration: 'none',
};

const buttonStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '16px',
};

export default NavBar;
