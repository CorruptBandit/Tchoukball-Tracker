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
        frame: existingStats.frame + newStats.frame,
        footing: existingStats.footing + newStats.footing,
        landed: existingStats.landed + newStats.landed,
        badPass: existingStats.badPass + newStats.badPass,
        dropPass: existingStats.dropPass + newStats.dropPass
      };
    };
  
    const sumDefendingStats = (existingStats, newStats) => {
      return {
        first: existingStats.first + newStats.first,
        second: existingStats.second + newStats.second,
        drop: existingStats.drop + newStats.drop,
        gap: existingStats.gap + newStats.gap,
        dig: existingStats.dig + newStats.dig
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
            attacking: { point: 0, caught: 0, short: 0, frame: 0, footing: 0, landed: 0, badPass: 0, dropPass: 0 },
            defending: { first: 0, second: 0, drop: 0, gap: 0, dig: 0 },
          };
        }
        // Make sure existing stats are correctly referenced and updated
        players[player.name].attacking = sumAttackingStats(players[player.name].attacking, player.attacking);
        players[player.name].defending = sumDefendingStats(players[player.name].defending, player.defending);
      });
    };
  
    // Process each third
    [first, second, third]?.forEach(third => processThird(third));
  
    // Calculate attacking and defending percentages
    Object.values(players).forEach(player => {
      const { point, caught, short, frame, footing, landed } = player.attacking;
      const { first, second, drop, gap, dig } = player.defending;
  
      // Combined attacking mistakes (sum of all non-point stats)
      const combinedMistakes = caught + short + frame + footing + landed;
  
      // Attacking percentage calculation (corrected)
      player.attackingPercentage = combinedMistakes > 0 ? (point / (combinedMistakes + point)) * 100 : 0;
  
      // Defending percentage calculation (corrected)
      const defendingEfforts = first + second + dig;
      const combinedDefenseMistakes = drop + gap;
  
      player.defendingPercentage = (defendingEfforts + combinedDefenseMistakes) > 0 
        ? (defendingEfforts / (defendingEfforts + combinedDefenseMistakes)) * 100 
        : 0;
    });
  
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
