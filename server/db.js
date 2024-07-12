const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const env = process.env;

class MongoDBConnector {
  constructor() {
    this.uri = `mongodb+srv://${env.MONGO_USERNAME}:${env.MONGO_PASSWORD}@bs3206.7ikwc7d.mongodb.net/?retryWrites=true&w=majority`;
    this.dbName = "AdvancedSoftwareDev";
    this.client = new MongoClient(this.uri);

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      console.log("Connected to MongoDB");
      this.db = this.client.db(this.dbName);
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }

  async disconnect() {
    try {
      await this.client.close();
      console.log("Disconnected from MongoDB");
    } catch (error) {
      console.error("Error disconnecting from MongoDB:", error);
    }
  }

  async insertDocument(collectionName, document) {
    if (!this.db) {
      console.error("MongoDB not connected.");
      return;
    }

    try {
      const result = await this.db
        .collection(collectionName)
        .insertOne(document);
      return result;
    } catch (error) {
      console.error("Error inserting document:", error);
      throw error;
    }
  }

  async deleteDocument(collectionName, id) {
    await this.connect();
    return await this.db.collection(collectionName).deleteOne({ _id: id });
  }

  async updateDocument(collectionName, id, updateValues) {
    await this.connect();
    return this.db.collection(collectionName).updateOne({ _id: id }, { $set: updateValues });
  }

  queryCollection(collectionName, query) {
    const asyncFunction = async (collectionName, query) => {
      try {
        const collection = this.db.collection(collectionName);
        const result = collection.find(query).toArray();
        return await result;
      } catch (error) {
        console.error("Error querying MongoDB:", error);
        throw error;
      }
    };

    return asyncFunction(collectionName, query);
  }

  getCollection (collectionName) {
    const asyncFunction = async (collectionName) => {
      try {
        const collection = this.db.collection(collectionName)

        return await collection.find({}).toArray()
      } catch (error) {
        console.error('Error querying MongoDB:', error)
        throw error
      }
    }

    return asyncFunction(collectionName)
  }
  
  async insertFoodItem(collectionName, document) {
    if (!this.db) {
      console.error("MongoDB not connected");
      return;
    }
    try {
      const result = await this.db
        .collection(collectionName)
        .insertOne(document);
      return result;
    } catch (error) {
      console.error("Error inserting document", error);
      throw error;
    }
  }
  async queryFoodItemsByDate(collectionName, dateAdded, userEmail) {
    if (!this.db) {
      console.error("MongoDB not connected");
      return;
    }
    try {
      console.log(
        "Querying food items for date:",
        dateAdded,
        "and user:",
        userEmail
      );
      const foodItems = await this.db
        .collection(collectionName)
        .find({ dateAdded: dateAdded, userEmail: userEmail }) // Include userEmail in the query
        .toArray();
      console.log("Retrieved food items:", foodItems);
      return foodItems;
    } catch (error) {
      console.error("Error querying food items by date:", error);
      throw error;
    }
  }
  async insertWeight(collectionName, document){
    if(!this.db){
      console.error("MongoDB not connected");
      return;
    }
    try{
      const result = await this.db.collection(collectionName).insertOne(document);
      return result;
    }catch(error){
      console.error("Error inserting weight", error);
      throw error;
    }
  }
  async getWeightHistory(collectionName, userEmail){
    if(!this.db){
      console.error("MongoDB not connected");
      return;
    }
    try{
      const weightHistory = await this.db.collection(collectionName).find({ userEmail: userEmail }).toArray();
      return weightHistory;
    }catch(error){
      console.error("Error fetching weight history", error);
      throw error;
    }
  }
}

module.exports = MongoDBConnector;
