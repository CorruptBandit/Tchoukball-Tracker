// handlers/graphs.go
package handlers

import (
	"net/http"

	"github.com/Tchoukball-Tracker/pkg/database"
	"github.com/Tchoukball-Tracker/pkg/models"
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers graph-related routes in the provided router group.
func RegisterGraphsRoutes(router *gin.RouterGroup) {
	router.GET("", GetAllGraphs)
	router.POST("", CreateGraph)
	router.GET("/:id", GetGraphByID)
	router.PUT("/:id", UpdateGraph)
	router.DELETE("/:id", DeleteGraph)
}

// GetAllGraphs retrieves all graphs.
// @Summary Retrieve all graphs
// @Description get all graphs from the database
// @Tags graphs
// @Accept  json
// @Produce  json
// @Success 200 {array} models.Graph "List of graphs"
// @Failure 500 {object} models.HTTPError "Internal server error"
// @Router /graphs [get]
func GetAllGraphs(c *gin.Context) {
	dbGraphs, err := database.FindAll(c.Request.Context(), &models.DBGraph{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	// Convert dbGraphs to domain model
	graphs := make([]*models.Graph, 0)
	for _, dbGraph := range dbGraphs {
		graphs = append(graphs, dbGraph.(*models.DBGraph).ToDomain())
	}

	c.JSON(http.StatusOK, graphs)
}

// CreateGraph creates a new graph.
// @Summary Create a new graph
// @Description create a new graph with the provided details
// @Tags graphs
// @Accept json
// @Produce json
// @Param graph body models.Graph true "Graph Info"
// @Success 201 {object} models.Graph "Successfully created"
// @Failure 400 {object} models.HTTPError "Bad request - invalid JSON"
// @Failure 422 {object} models.HTTPError "Bad request - missing element"
// @Failure 500 {object} models.HTTPError "Internal server error"
// @Router /graphs [post]
func CreateGraph(c *gin.Context) {
	var newGraph models.Graph
	if err := c.ShouldBindJSON(&newGraph); err != nil {
		c.JSON(http.StatusBadRequest, models.HTTPError{Code: http.StatusBadRequest, Message: err.Error()})
		return
	}

	if newGraph.Name == "" {
		c.JSON(http.StatusUnprocessableEntity, models.HTTPError{Code: http.StatusUnprocessableEntity, Message: "Please provide a name for the Graph"})
		return
	}

	// if newGraph.Position == nil {
	// 	newGraph.Position = &models.Position{
	// 		Y: 100,
	// 	}
	// }

	// if newGraph.Size == nil {
	// 	newGraph.Size = &models.Size{
	// 		Width:  150,
	// 		Height: 100,
	// 	}
	// }

	dbGraph, err := database.Insert(c.Request.Context(), newGraph.ToDatabase())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dbGraph.(*models.DBGraph).ToDomain())
}

// GetGraphByID retrieves a graph by ID.
// @Summary Retrieve a graph by ID
// @Description get graph by ID from the database
// @Tags graphs
// @Accept  json
// @Produce  json
// @Param id path string true "Graph ID"
// @Success 200 {object} models.Graph "Graph retrieved"
// @Failure 404 {object} models.HTTPError "Graph not found"
// @Router /graphs/{id} [get]
func GetGraphByID(c *gin.Context) {
	var graphID *models.Graph = &models.Graph{ID: c.Param("id")}

	dbGraph, err := database.Find(c.Request.Context(), graphID.ToDatabase())
	if err != nil {
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Graph not found"})
		return
	}

	c.JSON(http.StatusOK, dbGraph.(*models.DBGraph).ToDomain())
}

// UpdateGraph updates a graph by ID.
// @Summary Update a graph
// @Description update details of a graph by ID
// @Tags graphs
// @Accept  json
// @Produce  json
// @Param id path string true "Graph ID"
// @Param graph body models.Graph true "Graph info"
// @Success 200 {object} models.Graph "Graph updated"
// @Failure 404 {object} models.HTTPError "Graph not found"
// @Router /graphs/{id} [put]
func UpdateGraph(c *gin.Context) {
	var updatedGraph *models.Graph
	if err := c.ShouldBindJSON(&updatedGraph); err != nil {
		c.JSON(http.StatusBadRequest, models.HTTPError{Code: http.StatusBadRequest, Message: err.Error()})
		return
	}

	updatedGraph.ID = c.Param("id")

	result, err := database.Find(c.Request.Context(), updatedGraph.ToDatabase())
	if err != nil {
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Graph not found"})
		return
	}

	fetchedGraph := result.(*models.DBGraph).ToDomain()
	if updatedGraph.Name != "" {
		fetchedGraph.Name = updatedGraph.Name
	}

	if updatedGraph.Type != "" {
		fetchedGraph.Type = updatedGraph.Type
	}

	if updatedGraph.DataSource != "" {
		fetchedGraph.DataSource = updatedGraph.DataSource
	}

	res, err := database.Update(c.Request.Context(), fetchedGraph.ToDatabase())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	if res.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Graph not found"})
		return
	}

	c.JSON(http.StatusOK, fetchedGraph)
}

// DeleteGraph deletes a graph by ID.
// @Summary Delete a graph
// @Description delete a graph by ID
// @Tags graphs
// @Accept  json
// @Produce  json
// @Param id path string true "Graph ID"
// @Success 200 {string} string "Successfully deleted"
// @Failure 404 {object} models.HTTPError "Graph not found"
// @Router /graphs/{id} [delete]
func DeleteGraph(c *gin.Context) {
	var deleteGraph *models.Graph = &models.Graph{ID: c.Param("id")}

	result, err := database.Delete(c.Request.Context(), deleteGraph.ToDatabase())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: err.Error()})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Graph not found"})
		return
	}

	c.JSON(http.StatusOK, models.HTTPError{Code: http.StatusOK, Message: "Successfully Deleted"})
}
