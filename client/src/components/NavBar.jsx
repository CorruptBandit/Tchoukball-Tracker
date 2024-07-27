import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/usersSlice";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import HomeIcon from "@mui/icons-material/Home";

const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    location.pathname !== "/auth/login" && (
      <AppBar position="fixed" sx={{background: "black"}}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="home"
            component={Link}
            to="/"
          >
            <HomeIcon />
          </IconButton>
          <div
            style={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Button color="inherit" component={Link} to="/create-match">
              Create
            </Button>
          </div>
          <Button color="inherit" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>
    )
  );
};

export default NavBar;
