package handlers

import (
	"net/http"

	"github.com/Tchoukball-Tracker/pkg/database"
	"github.com/Tchoukball-Tracker/pkg/models"
	"github.com/Tchoukball-Tracker/pkg/utils"
	"github.com/gin-gonic/gin"
)

func RegisterSpreadsheetRoutes(router *gin.RouterGroup) {
	router.GET("", getAllSpreadsheets)
	router.POST("", uploadSpreadsheet)
	router.GET("/:id", getSpreadsheetByID)
	router.PUT("/:id", UpdateSpreadsheet)
	// router.DELETE("/:id", DeleteGraph)
}

func getAllSpreadsheets(c *gin.Context) {
	spreadsheets, err := database.FindAll(c.Request.Context(), &models.Spreadsheet{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, spreadsheets)
}

func getSpreadsheetByID(c *gin.Context) {
	mongoId := utils.ConvertToMongoID(c.Param("id"))
	var spreadsheetID *models.Spreadsheet = &models.Spreadsheet{ID: mongoId}

	spreadsheet, err := database.Find(c.Request.Context(), spreadsheetID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Spreadsheet not found"})
		return
	}

	c.JSON(http.StatusOK, spreadsheet)
}

// UploadSpreadsheet handles POST requests to upload spreadsheet data.
func uploadSpreadsheet(c *gin.Context) {
	var data interface{}
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON data"})
		return
	}

	var spreadsheet models.Spreadsheet = models.Spreadsheet{Name: "test", Data: data}

	if _, err := database.Insert(c.Request.Context(), &spreadsheet); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert data: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data successfully inserted"})
}

// UpdateSpreadsheet handles PUT requests to update spreadsheet data.
func UpdateSpreadsheet(c *gin.Context) {
	var data interface{}
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON data"})
		return
	}

	if _, err := database.Update(c.Request.Context(), &spreadsheet); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update data: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data successfully inserted"})
}
