# Tchoukball Tracker

A web application to track and manage Tchoukball statistics.

## Prerequisites

- **Certificates:** Required for secure connections. Please contact the developers to obtain them.
- **Node.js & npm:** Required for running the frontend locally.
- **Go:** Required for running the backend locally.
- **Docker & Docker Compose:** Optional but recommended for running the entire application in a containerized environment.

## Running the Application

### Option 1: Run Locally

This option allows you to run the application on your local machine without using Docker for the Frontend and Backend.

1. **MongoDB:** 
   - Start MongoDB using Docker:
     ```sh
     docker compose up mongodb
     ```
   - Alternatively, you can run MongoDB package or use MongoDB Atlas to avoid using Docker entirely.
   
2. **Backend:**
   - Navigate to the `server` directory:
     ```sh
     cd server
     ```
   - Start the Go backend:
     ```sh
     go run main.go
     ```
   
3. **Frontend:**
   - Start the frontend:
     ```sh
     npm start
     ```

4. **Database Setup:**
   - Ensure the required users are set up **MANUALLY** in the Tchoukball Database Users Collection.

### Option 2: Run Using Docker

This option allows you to run the entire application in Docker containers.

1. **Start the Application:**
   ```sh
   docker compose up
   ```

## Running in Production

In production, TLS is enabled across the entire application to ensure secure communication.

### Build and Run

1. **Build the Docker Images:**
   ```sh
   sudo docker compose -f compose.prod.yaml build
   ```

   _Note: Use the `--no-cache` flag if you need to force rebuild the images without using the cache._

2. **Run the Application:**
   ```sh
   sudo docker compose -f compose.prod.yaml up
   ```

### Important Notes

- All commands should be run from the root directory of the repository.
- Ensure that your certificates are properly configured for production.
