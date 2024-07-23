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
	if os.Getenv("GIN_MODE") != "release" {
		// Attempt to load the .env file from Docker path
		err := godotenv.Load("/app/.env") // Docker Path
		if err != nil {
			// If not found, attempt to load the .env file from local path
			err = godotenv.Load("../.env")
			if err != nil {
				log.Fatalf("Error loading .env file")
			}
		}
	} else {
		log.Println("GIN_MODE is set to release, skipping loading .env file")
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
	handlers.RegisterAuthRoutes(router.Group("/login"))

	logger.Log.Infof("Starting the server on port %s", os.Getenv("SERVER_PORT"))
	if os.Getenv("GIN_MODE") != "release" {
		if err := router.Run(":" + os.Getenv("SERVER_PORT")); err != nil {
			logger.Log.Fatalf("Failed to start the server: %v", err)
		}
	} else {
		if err := router.RunTLS(":" + os.Getenv("SERVER_PORT"), os.Getenv("TLS_FULLCHAIN_FILE"), os.Getenv("TLS_PRIVKEY_FILE")); err != nil {
			logger.Log.Fatalf("Failed to start the server: %v", err)
		}
	}
}
