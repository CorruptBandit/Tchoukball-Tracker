import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { Button, Container, Typography, Stack, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

export default function RecordWeightPage() {
    const { isLoggedIn, email } = useAuth();
    const [weight, setWeight] = useState('');
    const [selectedDate] = useState(new Date());
    const [weightHistory, setWeightHistory] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchWeightHistory();
  },[]);

  const handleWeightChange = (e) => {
    setWeight(e.target.value);
  };
  const handleAddWeight = async () => {
    try{
        const response = await fetch('/api/addWeight',{
            method : 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({
                weight,
                userEmail:email,
            }),
        });
        if (response.ok){
            setSuccessMessage('Weight added successfully');
            setWeight('');
            fetchWeightHistory();
        }else{
            const data = await response.json();
            console.error("Failed to add weight", data.error);
        }
    }catch(error){
        console.error("Error adding weight", error)
    }
  };
  const fetchWeightHistory = async () => {
    const dateAdded = selectedDate.toISOString().split("T")[0];
    const userEmail = email;
    try {
      const response = await fetch('/api/weightHistory', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: userEmail, // Send userEmail in the request body
          dateAdded: dateAdded,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched weight history", data.weightHistory)
        setWeightHistory(data.weightHistory);
      } else {
        console.error("Failed to fetch weight history");
      }
    } catch (error) {
      console.error("Error fetching weight history", error);
    }
  }

  if (!isLoggedIn) {
    return (
      <>
        <Helmet>
          <title>Record Weight</title>
        </Helmet>

        <Container>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            mt={10}
          >
            <Typography variant="h4" gutterBottom>
              Please log in to record your weight.
            </Typography>
          </Stack>
        </Container>
      </>
    );
  } else {
    return (
      <>
        <Helmet>
          <title>Record Weight</title>
        </Helmet>

        <Container>
          <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            mb={5}
          >
            <Typography variant="h4" gutterBottom sx={{ marginBottom: '20px' }}>
              Record Weight
            </Typography>
            <TextField
              fullWidth
              type="number"
              label="Weight (in kg)"
              id="weight"
              name="weight"
              value={weight}
              onChange={handleWeightChange}
              sx={{ marginBottom: 2 }}
            />
            <Button
              onClick={handleAddWeight}
              variant="contained"
              sx={{ marginBottom: 2 }} // Add padding below the button
            >
              Add Weight
            </Button>
            {successMessage && (
              <Typography variant="body1" color="success">
                {successMessage}
              </Typography>
            )}
          </Stack>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Weight (kg)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weightHistory.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{record.dateAdded}</TableCell>
                    <TableCell>{record.weight}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </>
    );
  }
}