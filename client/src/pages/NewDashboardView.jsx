import { useState } from "react";
import { useDispatch } from "react-redux";
import { addNewDashboard } from "../store/slices/dashboardsSlice";
import PropTypes from "prop-types";
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import DashboardSideMenu from "../menus/AvailableDashboardSideMenu";

function NewDashboardView({ setDarkMode }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [modal, setModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (checkValid()) {
      dispatch(addNewDashboard({ name, path }))
        .unwrap()
        .then((response) => {
          if (response.path) {
            setErrorMessage("");
            navigate(response.path);
          }
        })
        .catch((error) => {
          if (error.status === 409) {
            setErrorMessage("The provided path already exists");
          } else {
            setErrorMessage(error.message || "An unexpected error occurred");
          }
        });
    }
  };

  const checkValid = () => {
    if (name.trim() === "") {
      setErrorMessage("Please provide a name for the dashboard");
      return false;
    }

    if (path.trim() === "" || !path.includes("/")) {
      setErrorMessage("Please provide a valid path for the dashboard");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  return (
    <Container sx={{ pb: 10 }}>
      <DashboardSideMenu state={modal} setState={setModal} />
      <Navbar
        title={"Create New Dashboard"}
        toggleComponentMenu={() => {
          setModal(true);
        }}
        setDarkMode={setDarkMode}
      />
      <Paper elevation={3} sx={{ mt: 4, p: matches ? 6 : 3 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            "& .MuiTextField-root": { m: 1, width: "90%" },
          }}
        >
          <Typography component="h2" variant="h5" sx={{ mb: 2, fontWeight: "medium" }}>
            Create New Dashboard
          </Typography>
          {errorMessage && (
            <Typography variant="body1" color="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
          )}
          <TextField
            label="Dashboard Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            helperText="Enter a unique name for your dashboard."
          />
          <TextField
            label="Dashboard Path"
            variant="outlined"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            required
            helperText="Example: /my-dashboard-path"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, width: "50%" }}
          >
            Create Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

NewDashboardView.propTypes = {
  setDarkMode: PropTypes.func,
};

export default NewDashboardView;
