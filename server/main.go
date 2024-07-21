package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/Tchoukball-Tracker/docs"
	"github.com/Tchoukball-Tracker/pkg/database"
	"github.com/Tchoukball-Tracker/pkg/handlers"
	"github.com/Tchoukball-Tracker/pkg/logger"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           Tchoukball Tracker API
// @version         1.0
// @description     Tchoukball Tracker API documentation.

// @host      localhost:8080
// @BasePath  /
func main() {
	err := godotenv.Load("./.env")
	if err != nil {
		// If it fails, try to load .env file from the parent directory
		err = godotenv.Load("./../.env")
		if err != nil {
			log.Fatalf("Error loading .env file")
		}
	}

	router := gin.Default()

	connectionString := fmt.Sprintf(
		"mongodb://%s/db?authSource=admin&ssl=true&tlsCertificateKeyFile=%s&tlsCAFile=%s",
		os.Getenv("MONGO_HOST"),
		os.Getenv("TLS_CERT_FILE"),
		os.Getenv("TLS_CA_FILE"))

	if err := database.Connect(connectionString, "Tchoukball"); err != nil {
		logger.Log.Fatalf("Failed to connect to database: %v", err)
	}

	router.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusFound, "/swagger/index.html")
	})

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	handlers.RegisterSpreadsheetsRoutes(router.Group("/spreadsheets"))
	handlers.RegisterMatchesRoutes(router.Group("/matches"))

	logger.Log.Infof("Starting the server on port %s", os.Getenv("SERVER_PORT"))
	if err := router.Run(":" + os.Getenv("SERVER_PORT")); err != nil {
		logger.Log.Fatalf("Failed to start the server: %v", err)
	}
}
