import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMatchById, selectMatchById } from "../store/slices/matchesSlice";
import { addNewPlayerAction, fetchSpreadsheetById, selectSpreadsheetById } from "../store/slices/spreadsheetsSlice";
import {
  Typography,
  Container,
  Card,
  Box,
  CssBaseline,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ActionButtonGrid from "../components/ActionButtonGrid";
import Spreadsheet from "../components/Spreadsheet";
import PlayerMenu from "../menus/PlayerMenu";

const actions = [
  "Point",
  "Caught",
  "Short",
  "Frame",
  "Footing",
  "Landed",
  "Bad Pass",
  "Drop pass",
  "1st",
  "2nd",
  "Drop",
  "Gap",
  "Dig",
];

function TrackerView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { matchId, third } = useParams();
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerMenuOpen, setPlayerMenuOpen] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [removePointsMode, setRemovePointsMode] = useState(false);
  const match = useSelector((state) => selectMatchById(state, matchId));
  const spreadsheet = useSelector((state) => selectSpreadsheetById(state, spreadsheetId));
  const matchStatus = useSelector((state) => state.matches.status);
  const spreadsheetStatus = useSelector((state) => state.spreadsheets.status);

  let intThird = parseInt(third);
  if (intThird < 1) intThird = 1;
  if (intThird > 3) intThird = 3;

  useEffect(() => {
    if (matchStatus === "idle" && !match) {
      dispatch(fetchMatchById(matchId))
      .unwrap()
      .then((response) => {
       switch (intThird) {
          case 1:
            setSpreadsheetId(response.thirds["first"]);
            break
          case 2:
            setSpreadsheetId(response.thirds["second"]);
            break
          case 3:
            setSpreadsheetId(response.thirds["third"]);
            break
        }
      });
    }
  }, [matchId, match, matchStatus, dispatch]);

  useEffect(() => {
    if (match?.thirds) {
      switch (intThird) {
        case 1:
          setSpreadsheetId(match.thirds["first"]);
          break
        case 2:
          setSpreadsheetId(match.thirds["second"]);
          break
        case 3:
          setSpreadsheetId(match.thirds["third"]);
          break
      } 
    }

    if (spreadsheetStatus === "idle" && !spreadsheet) {
      dispatch(fetchSpreadsheetById(spreadsheetId));
    }
  }, [third, spreadsheetId, spreadsheet, spreadsheetStatus, dispatch]);

  const navigateThird = (direction) => {
    const newThird = intThird + direction;
    if (newThird >= 1 && newThird <= 3) {
      navigate(`/match/${matchId}/third/${newThird}`);
      setSelectedPlayer("");
    }
  };

  const addAction = (action) => {
    const value = removePointsMode ? -1 : 1;
    dispatch(
      addNewPlayerAction({
        id: spreadsheetId,
        player: selectedPlayer,
        value: value,
        action: action.toLowerCase(),
      })
    );
  };

  const toggleRemovePointsMode = () => {
    setRemovePointsMode((prevMode) => !prevMode);
  };

  return (
    <>
      <CssBaseline />
      <PlayerMenu
        id={spreadsheetId}
        open={playerMenuOpen}
        close={() => setPlayerMenuOpen(false)}
      />
      <Container
        maxWidth="md"
        sx={{
          py: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {match?.name && (
          <Typography variant="h3" component="h1" gutterBottom align="center">
            {spreadsheet?.name}
          </Typography>
        )}

        {match?.thirds && (
          <Box sx={{ mb: 4, width: "100%" }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Button
                variant="contained"
                disabled={intThird === 1}
                onClick={() => navigateThird(-1)}
              >
                Previous Third
              </Button>
              <Button
                variant="outlined"
                onClick={() => setPlayerMenuOpen(true)}
              >
                Manage Players
              </Button>
              <Button
                variant="contained"
                disabled={intThird === 3}
                onClick={() => navigateThird(1)}
              >
                Next Third
              </Button>
            </Box>
            <Spreadsheet
              id={spreadsheetId}
              setSelected={setSelectedPlayer}
            />
          </Box>
        )}

        {selectedPlayer && (
          <Card sx={{ mt: 4, p: 3, width: "100%", position: "relative" }}>
            <Typography variant="h5" gutterBottom align="center">
              Action for: {selectedPlayer}
            </Typography>
            <FormControlLabel
              labelPlacement="start"
              control={
                <Switch
                  checked={removePointsMode}
                  onChange={toggleRemovePointsMode}
                  color="primary"
                />
              }
              label={removePointsMode ? "Remove" : "Add"}
              sx={{ position: "absolute", top: 16, right: 16 }}
            />
            <ActionButtonGrid
              buttons={actions}
              onClick={addAction}
              removePointsMode={removePointsMode}
            />
          </Card>
        )}
      </Container>
    </>
  );
}

export default TrackerView;
