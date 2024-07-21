package main

import (
	"fmt"
	"log"
	"os"

	"github.com/Tchoukball-Tracker/pkg/database"
	"github.com/Tchoukball-Tracker/pkg/handlers"
	"github.com/Tchoukball-Tracker/pkg/logger"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// @title           Tchoukball Tracker API
// @version         1.0
// @description     Tchoukball Tracker API documentation.

// @host      localhost:8080
// @BasePath  /
func main() {
	err := godotenv.Load("./.env")
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	router := gin.Default()

	connectionString := fmt.Sprintf(
		"mongodb://%s/db?authSource=admin&ssl=true&tlsCertificateKeyFile=%s&tlsCAFile=%s",
		os.Getenv("MONGO_HOST"),
		os.Getenv("TLS_CERT_FILE"),
		os.Getenv("TLS_CA_FILE"))

	if err := database.Connect(connectionString, "DashboardCreator"); err != nil {
		logger.Log.Fatalf("Failed to connect to database: %v", err)
	}

	// router.GET("/", func(c *gin.Context) {
	// 	c.Redirect(http.StatusFound, "/swagger/index.html")
	// })

	//router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	handlers.RegisterSpreadsheetRoutes(router.Group("/spreadsheets"))
	handlers.RegisterLoginRoutes(router.Group("/login"))

	logger.Log.Info("Starting the server on port" + os.Getenv("SERVER_PORT"))
	if err := router.Run(":" + os.Getenv("SERVER_PORT")); err != nil {
		logger.Log.Fatalf("Failed to start the server: %v", err)
	}
}
