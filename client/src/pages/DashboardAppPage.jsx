import {Helmet} from 'react-helmet-async';
// @mui
import {useTheme} from '@mui/material/styles';
import {Box, Container, Grid, Typography} from '@mui/material';

// components
import AdminPage from './AdminPage';

// sections
import {
    AppCalorieBreakdown, AppDietaryTracking, AppExerciseTracking, AppGoals, AppWidgetSummary, AppWorkoutHistoryTimeline
} from '../sections/@dashboard/app';

import {useAuth} from '../context/AuthContext';
import {useEffect, useState} from "react";
import {FetchUserId, FetchCollection} from '../../src/sections/@dashboard/app/utils/index';


/**
 * DashboardAppPage component renders the main dashboard page for authenticated users.
 * It displays various sections of user data, including meals, exercise, goals, and more.
 * If the user is an admin, it redirects to the AdminPage component.
 * @returns {JSX.Element}
 */
export default function DashboardAppPage() {
    const theme = useTheme();
    const {email, name, isLoggedIn, isAdmin} = useAuth();
    const [dailyIntakeData, setDailyIntake] = useState([]);
    const [mostCommonMealType, setMostCommonMealType] = useState(null);
    const [calorieBreakdown, setCalorieBreakdown] = useState([]);
    const [exerciseTrackingLabels, setExerciseTrackingDataLabels] = useState([]);
    const [exerciseTrackingData, setExerciseTrackingData] = useState([]);
    const [mostCommonExerciseName, setMostCommonExerciseName] = useState('');
    const [workoutHistoryData, setWorkoutHistoryData] = useState([]);
    const [goals, setGoals] = useState([]);
    const [weightData, setWeightData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Function to filter data by user ID
    const filterDataByUserId = async (collection) => {
        try {
            const userId = await FetchUserId(email);
            const data = await FetchCollection(collection);

            return data.filter(item => item.userId === userId);

        } catch (error) {
            console.error(`Error fetching ${collection}:`, error);
            throw error;
        }
    };

    // Function to sum up calories in daily intake data
    const sumCalories = () => {
        return calorieBreakdown.reduce((total, item) => total + item.value, 0);
    };

    const fetchFood = async () => {
        try {
            const endDate = new Date();
            const startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 6);

            const data = await FetchCollection("food");
            const filteredData = data.filter(item => item.userEmail === email);

            const allTimeMealCounts = filteredData.reduce((counts, item) => {
                counts[item.mealType] = (counts[item.mealType] || 0) + 1;
                return counts;
            }, {});

            const allTimeMostCommonMealType = Object.keys(allTimeMealCounts).reduce((a, b) => allTimeMealCounts[a] > allTimeMealCounts[b] ? a : b, null);
            setMostCommonMealType(allTimeMostCommonMealType ? allTimeMostCommonMealType.charAt(0).toUpperCase() + allTimeMostCommonMealType.slice(1) : null);

            const currentDate = new Date().toISOString().slice(0, 10);
            const getDailyIntake = filteredData.filter(item => item.dateAdded === currentDate);

            setDailyIntake(getDailyIntake);
        } catch (error) {
            console.error('Error fetching food data:', error);
        }
    };

    const fetchWorkout = async (collection) => {
        try {
            const userId = await FetchUserId(email);

            const data = await FetchCollection(collection);
            const filteredData = data.filter(item => item.userId === userId);

            let mostCommonExercise = null;
            let maxCount = 0;
            const exerciseCounts = {};

            if (collection === 'workouts') {
                filteredData.forEach(item => {
                    item.exercises.forEach(exercise => {
                        const exerciseId = exercise.exerciseId;
                        exerciseCounts[exerciseId] = (exerciseCounts[exerciseId] || 0) + 1;
                        if (exerciseCounts[exerciseId] > maxCount) {
                            maxCount = exerciseCounts[exerciseId];
                            mostCommonExercise = exerciseId;
                        }
                    });
                });

                const exerciseData = await FetchCollection("exercises");
                const mostCommonExerciseData = exerciseData.find(exercise => exercise._id === mostCommonExercise);

                if (mostCommonExerciseData && mostCommonExerciseData.exerciseName) {
                    setMostCommonExerciseName(mostCommonExerciseData.exerciseName);
                } else {
                    setMostCommonExerciseName('N/A');
                }

            } else if (collection === 'workoutHistory') {
                setWorkoutHistoryData(filteredData);
            }

            return data;
        } catch (error) {
            console.error(`Error fetching ${collection}:`, error);
            throw error;
        }
    };

    const fetchWorkoutHistory = async () => {
        try {
            const response = await filterDataByUserId('workoutHistory');
            const exercisesMap = {};

            response.forEach(workout => {
                workout.logs.forEach(log => {
                    const exerciseId = log.exerciseId;
                    const date = new Date(workout.date).getTime();
                    const targetWeight = parseInt(log.targetWeight);

                    if (!exercisesMap[exerciseId]) {
                        exercisesMap[exerciseId] = {
                            exerciseName: exerciseId, data: [],
                        };
                    }
                    exercisesMap[exerciseId].data.push({x: date, y: targetWeight});
                });
            });

            const exerciseIds = Object.keys(exercisesMap);
            const exerciseData = await FetchCollection("exercises");

            exerciseData.forEach(exercise => {
                if (exerciseIds.includes(exercise._id)) {
                    exercisesMap[exercise._id].exerciseName = exercise.exerciseName;
                }
            });

            const chartData = Object.values(exercisesMap).map(exercise => ({
                name: exercise.exerciseName, data: exercise.data,
            }));
            const chartLabels = Object.keys(exercisesMap).map(exerciseId => exercisesMap[exerciseId].exerciseName);

            setExerciseTrackingData(chartData);
            setExerciseTrackingDataLabels(chartLabels);
        } catch (error) {
            console.error('Error fetching workout data:', error);
        }
    };

    const fetchGoals = async () => {
        try {
            const userId = await FetchUserId(email);

            const data = await FetchCollection("goals");

            if (data === null || !Array.isArray(data)) {
                setGoals([]);
                return;
            }

            const filteredData = data.filter(item => item.userId === userId);

            if (filteredData.length === 0) {
                setGoals([]);

            } else {
                const fetchedGoals = filteredData.map(item => ({
                    goalName: item.goalName, achieveByDate: item.achieveByDate,
                }));

                setGoals(fetchedGoals);
            }
        } catch (error) {
            console.error("Error fetching goals:", error);
            setGoals([]);
        }
    };


    const fetchWeight = async () => {
        try {
            const data = await FetchCollection("weight");

            const userWeightData = data.filter(item => item.userEmail === email);

            const aggregatedWeightData = userWeightData.reduce((accumulator, currentItem) => {
                const {dateAdded, weight} = currentItem;
                if (!accumulator[dateAdded]) {
                    accumulator[dateAdded] = {sum: 0, count: 0};
                }
                accumulator[dateAdded].sum += parseFloat(weight);
                accumulator[dateAdded].count++;
                return accumulator;
            }, {});

            const formattedWeightData = Object.entries(aggregatedWeightData).map(([date, {sum, count}]) => ({
                label: date, value: (sum / count).toFixed(2)
            }));

            setWeightData(formattedWeightData);
        } catch (error) {
            console.error('Error fetching food data:', error);
        }
    };

    // useEffect hook to calculate calorie breakdown when daily intake data changes
    useEffect(() => {
        if (dailyIntakeData.length > 0) {
            const calorieCounts = dailyIntakeData.reduce((counts, item) => {
                counts[item.mealType] = (counts[item.mealType] || 0) + parseInt(item.calories);
                return counts;
            }, {});

            const chartData = Object.entries(calorieCounts).map(([label, value]) => ({
                label, value
            }));
            setCalorieBreakdown(chartData);
        }
    }, [dailyIntakeData]);

    // useEffect hook to fetch data when component mounts or dependencies change
    useEffect(() => {
        Promise.all([fetchWorkout('workouts'), fetchWorkout('workoutHistory'), fetchFood(), fetchWeight(), fetchGoals(), fetchWorkoutHistory()])
            .then(() => {
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, [email, goals,]);

    // Conditional rendering based on isAdmin and isLoggedIn states
    if (isAdmin) {
        return <AdminPage/>;
    }

    return (<>
        <Helmet>
            <title> Meals & Movement </title>
        </Helmet>

        <Container maxWidth="xl" sx={{filter: isLoggedIn ? 'none' : 'grayscale(1)'}}>
            {isLoggedIn && (<Typography variant="h4" sx={{mb: 5}}>
                Hi, Welcome back {name}
            </Typography>)}

            <Grid container spacing={3}>
                {/* Conditional rendering based on isLoggedIn state */}
                {isLoggedIn ? (<>
                    <Grid item xs={12} sm={6} md={4}>
                        <AppWidgetSummary title="Favourite Meal"
                                          data={isLoading ? "Loading..." : mostCommonMealType || "N/A"} color="info"
                                          icon={'fluent-emoji-high-contrast:shallow-pan-of-food'}/>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <AppCalorieBreakdown
                            title="Daily Calorie Breakdown"
                            subheader={`Total Calories: ${sumCalories()}`}
                            chartData={calorieBreakdown}
                            chartColors={[theme.palette.primary.main, theme.palette.info.main, theme.palette.warning.main, theme.palette.success.main, theme.palette.error.main]}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <AppWidgetSummary title="Favourite Workout"
                                          data={isLoading ? "Loading..." : mostCommonExerciseName || "N/A"}
                                          color="success"
                                          icon={'icon-park-solid:weightlifting'}/>
                    </Grid>
                    <Grid item xs={12} md={6} lg={9}>
                        <AppExerciseTracking
                            title="Exercise Weight Progression Timeline"
                            subheader={`Timeline of ${name}'s Different Exercises`}
                            chartData={exerciseTrackingData}
                            chartLabels={exerciseTrackingLabels}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <AppWorkoutHistoryTimeline
                            title="Workout History"
                            subheader="Timeline of Workouts Completed"
                            list={workoutHistoryData.map((item) => ({
                                id: item._id, title: item.workoutName, type: 'workout', time: new Date(item.date),
                            }))}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={9}>
                        <AppDietaryTracking
                            title="Weight History"
                            subheader={`Timeline of ${name}'s Weight`}
                            chartData={weightData}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <AppGoals
                            title="Goals"
                            subheader="Your Goals Journey"
                            list={goals}
                        />
                    </Grid>
                </>) : (// Display a message or a login button when logged out
                    <Box sx={{width: '100%', textAlign: 'center', mt: 5}}>
                        <Typography variant="h5" sx={{mb: 2}}>
                            You are currently logged out
                        </Typography>
                    </Box>)}
            </Grid>
        </Container>
    </>)
}
