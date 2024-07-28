import { useContext, useState } from "react";
// import { useDispatch } from 'react-redux';
// import {
//   fetchUserPreferences,
//   updateUserPreferences
// } from '../store/slices/userSlice';

import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Button,
  Card,
  Checkbox,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";
import { AuthContext } from "../App";
import { useDispatch } from "react-redux";
import { login } from "../store/slices/usersSlice";

export default function LoginView() {
  const dispatch = useDispatch();
  const { setIsLoggedIn } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const changeUsername = (event) => setUsername(event.target.value);
  const changePassword = (event) => setPassword(event.target.value);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const toggleCheckbox = () => {
    setKeepLoggedIn(!keepLoggedIn);
  };

  const canLogin =
    [username, password].every(Boolean);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (canLogin) {
      setErrorMessage("");
      let payload = {
        username: username,
        password: password,
        keep_logged_in: keepLoggedIn,
      };

      await dispatch(login(payload))
        .then((response) => {
            setUsername("");
            setPassword("");
            setIsLoggedIn(true);
            if (response.payload.code === 200) {
              window.location.href = "/";
            } else {
              setErrorMessage(response?.error?.message || "An unexpected error occurred");
            }
        })
        .catch((error) => {
          console.log(error)
          if (error.status === 401) {
            setErrorMessage("Invalid Credentials");
          } else {
            setErrorMessage(error.error.message || "An unexpected error occurred");
          }
        });
    } else {
      setErrorMessage("Please enter username & password to login");
    }
  };

  return (
    <div style={styles.container}>
      <Card sx={{ p: 8, mx: 6, my: 12 }} style={styles.card} raised>
        <form className="LoginView" onSubmit={handleLogin} style={styles.form}>
          <Typography
            sx={{ 
              fontWeight: "bold", 
              fontSize: "1.1rem",
              marginBottom: "24px",
              textAlign: "center" // Centered the text
            }}
            className="text-center"
          >
            Log In
          </Typography>
          <Typography color="error" sx={{ marginBottom: "16px", textAlign: "center" }}>{errorMessage}</Typography>
          <div style={styles.inputContainer}> {/* Adjusted margin */}
            <TextField
              id="outlined-basic"
              label="Username"
              variant="outlined"
              fullWidth
              sx={{
                "& fieldset": {
                  borderRadius: "9999px",
                },
                "& .MuiOutlinedInput-root": {
                  "&:focus-within fieldset": {
                    borderWidth: "2px",
                  },
                },
              }}
              type="text"
              value={username}
              onChange={(event) => changeUsername(event)}
            />
          </div>
          <div style={styles.inputContainer}> {/* Adjusted margin */}
            <FormControl variant="outlined" fullWidth>
              <InputLabel htmlFor="outlined-adornment-password">
                Password
              </InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? "text" : "password"}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
                fullWidth
                sx={{
                  "& fieldset": {
                    borderRadius: "9999px",
                  },
                  "& .MuiOutlinedInput-root": {
                    "&:focus-within fieldset": {
                      borderWidth: "2px",
                    },
                  },
                }}
                value={password}
                onChange={(event) => changePassword(event)}
              />
            </FormControl>
          </div>
  
          <div style={styles.buttonContainer}> {/* Adjusted margin and centering */}
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: "9999px",
                padding: "12px 24px", // Increased button padding
              }}
              className="w-full"
            >
              Log In
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#f0f0f0",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: "16px",
    width: "100%", // Ensure the form takes full width
  },
  inputContainer: {
    width: "100%", // Ensure the inputs take full width
    marginBottom: "16px", // Add margin for spacing
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginTop: "16px"
  }
};
