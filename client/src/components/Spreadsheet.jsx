import { useEffect, useState } from "react";
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
  const spreadsheet = useSelector((state) => selectSpreadsheetById(state, id));
  const spreadsheetStatus = useSelector((state) => state.spreadsheets.status);

  useEffect(() => {
    if (spreadsheetStatus === "idle" && !spreadsheet) {
      dispatch(fetchSpreadsheetById({ id }));
      setSelectedPlayer("");
    }
  }, [id, spreadsheet, spreadsheetStatus, dispatch]);

  if (!spreadsheet) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Typography>No Spreadsheet data available.</Typography>
      </div>
    );
  }

  const formatStats = (stats) => {
    return (
      <div>
        Points: {stats.point || 0}, Caught: {stats.caught || 0}, Short: {stats.short || 0},
        Mistake: {stats.mistake || 0}
      </div>
    );
  };

  const formatDefense = (stats) => {
    return (
      <div>
        1st Line: {stats.first || 0}, 2nd Line: {stats.second || 0}, Drop: {stats.drop || 0},
        Gap: {stats.gap || 0}
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
            <TableCell>
              <Typography variant="h6">Player</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h6">Attacking</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h6">Defending</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {spreadsheet.players?.map((player, index) => (
            <TableRow
              key={player.name}
              hover
              onClick={() => select(player.name)}
              selected={selectedPlayer === player.name}
              sx={{
                backgroundColor:
                  selectedPlayer === player.name
                    ? "lightblue"
                    : index % 2 === 0
                    ? "white"
                    : "#f5f5f5",
              }}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{ verticalAlign: "top" }}
              >
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
};

export default Spreadsheet;
