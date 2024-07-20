// handlers/Matches.go
package handlers

import (
	"net/http"
	"time"

	"github.com/Tchoukball-Tracker/pkg/database"
	"github.com/Tchoukball-Tracker/pkg/models"
	"github.com/Tchoukball-Tracker/pkg/utils"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RegisterRoutes registers match-related routes in the provided router group.
func RegisterMatchesRoutes(router *gin.RouterGroup) {
	router.GET("", getAllMatches)
	router.POST("", createMatch)
	router.GET("/:id", getMatchByID)
	router.PUT("/:id", updateMatch)
	router.DELETE("/:id", deleteMatch)
}

// GetAllMatches retrieves all matches.
// @Summary Retrieve all matches
// @Description get all matches from the database
// @Tags matches
// @Accept  json
// @Produce  json
// @Success 200 {array} models.Match "List of matches"
// @Failure 500 {object} models.HTTPError "Internal server error"
// @Router /matches [get]
func getAllMatches(c *gin.Context) {
	dbMatches, err := database.FindAll(c.Request.Context(), &models.Match{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, dbMatches)
}

// CreateMatch creates a new match.
// @Summary Create a new match
// @Description create a new match with the provided details
// @Tags matches
// @Accept json
// @Produce json
// @Param match body models.Match true "Match Info"
// @Success 201 {object} models.Match "Successfully created"
// @Failure 400 {object} models.HTTPError "Bad request - invalid JSON"
// @Failure 422 {object} models.HTTPError "Bad request - missing element"
// @Failure 500 {object} models.HTTPError "Internal server error"
// @Router /matches [post]
func createMatch(c *gin.Context) {
	var newMatch *models.Match
	if err := c.ShouldBindJSON(&newMatch); err != nil {
		c.JSON(http.StatusBadRequest, models.HTTPError{Code: http.StatusBadRequest, Message: err.Error()})
		return
	}

	if newMatch.Name == "" {
		c.JSON(http.StatusUnprocessableEntity, models.HTTPError{Code: http.StatusUnprocessableEntity, Message: "Please provide a name for the Match"})
		return
	}

	result, err := database.FindByName(c.Request.Context(), newMatch, newMatch.Name)
	if result != nil {
		c.JSON(http.StatusUnprocessableEntity, models.HTTPError{Code: http.StatusUnprocessableEntity, Message: "Match name already used"})
		return
	}

	if newMatch.CreatedAt.IsZero() {
		newMatch.CreatedAt = time.Now().UTC()
	}

	if newMatch.Thirds == nil {
		newMatch.Thirds = make(map[string]primitive.ObjectID)
	}

	//create all 3 thirds and assign it to the match
	first := models.Spreadsheet{Name: newMatch.Name + " - First Third"}
	second := models.Spreadsheet{Name: newMatch.Name + " - Second Third"}
	third := models.Spreadsheet{Name: newMatch.Name + " - Third Third"}

	dbFirst, err := database.Insert(c.Request.Context(), &first)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}
	dbSecond, err := database.Insert(c.Request.Context(), &second)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}
	dbThird, err := database.Insert(c.Request.Context(), &third)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	newMatch.Thirds["first"] = dbFirst.GetID()
	newMatch.Thirds["second"] = dbSecond.GetID()
	newMatch.Thirds["third"] = dbThird.GetID()

	dbMatch, err := database.Insert(c.Request.Context(), newMatch)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dbMatch)
}

// GetMatchByID retrieves a match by ID.
// @Summary Retrieve a match by ID
// @Description get match by ID from the database
// @Tags matches
// @Accept  json
// @Produce  json
// @Param id path string true "Match ID"
// @Success 200 {object} models.Match "Match retrieved"
// @Failure 404 {object} models.HTTPError "Match not found"
// @Router /matches/{id} [get]
func getMatchByID(c *gin.Context) {
	hexID := c.Param("id")
	var matchID *models.Match = &models.Match{ID: utils.ConvertToMongoID(hexID)}

	dbMatch, err := database.Find(c.Request.Context(), matchID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Match not found"})
		return
	}

	c.JSON(http.StatusOK, dbMatch)
}

// UpdateMatch updates a match by ID.
// @Summary Update a match
// @Description update details of a match by ID
// @Tags matches
// @Accept  json
// @Produce  json
// @Param id path string true "Match ID"
// @Param match body models.Match true "Match info"
// @Success 200 {object} models.Match "Match updated"
// @Failure 404 {object} models.HTTPError "Match not found"
// @Router /matches/{id} [put]
func updateMatch(c *gin.Context) {
	var updatedMatch *models.Match
	if err := c.ShouldBindJSON(&updatedMatch); err != nil {
		c.JSON(http.StatusBadRequest, models.HTTPError{Code: http.StatusBadRequest, Message: err.Error()})
		return
	}

	hexID := c.Param("id")
	updatedMatch.ID = utils.ConvertToMongoID(hexID)

	result, err := database.Find(c.Request.Context(), updatedMatch)
	if err != nil {
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Match not found"})
		return
	}

	fetchedMatch := result.(*models.Match)
	if updatedMatch.Name != "" {
		fetchedMatch.Name = updatedMatch.Name
	}

	res, err := database.Update(c.Request.Context(), fetchedMatch)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	if res.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Match not found"})
		return
	}

	c.JSON(http.StatusOK, fetchedMatch)
}

// DeleteMatch deletes a match by ID.
// @Summary Delete a match
// @Description delete a match by ID
// @Tags matches
// @Accept  json
// @Produce  json
// @Param id path string true "Match ID"
// @Success 200 {string} string "Successfully deleted"
// @Failure 404 {object} models.HTTPError "Match not found"
// @Router /matches/{id} [delete]
func deleteMatch(c *gin.Context) {
	hexID := c.Param("id")
	var deleteMatch *models.Match = &models.Match{ID: utils.ConvertToMongoID(hexID)}

	result, err := database.Delete(c.Request.Context(), deleteMatch)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Match not found"})
		return
	}

	c.JSON(http.StatusOK, models.HTTPError{Code: http.StatusOK, Message: "Successfully Deleted"})
}
