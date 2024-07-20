// handlers/spreadsheets.go
package handlers

import (
	"net/http"

	"github.com/Tchoukball-Tracker/pkg/database"
	"github.com/Tchoukball-Tracker/pkg/models"
	"github.com/Tchoukball-Tracker/pkg/utils"
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers spreadsheet-related routes in the provided router group.
func RegisterSpreadsheetsRoutes(router *gin.RouterGroup) {
	router.GET("", GetAllSpreadsheets)
	router.POST("", CreateSpreadsheet)
	router.GET("/:id", GetSpreadsheetByID)
	router.PUT("/:id", UpdateSpreadsheet)
	router.DELETE("/:id", DeleteSpreadsheet)
}

// GetAllSpreadsheets retrieves all spreadsheets.
// @Summary Retrieve all spreadsheets
// @Description get all spreadsheets from the database
// @Tags spreadsheets
// @Accept  json
// @Produce  json
// @Success 200 {array} models.Spreadsheet "List of spreadsheets"
// @Failure 500 {object} models.HTTPError "Internal server error"
// @Router /spreadsheets [get]
func GetAllSpreadsheets(c *gin.Context) {
	dbSpreadsheets, err := database.FindAll(c.Request.Context(), &models.Spreadsheet{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, dbSpreadsheets)
}

// CreateSpreadsheet creates a new spreadsheet.
// @Summary Create a new spreadsheet
// @Description create a new spreadsheet with the provided details
// @Tags spreadsheets
// @Accept json
// @Produce json
// @Param spreadsheet body models.Spreadsheet true "Spreadsheet Info"
// @Success 201 {object} models.Spreadsheet "Successfully created"
// @Failure 400 {object} models.HTTPError "Bad request - invalid JSON"
// @Failure 422 {object} models.HTTPError "Bad request - missing element"
// @Failure 500 {object} models.HTTPError "Internal server error"
// @Router /spreadsheets [post]
func CreateSpreadsheet(c *gin.Context) {
	var newSpreadsheet *models.Spreadsheet
	if err := c.ShouldBindJSON(&newSpreadsheet); err != nil {
		c.JSON(http.StatusBadRequest, models.HTTPError{Code: http.StatusBadRequest, Message: err.Error()})
		return
	}

	if newSpreadsheet.Name == "" {
		c.JSON(http.StatusUnprocessableEntity, models.HTTPError{Code: http.StatusUnprocessableEntity, Message: "Please provide a name for the Spreadsheet"})
		return
	}

	dbSpreadsheet, err := database.Insert(c.Request.Context(), newSpreadsheet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dbSpreadsheet)
}

// GetSpreadsheetByID retrieves a spreadsheet by ID.
// @Summary Retrieve a spreadsheet by ID
// @Description get spreadsheet by ID from the database
// @Tags spreadsheets
// @Accept  json
// @Produce  json
// @Param id path string true "Spreadsheet ID"
// @Success 200 {object} models.Spreadsheet "Spreadsheet retrieved"
// @Failure 404 {object} models.HTTPError "Spreadsheet not found"
// @Router /spreadsheets/{id} [get]
func GetSpreadsheetByID(c *gin.Context) {
	hexID := c.Param("id")
	var spreadsheetID *models.Spreadsheet = &models.Spreadsheet{ID: utils.ConvertToMongoID(hexID)}

	dbSpreadsheet, err := database.Find(c.Request.Context(), spreadsheetID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Spreadsheet not found"})
		return
	}

	c.JSON(http.StatusOK, dbSpreadsheet)
}

// UpdateSpreadsheet updates a spreadsheet by ID.
// @Summary Update a spreadsheet
// @Description update details of a spreadsheet by ID
// @Tags spreadsheets
// @Accept  json
// @Produce  json
// @Param id path string true "Spreadsheet ID"
// @Param spreadsheet body models.Spreadsheet true "Spreadsheet info"
// @Success 200 {object} models.Spreadsheet "Spreadsheet updated"
// @Failure 404 {object} models.HTTPError "Spreadsheet not found"
// @Router /spreadsheets/{id} [put]
func UpdateSpreadsheet(c *gin.Context) {
	var updatedSpreadsheet *models.Spreadsheet
	if err := c.ShouldBindJSON(&updatedSpreadsheet); err != nil {
		c.JSON(http.StatusBadRequest, models.HTTPError{Code: http.StatusBadRequest, Message: err.Error()})
		return
	}

	hexID := c.Param("id")
	updatedSpreadsheet.ID = utils.ConvertToMongoID(hexID)

	result, err := database.Find(c.Request.Context(), updatedSpreadsheet)
	if err != nil {
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Spreadsheet not found"})
		return
	}

	fetchedSpreadsheet := result.(*models.Spreadsheet)
	if updatedSpreadsheet.Name != "" {
		fetchedSpreadsheet.Name = updatedSpreadsheet.Name
	}

	if updatedSpreadsheet.Data != nil {
		fetchedSpreadsheet.Data = updatedSpreadsheet.Data
	}

	res, err := database.Update(c.Request.Context(), fetchedSpreadsheet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	if res.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Spreadsheet not found"})
		return
	}

	c.JSON(http.StatusOK, fetchedSpreadsheet)
}

// DeleteSpreadsheet deletes a spreadsheet by ID.
// @Summary Delete a spreadsheet
// @Description delete a spreadsheet by ID
// @Tags spreadsheets
// @Accept  json
// @Produce  json
// @Param id path string true "Spreadsheet ID"
// @Success 200 {string} string "Successfully deleted"
// @Failure 404 {object} models.HTTPError "Spreadsheet not found"
// @Router /spreadsheets/{id} [delete]
func DeleteSpreadsheet(c *gin.Context) {
	hexID := c.Param("id")
	var deleteSpreadsheet *models.Spreadsheet = &models.Spreadsheet{ID: utils.ConvertToMongoID(hexID)}

	result, err := database.Delete(c.Request.Context(), deleteSpreadsheet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Spreadsheet not found"})
		return
	}

	c.JSON(http.StatusOK, models.HTTPError{Code: http.StatusOK, Message: "Successfully Deleted"})
}
