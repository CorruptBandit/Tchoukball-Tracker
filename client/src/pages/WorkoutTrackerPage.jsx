import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'
import {
  Button,
  Container,
  Typography,
  Grid,
  TextField,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
  Paper,
  Box
} from '@mui/material';

export default function WorkoutTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, isLoggedIn } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const workoutId = searchParams.get('workoutId')

  // Returning early if the user is not logged in or workout ID is missing
  if (!isLoggedIn || !workoutId) {
    return (
      <Container>
        <Box sx={{ width: '100%', textAlign: 'center', mt: 5 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            You are either currently logged out or there is no workout ID, please log in or use the track button next to each workout, to track a workout
          </Typography>
        </Box>
      </Container>
    );
  }

  // State variables for form fields
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [workoutData, setWorkoutData] = useState([]);

  // Effect hook to fetch data on component mount
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
                repsDone: Array.from({ length: Number(exercise.sets) }, () => ''),
                weightDone: Array.from({ length: Number(exercise.sets) }, () => ''),
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
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Effect hook to update workout details when workoutId or workoutData changes
  useEffect(() => {
    if (workoutId && workoutData.length > 0) {
      const foundWorkout = workoutData.find((workout) => workout._id === workoutId);
      if (foundWorkout) {
        setWorkoutName(foundWorkout.workoutName);
        setExercises(foundWorkout.exercises);
      }
    }
  }, [workoutId, workoutData]);

const handleLogWorkout = async () => {
  // Check if any field is empty or negative
  const invalidInput = exercises.some((exercise) => {
    return exercise.repsDone.some(rep => rep === '') ||
           exercise.weightDone.some(weight => weight === '') ||
           exercise.repsDone.some(rep => Number(rep) <= 0) ||
           exercise.weightDone.some(weight => Number(weight) <= 0) ||
           exercise.nextTargetWeight === '' ||
           Number(exercise.nextTargetWeight) <= 0;
  });

  if (invalidInput) {
    alert('Please fill out all fields with positive numbers before logging the workout.');
    return;
  }

  try {
    const user_response = await fetch(`/api/getCollection?collection=users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const userData = await user_response.json();
    const user = userData.find(user => user.email === email);
    const userId = user ? user._id : null;

    const requestBody = {
      workoutId,
      workoutName,
      userId: userId,
      date: currentDate,
      logs: exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        targetReps: exercise.reps,
        targetWeight: exercise.targetWeight,
        nextTargetWeight: exercise.nextTargetWeight,
        logs: exercise.repsDone.map((reps, index) => ({
          repsDone: reps,
          weightDone: exercise.weightDone[index],
        })),
      })),
    };
    let response;

    // Create new workout
    response = await fetch(`/api/insertDocument?collection=workoutHistory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Failed to log workout');
    }

    // Update the workout with the new target weight
    const workoutToUpdate = workoutData.find(workout => workout._id === workoutId);
    const updatedExercisesWithTargetWeight = workoutToUpdate.exercises.map(({ ...exercise }) => ({
      ...exercise,
      targetWeight: exercise.nextTargetWeight,
    }));
    // eslint-disable-next-line no-unused-vars
    const updatedExercises = updatedExercisesWithTargetWeight.map(({ exerciseName, repsDone, weightDone, ...exercise }) => exercise);

    // eslint-disable-next-line no-unused-vars
    const { _id, ...updatedWorkoutWithoutId } = workoutToUpdate;
    const updatedWorkout = {
      ...updatedWorkoutWithoutId,
      exercises: updatedExercises,
    };

    const updateResponse = await fetch(`/api/updateDocument?collection=workouts&docId=${workoutId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updatedWorkout),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update workout');
    }

    // Alert and redirect after successful logging
    alert(`Workout '${workoutName}' logged successfully`);
    navigate('/dashboard/workouts');
  } catch (error) {
    console.error('Error logging workout:', error);
  }
};


  // Get current date
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {workoutName && `Track Workout ${workoutName} - ${formattedDate}`}
      </Typography>

      <Grid container spacing={2} mt={2}>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6">
                      Exercise
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">
                      Targets
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">
                      Sets
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">
                      Next Target Weight (kg)
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exercises.map((exercise, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="subtitle1">
                        {exercise.exerciseName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1">
                        {"Target Reps: " + exercise.reps}
                      </Typography>

                      <Typography variant="subtitle1">
                        {"Target Weight: " + exercise.targetWeight + "kg"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {[...Array(Number(exercise.sets))].map((_, setIndex) => (
                        <div key={setIndex} style={{ paddingTop: '10px' }}>
                          <Typography variant="subtitle1">
                            Set {setIndex + 1}
                          </Typography>
                          <TextField
                            style={{ marginRight: "10px" }}
                            required
                            label={`Reps Done`}
                            type="number"
                            variant="outlined"
                            value={exercise.repsDone[setIndex]}
                            inputProps={{ "data-testid": "reps-input-" + index + "-" + setIndex}}
                            onChange={(e) => {
                              const updatedExercises = [...exercises];
                              updatedExercises[index].repsDone[setIndex] = e.target.value;
                              setExercises(updatedExercises);
                            }}
                          />
                          <TextField
                            required
                            label={`Weight Done (kg)`}
                            type="number"
                            variant="outlined"
                            value={exercise.weightDone[setIndex]}
                            inputProps={{ "data-testid": "weight-input-" + index + "-" + setIndex}}
                            onChange={(e) => {
                              const updatedExercises = [...exercises];
                              updatedExercises[index].weightDone[setIndex] = e.target.value;
                              setExercises(updatedExercises);
                            }}
                          />
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <TextField
                        required
                        label={"Next Target Weight (kg)"}
                        type="number"
                        variant="outlined"
                        value={exercise.nextTargetWeight}
                        inputProps={{ "data-testid": "target-input-" + index}}
                        onChange={(e) => {
                          const updatedExercises = [...exercises];
                          updatedExercises[index].nextTargetWeight = e.target.value;
                          setExercises(updatedExercises);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      <Grid container justifyContent="center" mt={2}>
        <Grid item>
          <Button onClick={handleLogWorkout} variant="contained" color="primary" size="large" sx={{ width: '300px' }}>
            Log Workout
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
    </Container>
  );
}
