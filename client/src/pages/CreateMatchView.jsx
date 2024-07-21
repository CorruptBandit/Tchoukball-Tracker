import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  Container,
  Box
} from "@mui/material";
import { addNewMatch } from "../store/slices/matchesSlice";

const CreateMatchView = () => {
  const [matchName, setMatchName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkValid()) {
        await dispatch(addNewMatch({ name: matchName }))
          .unwrap()
          .then((response) => {
            if (response.id) {
              setErrorMessage("");
              navigate("./"+response.id);
            }
          })
          .catch((error) => {
            if (error.status === 409) {
              setErrorMessage("The provided match already exists");
            } else {
              setErrorMessage(error.message || "An unexpected error occurred");
            }
          });
      }
  };

  const checkValid = () => {
    if (matchName.trim() === "") {
      setErrorMessage("Please provide a name for the match");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Match
        </Typography>
        <TextField
        fullWidth
        label="Match Name"
        variant="outlined"
        value={matchName}
        onChange={(e) => setMatchName(e.target.value)}
        required
        sx={{ mb: 2 }}
        />
        <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
        >
        Create Match
        </Button>
      </Box>
    </Container>
  );
};

export default CreateMatchView;