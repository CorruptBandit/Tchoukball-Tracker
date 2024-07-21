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
	router.GET("", getAllSpreadsheets)
	router.POST("", createSpreadsheet)
	router.GET("/:id", getSpreadsheetByID)
	router.PUT("/:id", updateSpreadsheet)
	router.DELETE("/:id", deleteSpreadsheet)
	router.POST("/:id/player", createPlayer)
	router.POST("/:id/player/:player/action", createPlayerAction)
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
func getAllSpreadsheets(c *gin.Context) {
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
func createSpreadsheet(c *gin.Context) {
	var newSpreadsheet *models.Spreadsheet
	if err := c.ShouldBindJSON(&newSpreadsheet); err != nil {
		c.JSON(http.StatusBadRequest, models.HTTPError{Code: http.StatusBadRequest, Message: err.Error()})
		return
	}

	if newSpreadsheet.Name == "" {
		c.JSON(http.StatusUnprocessableEntity, models.HTTPError{Code: http.StatusUnprocessableEntity, Message: "Please provide a name for the Spreadsheet"})
		return
	}

	if newSpreadsheet.Players == nil {
		newSpreadsheet.Players = make([]*models.Player, 0)
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
func getSpreadsheetByID(c *gin.Context) {
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
func updateSpreadsheet(c *gin.Context) {
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

	if updatedSpreadsheet.Players != nil {
		fetchedSpreadsheet.Players = updatedSpreadsheet.Players
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
func deleteSpreadsheet(c *gin.Context) {
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

// CreatePlayerAction creates a new player action.
// @Summary Create a new spreadsheet
// @Description create a new spreadsheet with the provided details
// @Tags spreadsheets
// @Accept json
// @Produce json
// @Param id path string true "Spreadsheet ID"
// @Param spreadsheet body models.Player true "Spreadsheet Info"
// @Success 201 {object} models.Spreadsheet "Successfully created"
// @Failure 400 {object} models.HTTPError "Bad request - invalid JSON"
// @Failure 422 {object} models.HTTPError "Bad request - missing element"
// @Failure 500 {object} models.HTTPError "Internal server error"
// @Router /spreadsheets/{id}/player [post]
func createPlayer(c *gin.Context) {
	var newSpreadsheet *models.Spreadsheet
	if err := c.ShouldBindJSON(&newSpreadsheet); err != nil {
		c.JSON(http.StatusBadRequest, models.HTTPError{Code: http.StatusBadRequest, Message: err.Error()})
		return
	}

	if newSpreadsheet.Name == "" {
		c.JSON(http.StatusUnprocessableEntity, models.HTTPError{Code: http.StatusUnprocessableEntity, Message: "Please provide a name for the Spreadsheet"})
		return
	}

	if newSpreadsheet.Players == nil {
		newSpreadsheet.Players = make([]*models.Player, 0)
	}

	dbSpreadsheet, err := database.Insert(c.Request.Context(), newSpreadsheet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dbSpreadsheet)
}

// CreatePlayerAction creates a new player action.
// @Summary Create a new player action
// @Description create a new action for the player
// @Tags spreadsheets
// @Accept json
// @Produce json
// @Param id path string true "Spreadsheet ID"
// @Param player path string true "Player name"
// @Param spreadsheet body models.PlayerAction true "Action Info"
// @Success 201 {object} models.Player "Successfully created"
// @Failure 400 {object} models.HTTPError "Bad request - invalid JSON"
// @Failure 404 {object} models.HTTPError "Failed to find player"
// @Failure 422 {object} models.HTTPError "Bad request - missing element"
// @Failure 500 {object} models.HTTPError "Internal server error"
// @Router /spreadsheets/{id}/player/{player}/action [post]
func createPlayerAction(c *gin.Context) {
	hexID := c.Param("id")
	var newAction models.PlayerAction
	if err := c.ShouldBindJSON(&newAction); err != nil {
		c.JSON(http.StatusBadRequest, models.HTTPError{Code: http.StatusBadRequest, Message: err.Error()})
		return
	}

	if newAction.Type == "" {
		c.JSON(http.StatusUnprocessableEntity, models.HTTPError{Code: http.StatusUnprocessableEntity, Message: "Please provide an action type"})
		return
	}

	dbResult, err := database.Find(c.Request.Context(), &models.Spreadsheet{ID: utils.ConvertToMongoID(hexID)})
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	spreadsheet := dbResult.(*models.Spreadsheet)
	player := spreadsheet.FindPlayer(c.Param("player"))
	if player == nil {
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Failed to find player with that name"})
	}
	player.AddAction(newAction)

	_, err = database.Update(c.Request.Context(), spreadsheet)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, player)
}
