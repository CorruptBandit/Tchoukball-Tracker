import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Container,
  TextField,
  Pagination,
  CssBaseline,
  Card
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { selectAllMatches, fetchMatches } from "../store/slices/matchesSlice";

const MatchesView = () => {
  const dispatch = useDispatch();
  const matches = useSelector(selectAllMatches);
  const matchStatus = useSelector(state => state.matches.status);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    if (matchStatus === "idle") {
      dispatch(fetchMatches());
    }
  }, [matchStatus, dispatch]);

  // Sorting and filtering matches
  const filteredMatches = matches
    .filter(match => match.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Calculating the number of pages
  const pageCount = Math.ceil(filteredMatches.length / itemsPerPage);

  // Slice matches for current page
  const matchesToShow = filteredMatches.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Matches
          </Typography>
          <Button
            component={RouterLink}
            to="/create-match"
            variant="contained"
            color="primary"
            size="large"
          >
            Create Match
          </Button>
        </Box>
        <TextField
          fullWidth
          label="Search Matches"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 4 }}
        />
        <Grid container spacing={3}>
          {matchesToShow.map((match) => (
            <Grid item xs={12} key={match.id}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {match.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Played on: {new Date(match.created_at).toLocaleDateString()} ({formatDistanceToNow(new Date(match.created_at), { addSuffix: true })})
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {Object.entries(match.thirds).map(([key], index) => (
                    <Grid item xs={4} key={key}>
                      <Button
                        component={RouterLink}
                        to={`/match/${match.id}/third/${index + 1}`}
                        variant="outlined"
                        fullWidth
                        sx={{ py: 1 }}
                      >
                        {key.toUpperCase()}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {filteredMatches.length === 0 && (
          <Typography variant="subtitle1" align="center" sx={{ mt: 4 }}>No matches found.</Typography>
        )}
        {pageCount > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>
      </>
  );
};

export default MatchesView;