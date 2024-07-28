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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDistanceToNow } from "date-fns";
import { selectAllMatches, fetchMatches, deleteMatch } from "../store/slices/matchesSlice";

const MatchesView = () => {
  const dispatch = useDispatch();
  const matches = useSelector(selectAllMatches);
  const matchStatus = useSelector(state => state.matches.status);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const itemsPerPage = 3;

  useEffect(() => {
    if (matchStatus === "idle") {
      dispatch(fetchMatches());
    }
  }, [matchStatus, dispatch]);

  const handleDeleteClick = (matchId) => {
    setSelectedMatchId(matchId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMatchId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedMatchId) {
      dispatch(deleteMatch({ id: selectedMatchId }));
    }
    handleCloseDialog();
  };

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
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2, position: 'relative' }}>
                <IconButton
                  onClick={() => handleDeleteClick(match.id)}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <DeleteIcon />
                </IconButton>
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
                  <Grid item xs={12}>
                    <Button
                      component={RouterLink}
                      to={`/match/${match.id}/overview`}
                      variant="contained"
                      fullWidth
                      sx={{ py: 1 }}
                    >
                      OVERVIEW
                    </Button>
                  </Grid>
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
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-delete-dialog"
      >
        <DialogTitle id="confirm-delete-dialog">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this match?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MatchesView;
