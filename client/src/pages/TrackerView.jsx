import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Container, Card, Box, CssBaseline, Button } from "@mui/material";
import ActionButtonGrid from "../components/ActionButtonGrid";
import Spreadsheet from "../components/Spreadsheet";
import { fetchMatchById, selectMatchById } from "../store/slices/matchesSlice";

function TrackerView() {
  const { matchId, third } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const match = useSelector((state) => selectMatchById(state, matchId));
  const matchStatus = useSelector((state) => state.matches.status);
  let intThird = parseInt(third);
  if (intThird < 1) intThird = 1;
  if (intThird > 3) intThird = 3;

  const actions = [
    { name: "Point", onClick: () => console.log("Point") },
    { name: "Caught", onClick: () => console.log("Caught") },
    { name: "Short", onClick: () => console.log("Short") },
    { name: "Mistake", onClick: () => console.log("Mistake") },
    { name: "1st", onClick: () => console.log("1st") },
    { name: "2nd", onClick: () => console.log("2nd") },
    { name: "Drop", onClick: () => console.log("Drop") },
    { name: "Gap", onClick: () => console.log("Gap") },
  ];

  useEffect(() => {
    if (matchStatus === "idle" && !match) {
      dispatch(fetchMatchById({ id: matchId }));
    }
  }, [matchId, match, matchStatus, dispatch]);

  const thirdFormatter = () => {
    if (intThird === 1) return "1st";
    if (intThird === 2) return "2nd";
    if (intThird === 3) return "3rd";
    return `${intThird}th`;
  };

  const thirdIDCalculator = () => {
    const third = Object.keys(match.thirds)[intThird - 1];
    return match.thirds[third];
  };

  const navigateThird = (direction) => {
    const newThird = intThird + direction;
    if (newThird >= 1 && newThird <= 3) {
      navigate(`/match/${matchId}/third/${newThird}`);
      setSelectedPlayer("");
    }
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        {match?.name && (
          <Typography variant="h3" component="h1" gutterBottom align="center">
            {match.name} - {thirdFormatter()} Third
          </Typography>
        )}

        {match?.thirds && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Button
                variant="contained"
                disabled={intThird === 1}
                onClick={() => navigateThird(-1)}
              >
                Previous Third
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
              id={thirdIDCalculator()}
              setSelected={setSelectedPlayer}
            />
          </Box>
        )}

        {selectedPlayer && (
          <Card sx={{ mt: 4, p: 3 }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Typography variant="h5" gutterBottom>
                Action for: {selectedPlayer}
              </Typography>
            </div>
            <ActionButtonGrid buttons={actions} />
          </Card>
        )}
      </Container>
    </>
  );
}

export default TrackerView;
