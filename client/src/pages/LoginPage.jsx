import { useState } from "react";
import validator from 'validator'; // Import validator for email checking
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { Helmet } from "react-helmet-async";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useAuth } from "../context/AuthContext";
import MD5 from 'crypto-js/md5';
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

export default function SignIn() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  const [showContactAdmin, setShowContactAdmin] = useState(false);


  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
  
    const email = data.get("email");
    const password = data.get("password");
    const passwordHash = MD5(password).toString();
  
    try {
      if (isRegistering) {
        if (!validator.isEmail(email)) {
          alert("Please enter a valid email address.");
        }
        if (email === "admin@admin.admin") {
          alert("Nice try! Please behave... You shouldn't be trying to do this :)");
          return;
        }
        const name = data.get("name");
        if (!name) {
          alert("Please enter your full name.");
          return;
        }
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
        if (!passwordRegex.test(password)) {
          alert("Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.");
          return;
        }
        
        const registrationError = await register(name, email, passwordHash);
        if (!registrationError) {
          navigate('/');
        } else {
          console.error("Registration failed:", registrationError);
          alert(`Registration failed: ${registrationError}`);
        }
      } else {
        const loginError = await login(email, passwordHash);
        if (!loginError) {
          navigate('/');
          setFailedLoginAttempts(0); // Reset counter on successful login
        } else {
          console.error("Login failed:", loginError);
          alert(`Login failed: ${loginError}`);
          const attempts = failedLoginAttempts + 1;
          setFailedLoginAttempts(attempts);
          if (attempts >= 3) {
            setShowContactAdmin(true);
          }
        }
      }
    } catch (error) {
      console.error(`${isRegistering ? "Registration" : "Sign-in"} failed:`, error);
      alert("An error occurred. Please try again.");
    }
  };
  
  return (
    <ThemeProvider theme={defaultTheme}>
      <Helmet>
        <title>Login | Register</title>
      </Helmet>
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center", height: "100vh" }}>
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {isRegistering ? "New User" : "Existing User"}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, alignItems: "center" }}>
            {isRegistering && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus={!isRegistering}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              {isRegistering ? "Register" : "Sign In"}
            </Button>
            <Button fullWidth onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register"}
            </Button>
            {showContactAdmin && (
              <Typography color="error" sx={{ mt: 2 }}>
                3 Failed Login Attempts. Please contact the administrator for a password reset.
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
