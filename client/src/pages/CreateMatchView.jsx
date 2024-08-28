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
  selectPlayersFromMatch,
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
  const playersFromMatch = useSelector((state) =>
    selectPlayersFromMatch(state, selectedMatch?.name)
  );

  useEffect(() => {
    console.log("Fetching matches...");
    dispatch(fetchMatches());
  }, [dispatch]);

  useEffect(() => {
    if (selectedMatch && selectedMatch.thirds) {
      console.log("Selected match:", selectedMatch);

      // Fetch players for all thirds of the selected match
      const ids = [
        selectedMatch.thirds.first,
        selectedMatch.thirds.second,
        selectedMatch.thirds.third
      ];

      console.log("Fetching players from IDs:", ids);
      dispatch(fetchPlayersForMatch(ids));
    }
  }, [selectedMatch, dispatch]);

  useEffect(() => {
    console.log("Raw players data from match:", playersFromMatch);

    if (playersFromMatch.length > 0) {
      // Extract only the player names
      const playerNames = playersFromMatch
        .map((player) => {
          console.log("Processing player:", player); // Log each player object
          return player.trim(); // Assuming playersFromMatch is an array of names (strings)
        })
        .filter((name) => name.length > 0);

      console.log("Aggregated player names:", playerNames);
      setPlayers(playerNames);
      setPlayerInput(""); // Clear input when new players are set
    }
  }, [playersFromMatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkValid()) {
      console.log("Submitting match with name:", matchName, "and players:", players);
      await dispatch(addNewMatch({ name: matchName, players }))
        .unwrap()
        .then((response) => {
          if (response.id) {
            setErrorMessage("");
            navigate("/");
          }
        })
        .catch((error) => {
          console.error("Error creating match:", error);
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
    console.log("Player input change:", newInputValue);
    setPlayerInput(newInputValue);
  };

  const handlePlayerChange = (event, newPlayers) => {
    console.log("Players after change:", newPlayers);
    // Update players state with new player names
    setPlayers(newPlayers.map(player => player.name));
  };

  const handleMatchSelection = (event, newSelectedMatch) => {
    console.log("Match selected:", newSelectedMatch);
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
