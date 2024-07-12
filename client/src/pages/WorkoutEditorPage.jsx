import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import { useAuth } from '../context/AuthContext'
import {
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Box
} from '@mui/material';

export default function WorkoutEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, isLoggedIn } = useAuth();

  // Render a message if the user is not logged in
  if (!isLoggedIn) {
    return (
      <Container>
        <Box sx={{ width: '100%', textAlign: 'center', mt: 5 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            You are currently logged out, please log in to edit/create workouts
          </Typography>
        </Box>
      </Container>
    );
  }

  // Extract workoutId from query params
  const searchParams = new URLSearchParams(location.search);
  const workoutId = searchParams.get('workoutId');

  // State variables for form fields
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([{ exerciseName: '', sets: '', reps: '', targetWeight: '' }]);
  const [workoutData, setWorkoutData] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);

  // Function to add a new exercise field
  const handleAddExercise = () => {
    setExercises([...exercises, { exerciseName: '', sets: '', reps: '', targetWeight: '' }]);
  };

  // Function to handle changes in exercise fields
  const handleExerciseChange = (event, index, field) => {
    const newExercises = [...exercises];
    newExercises[index][field] = event.target.value;
    setExercises(newExercises);
  };

  // Function to delete an exercise field
  const handleDeleteExercise = (index) => {
    if (index > 0) {
      const newExercises = [...exercises];
      newExercises.splice(index, 1);
      setExercises(newExercises);
    }
  };

// Function to apply changes to the workout
const handleApplyChanges = async () => {
  try {
    // Check for empty fields
    if (!workoutName || exercises.some(exercise => !exercise.exerciseName || !exercise.sets || !exercise.reps || !exercise.targetWeight)) {
      alert('Please fill in all fields.');
      return;
    }

    // Validate numeric fields
    if (exercises.some(exercise => isNaN(parseInt(exercise.sets)) || parseInt(exercise.sets) < 1 || parseInt(exercise.sets) > 10 || isNaN(parseInt(exercise.reps)) || parseInt(exercise.reps) < 1 || parseInt(exercise.reps) > 50 || isNaN(parseInt(exercise.targetWeight)) || parseInt(exercise.targetWeight) < 1)) {
      alert('Please enter valid values for sets (1-10), reps (1-50). All numbers must also be < 1.');
      return;
    }

    // Fetch user data
    const user_response = await fetch(`/api/getCollection?collection=users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const userData = await user_response.json();
    const user = userData.find(user => user.email === email);
    const userId = user ? user._id : null;

    // Refine exercises data
    const refinedExercises = await Promise.all(exercises.map(async (exercise) => {
      if (!exercise.exerciseId) {
        const matchingExercise = exerciseData.find((ex) => ex.exerciseName === exercise.exerciseName);
        if (!matchingExercise) {
          throw new Error(`Exercise with name ${exercise.exerciseName} not found`);
        }
        const refinedExercise = { ...exercise };
        refinedExercise.exerciseId = matchingExercise._id;
        delete refinedExercise.exerciseName;
        return refinedExercise;
      }
      if (exercise.exerciseName) {
        delete exercise.exerciseName
      }
      return { ...exercise };
    }));

    // Prepare request body
    const requestBody = {
      workoutName,
      exercises: refinedExercises,
      userId: userId
    };

    let response;
    if (workoutId) {
      // Update workout
      response = await fetch(`/api/updateDocument?collection=workouts&docId=${workoutId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(requestBody),
      });
    } else {
      // Create new workout
      response = await fetch(`/api/insertDocument?collection=workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(requestBody),
      });
    }
    if (response.status === 200) {
      alert(workoutId ? `Workout '${workoutName}' updated successfully` : `Workout '${workoutName}' created successfully`);
      navigate("/dashboard/workouts")
    }
  } catch (error) {
    console.error('Error applying changes:', error);
  }
};

  // Fetch workout and exercise data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workoutsResponse, exercisesResponse] = await Promise.all([
          fetch(`/api/getCollection?collection=workouts`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
          fetch(`/api/getCollection?collection=exercises`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
        ]);

        if (!workoutsResponse.ok || !exercisesResponse.ok) {
          throw new Error(`Failed to fetch data`);
        }

        const dataWorkouts = await workoutsResponse.json();
        const dataExercises = await exercisesResponse.json();

        const enhancedWorkouts = dataWorkouts.map(workout => {
          const enhancedExercises = workout.exercises.map(exercise => {
            const correspondingExercise = dataExercises.find(ex => ex._id === exercise.exerciseId);
            if (correspondingExercise) {
              return {
                ...exercise,
                exerciseName: correspondingExercise.exerciseName,
              };
            }
            return exercise;
          });

          return {
            ...workout,
            exercises: enhancedExercises,
          };
        });

        setWorkoutData(enhancedWorkouts);
        setExerciseData(dataExercises);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Populate form fields if editing existing workout
  useEffect(() => {
    if (workoutId && workoutData.length > 0) {
      const foundWorkout = workoutData.find((workout) => workout._id === workoutId);
      if (foundWorkout) {
        setWorkoutName(foundWorkout.workoutName);
        setExercises(foundWorkout.exercises);
      }
    }
  }, [workoutId, workoutData]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {workoutId ? `Edit Workout - ${workoutName}` : 'New Workout'}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            label="Workout Name"
            variant="outlined"
            fullWidth
            value={workoutName}
            onChange={(event) => setWorkoutName(event.target.value)}
            inputProps={{ "data-testid": "workout-name-input" }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Exercises
          </Typography>
          {exercises.map((exercise, index) => (
            <Grid key={index} container spacing={2} mt={2}>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel required>Exercise</InputLabel>
                  <Select
                    required
                    value={exercise.exerciseName}
                    inputProps={{ "data-testid": "exercise-dropdown-" + index}}
                    onChange={(event) => handleExerciseChange(event, index, 'exerciseName')}
                  >
                    <MenuItem value="">None</MenuItem>
                    {exerciseData.map((exerciseDataItem) => (
                      <MenuItem key={exerciseDataItem._id} value={exerciseDataItem.exerciseName}>
                        {exerciseDataItem.exerciseName.toString()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2}>
                <TextField
                  required
                  label="Sets (1 - 10)"
                  variant="outlined"
                  fullWidth
                  type="number"
                  inputProps={{ min: 1, max: 10, "data-testid": "sets-input-" + index}}
                  value={exercise.sets}
                  onChange={(event) => handleExerciseChange(event, index, 'sets')}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  required
                  label="Reps (1 - 50)"
                  variant="outlined"
                  fullWidth
                  type="number"
                  inputProps={{ min: 1, max: 50,  "data-testid": "reps-input-" + index}}
                  value={exercise.reps}
                  onChange={(event) => handleExerciseChange(event, index, 'reps')}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  required
                  label="Target Weight (kg)"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={exercise.targetWeight}
                  inputProps={{ "data-testid": "weight-input-" + index}}
                  onChange={(event) => handleExerciseChange(event, index, 'targetWeight')}
                />
              </Grid>
              {index > 0 && (
                <Grid item xs={2}>
                  <Button variant="outlined" color="error" style={{ height: '100%' }} inputProps={{ "data-testid": "delete-exercise-" + index}} onClick={() => handleDeleteExercise(index)}>
                    Delete Exercise
                  </Button>
                </Grid>
              )}
            </Grid>
          ))}
        </Grid>
        <Grid container justifyContent="center" mt={2}>
          <Grid item>
            <Button variant="contained" color="secondary" size="large" sx={{ width: '300px', marginBottom: '40px' }} inputProps={{ "data-testid": "add-exercise"}} onClick={handleAddExercise}>
              Add Exercise
            </Button>
          </Grid>
        </Grid>
        <Grid container justifyContent="center" mt={2}>
          <Grid item>
            <Button variant="contained" color="primary" size="large" sx={{ width: '300px' }} onClick={handleApplyChanges}>
              {workoutId ? 'Apply Changes' : 'Create Workout'}
            </Button>
          </Grid>
        </Grid>
        <Grid container justifyContent="center" mt={2}>
          <Grid item>
            <Button component={Link} to="/dashboard/workouts" variant="contained" sx={{ width: '300px' }} color="error" size="large">
              Cancel and Return to Workouts
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
