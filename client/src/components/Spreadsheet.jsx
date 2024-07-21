import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSpreadsheetById,
  selectSpreadsheetById,
} from "../store/slices/spreadsheetsSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Typography,
  TableHead,
} from "@mui/material";

function Spreadsheet({ id, setSelected }) {
  const dispatch = useDispatch();
  const [selectedPlayer, setSelectedPlayer] = useState();
  const spreadsheetStatus = useSelector((state) => state.spreadsheets.status);

  const spreadsheet = {
    players: [
      {
        name: "Alice Johnson",
        attacking: { point: 3, caught: 5, short: 2, mistake: 1 },
        defending: { first: 4, second: 3, drop: 2, gap: 1 },
      },
      {
        name: "Bob Smith",
        attacking: { point: 4, caught: 4, short: 1, mistake: 2 },
        defending: { first: 2, second: 6, drop: 3, gap: 0 },
      },
      {
        name: "Charlie Davis",
        attacking: { point: 2, caught: 3, short: 3, mistake: 0 },
        defending: { first: 5, second: 1, drop: 1, gap: 4 },
      },
      {
        name: "Diana Ross",
        attacking: { point: 5, caught: 2, short: 4, mistake: 3 },
        defending: { first: 3, second: 5, drop: 2, gap: 2 },
      },
    ],
  };

  useEffect(() => {
    if (spreadsheetStatus === "idle" && !spreadsheet) {
      dispatch(fetchSpreadsheetById({ id }));
    }
  }, [id, spreadsheet, spreadsheetStatus, dispatch]);

  if (!spreadsheet) {
    return (
      <Paper>
        <Typography>No Spreadsheet data available.</Typography>
      </Paper>
    );
  }

  const formatStats = (stats) => {
    return (
      <div>
        Points: {stats.point}, Caught: {stats.caught}, Short: {stats.short}, Mistake: {stats.mistake}
      </div>
    );
  };

  const formatDefense = (stats) => {
    return (
      <div>
        1st Line: {stats.first}, 2nd Line: {stats.second}, Drop: {stats.drop}, Gap: {stats.gap}
      </div>
    );
  };

  const select = (value) => {
    setSelectedPlayer(value);
    setSelected(value);
  };

  return (
    <TableContainer component={Paper} sx={{ width: "100%", marginTop: 4 }}>
      <Table aria-label="Player Stats Table">
        <TableHead>
          <TableRow>
            <TableCell><Typography variant="h6">Player</Typography></TableCell>
            <TableCell><Typography variant="h6">Attacking</Typography></TableCell>
            <TableCell><Typography variant="h6">Defending</Typography></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {spreadsheet.players.map((player, index) => (
            <TableRow
              key={player.name}
              hover
              onClick={() => select(player.name)}
              selected={selectedPlayer === player.name}
              sx={{
                backgroundColor: selectedPlayer === player.name ? 'lightblue' : index % 2 === 0 ? 'white' : '#f5f5f5',
              }}
            >
              <TableCell component="th" scope="row" sx={{ verticalAlign: "top" }}>
                <Typography>{player.name}</Typography>
              </TableCell>
              <TableCell align="left">
                {formatStats(player.attacking)}
              </TableCell>
              <TableCell align="left">
                {formatDefense(player.defending)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

Spreadsheet.propTypes = {
  id: PropTypes.string.isRequired,
  setSelected: PropTypes.func.isRequired,
  selectedPlayer: PropTypes.string,
};

export default Spreadsheet;
