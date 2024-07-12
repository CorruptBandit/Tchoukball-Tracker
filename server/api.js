const MD5 = require('crypto-js/md5');

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const MongoDBConnector = require("./db");
const verifyAdmin = require("./middleware/verifyAdmin")
const { ObjectId } = require('mongodb');
require("dotenv").config();

const app = express();

const PORT = 3001;
const SECRET_KEY = process.env.JWT_SECRET_KEY || "insecure";
const mongoDB = new MongoDBConnector();
const revokedTokens = new Set(); // Set to store revoked tokens
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

app.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const user = await mongoDB.queryCollection("users", { email });
    if (user.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token with email as payload
    const token = jwt.sign({ email: user[0].email }, SECRET_KEY, {
      expiresIn: "1h",
    });

    // Set cookie with HttpOnly
    // Usually you would set 'secure' but we do not have HTTPS
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 3600000 // Cookie expires in 1 hour, same as token
    });

    return res.status(200).json({ message: 'Login successful', email: user[0].email, name: user[0].name});
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/signout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Sign-out successful' });
});

app.post('/api/validateToken', async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, SECRET_KEY);

    // Check if the token has been revoked
    if (revokedTokens.has(token)) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }
  
    // If not revoked and valid
    return res.status(200).json({
      message: 'Token is valid',
      email: decoded.email
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Check if the user already exists
    const existingUser = await mongoDB.queryCollection("users", { email });

    if (existingUser.length !== 0) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash and salt the password before storing it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with the hashed password
    const newUser = {
      name,
      email,
      password: hashedPassword, // Store the hashed password
    };

    // Save the new user to the database
    await mongoDB.insertDocument("users", newUser);

    // Generate JWT token with email as payload;
    const token = jwt.sign({ email: email }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 3600000 // Cookie expires in 1 hour, same as token
    });

    return res.status(200).json({ message: "Registration successful", token });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/addFood", async (req, res) => {
  const { mealType, mealName, calories, userEmail } = req.body;
  if (!mealType || !mealName || !calories || !userEmail) {
    return res.status(400).json({
      error: "Meal type, meal name, calories, and token are all required",
    });
  }
  try {
    const food = {
      mealType,
      mealName,
      calories,
      dateAdded: new Date().toISOString().split("T")[0],
      userEmail,
    };
    await mongoDB.insertFoodItem("food", food);
    return res.status(200).json({ message: "Food added successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/foodItemsByDate", async (req, res) => {
  const { dateAdded, userEmail } = req.body; // Retrieve date and userEmail from request body
  console.log(
    "Received request to fetch food items for date:",
    dateAdded,
    "and user:",
    userEmail
  );
  console.log("Body: ", req.body);
  if (!dateAdded || !userEmail) {
    return res.status(400).json({ error: "Date and userEmail are required" });
  }
  try {
    const foodItems = await mongoDB.queryFoodItemsByDate(
      "food",
      dateAdded,
      userEmail
    );
    console.log("Retrieved food items:", foodItems);
    return res.status(200).json({ foodItems });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post('/api/addWeight', async (req, res) =>{
  const{weight, userEmail} = req.body;
  if (!weight || !userEmail){
    return res.status(400).json({error: "Weight is required."});
  }
  try{
    const document = {
      weight,
      dateAdded: new Date().toISOString().split("T")[0],
      userEmail
    }
    await mongoDB.insertWeight("weight", document);
    return res.status(200).json({message:"Weight added successfully"});
  }catch(error){
    console.error("Error adding weight", error);
    return res.status(500).json({error:'Internal Server Error'});
  }
});
app.post('/api/weightHistory', async (req, res) => {
  const { userEmail, dateAdded } = req.body; // Retrieve userEmail and dateAdded from request body
  if (!userEmail) {
    return res.status(400).json({ error: "User email is required" });
  }
  try {
    const weightHistory = await mongoDB.getWeightHistory("weight", userEmail, dateAdded);
    return res.status(200).json({ weightHistory });
  } catch (error) {
    console.error('Error fetching weight history', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/users', verifyAdmin, async (req, res) => {
  try {
    // Exclude admin user as this should be handled directly on the DB by admin
    const users = await mongoDB.queryCollection("users", { email: { $ne: "admin@admin.admin" } });
    const userDisplay = users.map(user => ({
      email: user.email,
      name: user.name,
      id: user._id // Assuming MongoDB, so _id would be used
    }));
    res.status(200).json(userDisplay);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.delete('/api/users/:userId', verifyAdmin, async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await mongoDB.deleteDocument("users", new ObjectId(userId));
    console.log(result)
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Change user password
app.put('/api/users/:userId/password', verifyAdmin, async (req, res) => {
  const userId = req.params.userId;
  const newPassword = MD5(req.body.password).toString();
  console.log(newPassword.length)
  if (!newPassword) {
    return res.status(400).json({ error: "New password is required" });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await mongoDB.updateDocument("users", new ObjectId(userId), { password: hashedPassword });
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/getCollection', async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (authorization) {
      const token = authorization.split(' ')[1];
      if (revokedTokens.has(token)) {
        return res.status(401).json({ error: 'Token has been revoked' });
      }
    }

    const collectionName = req.query.collection;
    const collection = await mongoDB.getCollection(collectionName);
    if (collection.length === 0) {
      return res.status(404).json({ error: `Error getting ${collectionName}` });
    }

    return res.status(200).json(collection);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/updateDocument', async (req, res) => {
  const collectionName = req.query.collection;
  const document = req.body;
  const documentId = new ObjectId(req.query.docId);

  console.log("Updating document " + documentId + " in " + collectionName)
  console.log("Updated document: " + JSON.stringify(document))

  try {
    await mongoDB.updateDocument(collectionName, documentId, document);
    return res.status(200).json({ message: 'Document updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/deleteDocument', async (req, res) => {
  const collectionName = req.query.collection;
  const documentId = new ObjectId(req.query.docId);

  console.log("Deleting document " + documentId + " from " + collectionName)

  try {
    await mongoDB.deleteDocument(collectionName, documentId);
    return res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/insertDocument', async (req, res) => {

  const collectionName = req.query.collection;
  const document = req.body;

  console.log("Inserting document to " + collectionName)
  console.log("Document: " + JSON.stringify(document))

  try {
    await mongoDB.insertDocument(collectionName, document);
    return res.status(200).json({ message: 'Document updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
