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
  selectPlayersFromMatch
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
  const playersFromMatch = useSelector((state) => selectPlayersFromMatch(state, selectedMatch?.name || ''));

  useEffect(() => {
    console.log("Fetching matches...");
    dispatch(fetchMatches());
  }, [dispatch]);

  useEffect(() => {
    if (selectedMatch) {
      console.log("Selected match:", selectedMatch);

      // Fetch players for all thirds of the selected match
      const ids = [
        selectedMatch.firstThirdId,
        selectedMatch.secondThirdId,
        selectedMatch.thirdThirdId,
      ];

      console.log("Fetching players from IDs:", ids);
      dispatch(fetchPlayersForMatch(ids));
    }
  }, [selectedMatch, dispatch]);

  useEffect(() => {
    console.log("Players from selected match:", playersFromMatch);
    setPlayers(playersFromMatch.map(player => player.name));
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
    console.log("Players after change:", newPlayers);
    setPlayers(newPlayers);
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
          options={players}
          value={players}
          inputValue={playerInput}
          onInputChange={handlePlayerInputChange}
          onChange={handlePlayerChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option} // Ensure `key` is assigned directly here
                variant="outlined"
                label={option}
                {...getTagProps({ index })} // Make sure `key` is not part of the spread props
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
