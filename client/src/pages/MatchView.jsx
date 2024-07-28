import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Container,
  CssBaseline
} from "@mui/material";
import { fetchMatchById, selectMatchById } from "../store/slices/matchesSlice";
import MatchOverview from "../components/MatchOverview";
import { fetchSpreadsheetById, selectSpreadsheetById } from "../store/slices/spreadsheetsSlice";

const MatchView = () => {
  const { matchId } = useParams();
  const dispatch = useDispatch();
  const match = useSelector(state => selectMatchById(state, matchId));
  const matchStatus = useSelector(state => state.matches.status);
  const spreadsheetStatus = useSelector(state => state.spreadsheets.status);
  
  const first = useSelector(state => selectSpreadsheetById(state, match?.thirds["first"]));
  const second = useSelector(state => selectSpreadsheetById(state, match?.thirds["second"]));
  const third = useSelector(state => selectSpreadsheetById(state, match?.thirds["third"]));

  useEffect(() => {
    if (matchStatus === "idle") {
      dispatch(fetchMatchById(matchId));
    }
  }, [matchStatus, dispatch]);


  useEffect(() => {
    if (spreadsheetStatus === "idle" && match?.thirds) {
      if (!first) dispatch(fetchSpreadsheetById(match.thirds["first"]));
      if (!second) dispatch(fetchSpreadsheetById(match.thirds["second"]));
      if (!third) dispatch(fetchSpreadsheetById(match.thirds["third"]));
    }
  }, [match, spreadsheetStatus, dispatch]);

  const useMatchData = (match) => {
    // Retrieve each third's data from Redux
    const first = useSelector(state => selectSpreadsheetById(state, match?.thirds["first"]));
    const second = useSelector(state => selectSpreadsheetById(state, match?.thirds["second"]));
    const third = useSelector(state => selectSpreadsheetById(state, match?.thirds["third"]));
  
    // Helper function to sum stats
    const sumAttackingStats = (existingStats, newStats) => {
      return {
        point: existingStats.point + newStats.point,
        caught: existingStats.caught + newStats.caught,
        short: existingStats.short + newStats.short,
        mistake: existingStats.mistake + newStats.mistake,
      };
    };

    const sumDefendingStats = (existingStats, newStats) => {
      return {
        first: existingStats.first + newStats.first,
        second: existingStats.second + newStats.second,
        drop: existingStats.drop + newStats.drop,
        gap: existingStats.gap + newStats.gap,
      };
    };
      
    // Aggregate data
    const players = {};
  
    // Process a single third's data
    const processThird = (thirdData) => {
      thirdData?.players?.forEach(player => {
        if (!players[player.name]) {
          players[player.name] = {
            name: player.name,
            attacking: { point: 0, caught: 0, short: 0, mistake: 0 },
            defending: { first: 0, second: 0, drop: 0, gap: 0 },
          };
        }
        // Make sure existing stats are correctly referenced and updated
        players[player.name].attacking = sumAttackingStats(players[player.name].attacking, player.attacking);
        players[player.name].defending = sumDefendingStats(players[player.name].defending, player.defending);
      });
    };
  
    // Process each third
    [first, second, third]?.forEach(third => processThird(third));
  
    return {
      name: match?.name || "Match Name Not Found",
      players: Object.values(players),
    };
  };


  const matchData = useMatchData(match);
  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <MatchOverview matchData={matchData} />
      </Container>
      </>
  );
};

export default MatchView;