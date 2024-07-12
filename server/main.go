package main

import (
	"fmt"
	"os"

	"github.com/Tchoukball-Tracker/pkg/database"
	"github.com/Tchoukball-Tracker/pkg/handlers"
	"github.com/Tchoukball-Tracker/pkg/logger"
	"github.com/gin-gonic/gin"
)

// @title           Dashboard Creator API
// @version         1.0
// @description     Dashboard creator API documentation.

// @host      localhost:8080
// @BasePath  /
func main() {
	router := gin.Default()

	connectionString := fmt.Sprintf(
		"mongodb://%s:%s@%s/db?authSource=admin",
		os.Getenv("MONGO_USERNAME"),
		os.Getenv("MONGO_PASSWORD"),
		os.Getenv("MONGO_HOST"))

	if err := database.Connect(connectionString, "DashboardCreator"); err != nil {
		logger.Log.Fatalf("Failed to connect to database: %v", err)
	}

	// router.GET("/", func(c *gin.Context) {
	// 	c.Redirect(http.StatusFound, "/swagger/index.html")
	// })

	//router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	handlers.RegisterGraphsRoutes(router.Group("/graphs"))

	logger.Log.Info("Starting the server on port 8080")
	if err := router.Run(":8080"); err != nil {
		logger.Log.Fatalf("Failed to start the server: %v", err)
	}
}
