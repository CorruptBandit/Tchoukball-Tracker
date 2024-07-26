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

const MatchOverview = () => {
  const exampleMatch = {
    name: "Championship Finals",
    players: [
      {
        name: "Ollie",
        stats: {
          third1: { points: 2, caught: 1, short: 0, mistake: 1 },
          third2: { points: 3, caught: 2, short: 1, mistake: 0 },
          third3: { points: 1, caught: 3, short: 0, mistake: 1 },
        },
      },
      {
        name: "Andrew",
        stats: {
          third1: { points: 1, caught: 2, short: 1, mistake: 1 },
          third2: { points: 4, caught: 3, short: 0, mistake: 0 },
          third3: { points: 2, caught: 2, short: 1, mistake: 0 },
        },
      },
    ],
  };

  // Function to calculate total stats across all thirds
  const calculateTotalStats = (playerStats) => {
    return Object.keys(playerStats).reduce((total, third) => {
      Object.keys(playerStats[third]).forEach((stat) => {
        total[stat] = (total[stat] || 0) + playerStats[third][stat];
      });
      return total;
    }, {});
  };

  // Calculate total stats for each player
  const playerTotalStats = exampleMatch.players.reduce((acc, player) => {
    acc[player.name] = calculateTotalStats(player.stats);
    return acc;
  }, {});

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" component="h1" align="center" sx={{py: 2}}>
        {exampleMatch.name}
      </Typography>

      <Grid container spacing={4}>
        {/* Match Total Stats */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Match Total Stats
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(calculateTotalStats(playerTotalStats)).map(
                ([stat, value]) => (
                  <Grid item xs={6} sm={3} key={stat}>
                    <Box textAlign="center">
                      <Typography variant="h6">{value}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {stat.charAt(0).toUpperCase() + stat.slice(1)}
                      </Typography>
                    </Box>
                  </Grid>
                )
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Player Stats */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Player</TableCell>
                  {Object.keys(calculateTotalStats(playerTotalStats)).map(
                    (stat) => (
                      <TableCell key={stat} align="right">
                        {stat.charAt(0).toUpperCase() + stat.slice(1)}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(playerTotalStats).map(([playerName, stats]) => (
                  <TableRow key={playerName}>
                    <TableCell component="th" scope="row">
                      {playerName}
                    </TableCell>
                    {Object.entries(calculateTotalStats(playerTotalStats)).map(
                      ([stat]) => (
                        <TableCell key={stat} align="right">
                          {stats[stat] || 0}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MatchOverview;
