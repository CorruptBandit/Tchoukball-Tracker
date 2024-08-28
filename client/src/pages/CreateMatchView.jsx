import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  Container,
  Box,
  Chip,
  Autocomplete,
} from "@mui/material";
import {
  addNewMatch,
  selectAllMatches,
  fetchMatches,
} from "../store/slices/matchesSlice";
import {
  fetchPlayersForMatch,
} from "../store/slices/spreadsheetsSlice";

const CreateMatchView = () => {
  const [matchName, setMatchName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [playerInput, setPlayerInput] = useState("");
  const [players, setPlayers] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const matches = useSelector(selectAllMatches);
  const playersFromMatch = useSelector((state) => state.spreadsheets.playerNames || []);

  useEffect(() => {
    dispatch(fetchMatches());
  }, [dispatch]);

  useEffect(() => {
    if (selectedMatch && selectedMatch.thirds) {
      const ids = [
        selectedMatch.thirds.first,
        selectedMatch.thirds.second,
        selectedMatch.thirds.third
      ];
      dispatch(fetchPlayersForMatch(ids));
    }
  }, [selectedMatch, dispatch]);

  useEffect(() => {
    if (playersFromMatch.length > 0) {
      const playerNames = playersFromMatch.map(player => player.name || "").filter(name => name.trim() !== "");
      setPlayers(prevPlayers => [...new Set([...prevPlayers, ...playerNames])]);
    }
  }, [playersFromMatch]);

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
    // Ensure player names are correctly extracted and trimmed
    const updatedPlayers = newPlayers
      .map(player => (typeof player === 'string' ? player.trim() : player.name ? player.name.trim() : ""))
      .filter(name => name.length > 0);
    setPlayers(updatedPlayers);
  };

  const handleMatchSelection = (event, newSelectedMatch) => {
    setSelectedMatch(newSelectedMatch);
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

        {/* Autocomplete for selecting an existing match to copy players from */}
        <Autocomplete
          options={matches}
          getOptionLabel={(option) => option.name}
          value={selectedMatch}
          onChange={handleMatchSelection}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Copy Players From Existing Match"
              placeholder="Select a match"
              sx={{ mb: 2 }}
            />
          )}
        />

        {/* Autocomplete for adding players */}
        <Autocomplete
          multiple
          freeSolo
          options={players.map(player => ({ name: player }))}
          value={players.map(player => ({ name: player }))}
          inputValue={playerInput}
          onInputChange={handlePlayerInputChange}
          onChange={handlePlayerChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option.name} // Ensure `key` is assigned based on `name`
                variant="outlined"
                label={option.name}
                {...getTagProps({ index })}
              />
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
