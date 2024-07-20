import React from "react";
import PropTypes from "prop-types";
// import { Button, Grid, Paper, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { selectSpreadsheetById } from "../store/slices/spreadsheetsSlice";
import { Table, TableBody, TableCell, TableRow, TableContainer, Paper, Typography } from "@mui/material";

function Spreadsheet({ id, setSelected }) {
  //const spreadsheet = useSelector((state) => selectSpreadsheetById(state, id));
  const spreadsheet = {
    players: [
      {
        name: "Alice Johnson",
        attacking: { point: 3, caught: 5, short: 2, mistake: 1 },
        defending: { first: 4, second: 3, drop: 2, gap: 1 }
      },
      {
        name: "Bob Smith",
        attacking: { point: 4, caught: 4, short: 1, mistake: 2 },
        defending: { first: 2, second: 6, drop: 3, gap: 0 }
      },
      {
        name: "Charlie Davis",
        attacking: { point: 2, caught: 3, short: 3, mistake: 0 },
        defending: { first: 5, second: 1, drop: 1, gap: 4 }
      },
      {
        name: "Diana Ross",
        attacking: { point: 5, caught: 2, short: 4, mistake: 3 },
        defending: { first: 3, second: 5, drop: 2, gap: 2 }
      }
    ]
  };  
  
  if (!spreadsheet) {
    return <Typography>No Spreadsheet data available.</Typography>;
  }

  const formatStats = (stats) => {
    return `${stats.point} Point, ${stats.caught} Caught, ${stats.short} Short, ${stats.mistake} Mistake`;
  };

  const formatDefense = (stats) => {
    return `${stats.first} 1st, ${stats.second} 2nd, ${stats.drop} Drop, ${stats.gap} Gap`;
  };

  return (
    // <Paper sx={{ margin: 2, padding: 2 }}>
    //   <Grid container spacing={2}>
    //     {spreadsheet.players.map((player, index) => (
    //       <React.Fragment key={index}>
    //         <Grid item xs={12}>
    //           <Button sx={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => setSelected(player.name)}>
    //             {player.name}
    //           </Button>
    //         </Grid>
    //         <Grid item xs={2} sx={{ paddingLeft: 4 }}>
    //           <Typography variant="subtitle1">Attacking</Typography>
    //         </Grid>
    //         <Grid item xs={10}>
    //           <Typography>{player.attacking}</Typography>
    //         </Grid>
    //         <Grid item xs={2} sx={{ paddingLeft: 4 }}>
    //           <Typography variant="subtitle1">Defending</Typography>
    //         </Grid>
    //         <Grid item xs={10}>
    //           <Typography>{player.defending}</Typography>
    //         </Grid>
    //       </React.Fragment>
    //     ))}
    //   </Grid>
    // </Paper>

<TableContainer component={Paper} sx={{ maxWidth: 850, margin: 'auto', marginTop: 4 }}>
      <Table aria-label="Player Stats Table">
        <TableBody>
          {spreadsheet.players.map((player) => (
            <React.Fragment key={player.name}>
              <TableRow hover onClick={() => setSelected(player.name)}>
                <TableCell component="th" scope="row" rowSpan={2} sx={{ verticalAlign: 'top' }}>
                  <Typography variant="h6">{player.name}</Typography>
                </TableCell>
                <TableCell align="left">
                  <strong>Attacking:</strong> {formatStats(player.attacking)}
                </TableCell>
              </TableRow>
              <TableRow hover onClick={() => setSelected(player.name)}>
                <TableCell align="left">
                  <strong>Defending:</strong> {formatDefense(player.defending)}
                </TableCell>
              </TableRow>
            </React.Fragment>
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
