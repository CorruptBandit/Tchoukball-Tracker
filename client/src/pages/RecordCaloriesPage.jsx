import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import {
  Button,
  Container,
  Typography,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import Iconify from '../components/iconify';

export default function RecordCaloriesPage() {
  const { isLoggedIn, email } = useAuth(); // Retrieve isLoggedIn and email from useAuth
  const [setCalories] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 0,
    drinks: 0,
  });
  const [formData, setFormData] = useState({
    meal: 'breakfast',
    foodName: '',
    foodCalories: '',
  });
  const tableCellStyle = {
    textAlign: 'center',
    padding: '10px',
    borderBottom: '1px solid #ddd',
  };

  const [foodAdded, setFoodAdded] = useState(false); // State to track food addition success
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true); // State to track loading state
  const [error, setError] = useState(null); // State to track error

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const today = selectedDate.toISOString().split('T')[0];
        console.log('Fetching food items for date:', today);
        console.log('User email:', email);
        const response = await fetch(`/api/foodItemsByDate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dateAdded: today,
            userEmail: email,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Retrieved food items:', data.foodItems);
          setDashboardData(data.foodItems);
          setLoading(false);
        } else {
          console.error('Failed to fetch food items:', response.statusText);
          setError('Failed to fetch food items');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching food items', error);
        setError('Error fetching food items');
        setLoading(false);
      }
    };
    fetchFoodItems();
    if (foodAdded) {
      setFoodAdded(false);
    }
  }, [selectedDate, email, foodAdded]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleAddFood = async () => {
    try {
      console.log('Form data:', formData);
      const response = await fetch('/api/addFood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          mealType: formData.meal,
          mealName: formData.foodName,
          calories: parseInt(formData.foodCalories),
          dateAdded: new Date().toISOString().split('T')[0],
          userEmail: email,
        }),
      });
      if (response.ok) {
        setFoodAdded(true);
        setCalories((prevCalories) => ({
          ...prevCalories,
          [formData.meal]:
            prevCalories[formData.meal] + parseInt(formData.foodCalories),
        }));
        setFormData({
          meal: 'breakfast',
          foodName: '',
          foodCalories: '',
        });
      } else {
        console.error('Failed to add food:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };
  const handleDateChange = (increment) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + increment);
    setSelectedDate(newDate);
  };
  const getMealData = (mealType) => {
    const meals = dashboardData.filter((item) => item.mealType === mealType);
    if (meals.length === 0) {
      return 'No data'; // Handle case when no data is available for a meal type
    }
    return meals
      .map((meal) => `${meal.mealName} (${meal.calories} kcal)`)
      .join(', ');
  };
  const calculateTotalCalories = () => {
    if (!dashboardData) return 0;
    return dashboardData.reduce((total, item) => total + item.calories, 0);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Helmet>
          <title>Log Calories</title>
        </Helmet>

        <Container>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            mt={10}
          >
            <Typography variant="h4" gutterBottom>
              Please log in to record your calories.
            </Typography>
          </Stack>
        </Container>
      </>
    );
  }
  return (
    <>
      <Helmet>
        <title>Log Calories</title>
      </Helmet>

      <Container>
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          mb={5}
        >
          <Typography variant="h4" gutterBottom sx={{ marginBottom: '20px' }}>
            Log Calories
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="contained" onClick={() => handleDateChange(-1)}>
              {' '}
              Previous Day
            </Button>
            <Typography variant="h6">
              {selectedDate.toDateString()}
            </Typography>{' '}
            <Button variant="contained" onClick={() => handleDateChange(1)}>
              {' '}
              Next Day
            </Button>
          </Stack>
        </Stack>

        {foodAdded && (
          <Typography
            variant="h6"
            color="success"
            align="center"
            sx={{ marginTop: 2 }}
          >
            Food added successfully!
          </Typography>
        )}
        <Typography variant="h6" align="center" sx={{ marginTop: 2 }}>
          Total Calories Consumed: {calculateTotalCalories()} kcal
        </Typography>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddFood();
          }}
        >
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="meal-label">Select Meal</InputLabel>
            <Select
              labelId="meal-label"
              id="meal"
              name="meal"
              value={formData.meal}
              onChange={handleInputChange}
            >
              <MenuItem value="breakfast">Breakfast</MenuItem>
              <MenuItem value="lunch">Lunch</MenuItem>
              <MenuItem value="dinner">Dinner</MenuItem>
              <MenuItem value="snacks">Snacks</MenuItem>
              <MenuItem value="drinks">Drinks</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Food Name"
            id="foodName"
            name="foodName"
            value={formData.foodName}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
          />

          <TextField
            fullWidth
            type="number"
            label="Calories"
            id="foodCalories"
            name="foodCalories"
            value={formData.foodCalories}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{ marginBottom: 2 }} // Add padding below the button
          >
            Add Food
          </Button>
        </form>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'center',
                  padding: '10px',
                  borderBottom: '1px solid #ddd',
                }}
              >
                Breakfast
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: '10px',
                  borderBottom: '1px solid #ddd',
                }}
              >
                Lunch
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: '10px',
                  borderBottom: '1px solid #ddd',
                }}
              >
                Dinner
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: '10px',
                  borderBottom: '1px solid #ddd',
                }}
              >
                Drinks
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: '10px',
                  borderBottom: '1px solid #ddd',
                }}
              >
                Snacks
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'red' }}>
                  {error}
                </td>
              </tr>
            ) : (
              <>
                <tr>
                  <td style={tableCellStyle}>{getMealData('breakfast')}</td>
                  <td style={tableCellStyle}>{getMealData('lunch')}</td>
                  <td style={tableCellStyle}>{getMealData('dinner')}</td>
                  <td style={tableCellStyle}>{getMealData('drinks')}</td>
                  <td style={tableCellStyle}>{getMealData('snacks')}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </Container>
    </>
  );
}
