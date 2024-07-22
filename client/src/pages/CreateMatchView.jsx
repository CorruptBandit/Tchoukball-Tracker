import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  Container,
  Box,
  Chip,
  Autocomplete
} from "@mui/material";
import { addNewMatch } from "../store/slices/matchesSlice";

const CreateMatchView = () => {
  const [matchName, setMatchName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [playerInput, setPlayerInput] = useState("");
  const [players, setPlayers] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkValid()) {
      await dispatch(addNewMatch({ name: matchName, players }))
        .unwrap()
        .then((response) => {
          if (response.id) {
            setErrorMessage("");
            navigate("/");
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

  const handlePlayerInputChange = (event, newInputValue) => {
    setPlayerInput(newInputValue);
  };

  const handlePlayerChange = (event, newPlayers) => {
    setPlayers(newPlayers);
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
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={players}
          inputValue={playerInput}
          onInputChange={handlePlayerInputChange}
          onChange={handlePlayerChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={option} variant="outlined" label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Add Players"
              placeholder="Type a name and press Enter"
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          sx={{ mt: 2 }}
        >
          Create Match
        </Button>
        {errorMessage && (
          <Typography color="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default CreateMatchView;
