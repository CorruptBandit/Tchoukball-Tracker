import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import {
  Typography,
  Paper,
  Grid,
  Button,
  Container,
  TextField,
  Pagination
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { selectAllMatches, fetchMatches } from "../store/slices/matchesSlice";

const MatchesView = () => {
  const dispatch = useDispatch();
  const matches = useSelector(selectAllMatches);
  const matchStatus = useSelector(state => state.matches.status);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

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
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Matches
      </Typography>
      <TextField
        fullWidth
        label="Search Matches"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
      />
      {matchesToShow.map((match) => (
        <Paper key={match.id} elevation={3} sx={{ margin: 2, padding: 2 }}>
          <Typography variant="h5" gutterBottom>
            {match.name}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Played on: {new Date(match.created_at).toLocaleDateString()} 
            {" "}({formatDistanceToNow(new Date(match.created_at), { addSuffix: true })})
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(match.thirds).map(([key, value]) => (
              <Grid item key={key} xs={4}>
                <Button
                  component={RouterLink}
                  to={`/match/${match.id}/third/${value}`}
                  variant="outlined"
                  sx={{ width: '100%' }}
                >
                  {key.toUpperCase()}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}
      {filteredMatches.length === 0 && (
        <Typography variant="subtitle1">No matches found.</Typography>
      )}
      {pageCount > 1 && (
        <Pagination
          count={pageCount}
          page={page}
          onChange={handlePageChange}
          sx={{ marginTop: 2, paddingBottom: 2 }}
          color="primary"
        />
      )}
    </Container>
  );
};

export default MatchesView;
