import {
  Container,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";
import PropTypes from "prop-types";

const MatchOverview = ({ matchData }) => {
  // Function to calculate total stats across all thirds
  const calculateTotalStats = (players) => {
    return players.reduce((acc, player) => {
      ['attacking', 'defending'].forEach(category => {
        Object.keys(player[category]).forEach(stat => {
          const key = `${category}_${stat}`;
          acc[key] = (acc[key] || 0) + player[category][stat];
        });
      });
      return acc;
    }, {});
  };

  // Calculate total stats for each player if players exist
  const playerStats = matchData.players && matchData.players.length > 0
    ? calculateTotalStats(matchData.players)
    : {};

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" component="h1" align="center" sx={{ py: 2 }}>
        {matchData.name || "No Match Data Found"}
      </Typography>

      {!matchData || Object.keys(matchData).length === 0 ? (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          No Data Found
        </Typography>
      ) : (
        <div>
          {matchData.players && matchData.players.length > 0 ? (
            <Grid item xs={14} sx={{pb: 3}}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>PLAYER</TableCell>
                      <TableCell align="right">ATTACK %</TableCell> {/* New Column */}
                      <TableCell align="right">DEFEND %</TableCell> {/* New Column */}
                      {Object.keys(playerStats).map(stat => (
                        <TableCell key={stat} align="right">
                          {stat.split('_')[1].toLocaleUpperCase()}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {matchData.players.map(player => (
                      <TableRow key={player.name}>
                        <TableCell component="th" scope="row">
                          {player.name}
                        </TableCell>
                        <TableCell align="right">
                          {player.attackingPercentage.toFixed(2)}%
                        </TableCell> {/* Display Attack % */}
                        <TableCell align="right">
                          {player.defendingPercentage.toFixed(2)}%
                        </TableCell> {/* Display Defend % */}
                        {Object.keys(playerStats).map(stat => {
                          const [category, substat] = stat.split('_');
                          return (
                            <TableCell key={stat} align="right">
                              {player[category][substat]}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          ) : null}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Match Total Stats
              </Typography>
              <Grid container spacing={2}>
                {Object.keys(playerStats).length > 0 ? (
                  Object.entries(playerStats).map(([stat, value]) => (
                    <Grid item xs={6} sm={3} key={stat}>
                      <Box textAlign="center">
                        <Typography variant="h6">{value}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {stat.split('_')[1].toLocaleUpperCase()}
                        </Typography>
                      </Box>
                    </Grid>
                  ))
                ) : (
                  <Typography variant="body1" align="center" sx={{ width: "100%" }}>
                    No Players Found
                  </Typography>
                )}
              </Grid>
            </Paper>
          </Grid>
        </div>
      )}
    </Container>
  );
};

MatchOverview.propTypes = {
  matchData: PropTypes.shape({
    name: PropTypes.string,
    players: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      attacking: PropTypes.object.isRequired,
      defending: PropTypes.object.isRequired,
      attackingPercentage: PropTypes.number.isRequired, // Ensure these are in the shape
      defendingPercentage: PropTypes.number.isRequired, // Ensure these are in the shape
    }))
  })
};

export default MatchOverview;
