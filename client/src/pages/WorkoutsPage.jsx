import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'

// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Button,
  Popover,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Box
} from '@mui/material';

// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';

// sections
import { WorkoutListHead, WorkoutListToolbar } from '../sections/@dashboard/workout';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'workoutName', label: 'Workout Name', alignRight: false},
  { id: 'exercises', label: 'Exercises', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

// Helper function for sorting in descending order
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// Returns a comparison function based on the order and orderBy values
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Sorts the array, applies the search filter if provided, and returns the result
function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_workout) => _workout.workoutName.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function WorkoutsPage() {
  const { email, isLoggedIn } = useAuth();

  // If user is not logged in, display a message prompting to log in
  if (!isLoggedIn) {
    return (
      <Container>
        <Box sx={{ width: '100%', textAlign: 'center', mt: 5 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            You are currently logged out, please log in to view and manage workouts
          </Typography>
        </Box>
      </Container>
    );
  }

  const [open, setOpen] = useState(null);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('workoutName');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [workoutId, setWorkoutId] = useState(null);
  const [workoutData, setWorkoutData] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);

  // Fetches workout and exercise data from the API
  const fetchData = async (collection) => {
    try {
       const response = await fetch(`/api/getCollection?collection=${collection}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${collection}`);
      }
      const data = await response.json();

      if (collection === 'workouts') {
        const user_response = await fetch(`/api/getCollection?collection=users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const userData = await user_response.json();
        const user = userData.find(user => user.email === email);
        const userId = user ? user._id : null;
        const userWorkouts = data.filter(workout => workout.userId === userId);
        const mappedData = userWorkouts.map((item) => ({ ...item, workoutId: item._id }));
        setWorkoutData(mappedData);
      } else if (collection === 'exercises') {
        setExerciseData(data);
      }
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error);
    }
  };

  // Fetch workout and exercise data when component mounts
  useEffect(() => {
    fetchData('workouts');
    fetchData('exercises');
  }, []);

  // Opens the menu for a specific workout
  const handleOpenMenu = (event, workoutId) => {
    setWorkoutId(workoutId);
    setOpen(event.currentTarget);
  };

  // Closes the menu
  const handleCloseMenu = () => {
    setOpen(null);
  };

  // Deletes a workout
  const handleDeleteWorkout = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this workout?');

    if (confirmed) {
      try {
        const response = await fetch(`/api/deleteDocument?collection=workouts&docId=${workoutId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to delete workout');
        }

        fetchData('workouts');
      } catch (error) {
        console.error('Error deleting workout:', error);
      } finally {
        handleCloseMenu();
      }
    } else {
      handleCloseMenu();
    }
  };

  // Fetch workout data when a workout is deleted
  useEffect(() => {
    fetchData('workouts');
  }, [workoutData, workoutId]);

  // Handles sorting by column
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handles selecting all workouts
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = workoutData.map((n) => n.workoutName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };


  // Handles changing pagination page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handles changing number of rows per page
  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  // Handles filtering workouts by name
  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  // Calculates the number of empty rows to display
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - workoutData.length) : 0;

  // Applies sorting and filtering to workouts
  const filteredWorkouts = applySortFilter(workoutData, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredWorkouts.length && !!filterName;

  // Formats exercises with exercise names instead of IDs
  const formatExercises = (exercises) => {
    return exercises.map((exercise) => {
      // Find the exercise object with matching _id
      const foundExercise = exerciseData.find((ex) => ex._id === exercise.exerciseId);
      return (
        <div key={exercise.exerciseId}>
          {foundExercise?.exerciseName}: {exercise.sets} sets x {exercise.reps} reps @ {exercise.targetWeight}kg
        </div>
      );
    });
  };

  return (
    <>
      <Helmet>
        <title>Workouts</title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Workouts
          </Typography>
          <Button component={Link} to="/dashboard/workout-editor" variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            New Workout
          </Button>
        </Stack>

        <Card>
          <WorkoutListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 600 }}>
              <Table>
                <WorkoutListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={workoutData.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredWorkouts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { workoutId, workoutName, exercises } = row;
                    const selectedWorkout = selected.indexOf(workoutName) !== -1;

                    return (
                      <TableRow hover key={workoutId} tabIndex={-1} selected={selectedWorkout}>
                        <TableCell component="th" scope="row">
                          <Typography variant="subtitle2" gutterBottom>
                            {workoutName}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography variant="subtitle2" gutterBottom>
                          {formatExercises(exercises)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick={(event) => handleOpenMenu(event, workoutId)}>
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={workoutData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem component={Link} to={`/dashboard/workout-tracker?workoutId=${workoutId}`}>
          <Iconify icon={'eva:pin-outline'} sx={{ mr: 2 }} />
          Track
        </MenuItem>

        <MenuItem component={Link} to={`/dashboard/workout-editor?workoutId=${workoutId}`}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }} onClick={handleDeleteWorkout}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}
