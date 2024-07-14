package models

import (
	"github.com/Tchoukball-Tracker/pkg/utils"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Graph struct {
	ID         string `json:"id,omitempty"`
	Name       string `json:"name"`
	Type       string `json:"graphType"`
	DataSource string `json:"datasource"`
	// Position   *Position `json:"position"`
	// Size       *Size     `json:"size"`
}

type DBGraph struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	Name       string             `bson:"name"`
	Type       string             `bson:"type"`
	DataSource primitive.ObjectID `bson:"datasource,omitempty"`
	// Position   *DBPosition        `bson:"position,omitempty"`
	// Size       *DBSize            `bson:"size,omitempty"`
}

// GetName implements DatabaseEntity.
func (db *DBGraph) GetName() string {
	return db.Name
}

// SetName implements DatabaseEntity.
func (db *DBGraph) SetName(name string) {
	db.Name = name
}

// CollectionName implements MongoModel.
func (db *DBGraph) CollectionName() string {
	return "Graphs"
}

// GetID implements DatabaseEntity.
func (db *DBGraph) GetID() primitive.ObjectID {
	return db.ID
}

// SetID implements DatabaseEntity.
func (db *DBGraph) SetID(id primitive.ObjectID) {
	db.ID = id
}

// New implements DatabaseEntity.
func (db *DBGraph) New() DatabaseEntity {
	return &DBGraph{}
}

// func (db *DBGraph) SetPosition(position *DBPosition) {
// 	db.Position = position
// }

// func (db *DBGraph) SetSize(size *DBSize) {
// 	db.Size = size
// }

func (db *DBGraph) ToDomain() *Graph {
	graph := &Graph{
		ID:         db.ID.Hex(),
		Name:       db.Name,
		Type:       db.Type,
		DataSource: db.DataSource.Hex(),
		// Position:   db.Position.ToDomain(),
		// Size:       db.Size.ToDomain(),
	}

	if graph.DataSource == "000000000000000000000000" {
		graph.DataSource = ""
	}

	return graph
}

func (g *Graph) ToDatabase() *DBGraph {
	objID := utils.ConvertToMongoID(g.ID)
	dsID := utils.ConvertToMongoID(g.DataSource)

	return &DBGraph{
		ID:         objID,
		Name:       g.Name,
		Type:       g.Type,
		DataSource: dsID,
		// Position:   g.Position.ToDatabase(),
		// Size:       g.Size.ToDatabase(),
	}
}
