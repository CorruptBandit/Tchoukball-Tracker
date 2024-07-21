package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Spreadsheet struct {
	ID      primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name    string             `json:"name" bson:"name"`
	Players []*Player          `json:"players" bson:"players"`
}

// CollectionName implements MongoModel.
func (db *Spreadsheet) CollectionName() string {
	return "Spreadsheets"
}

// GetID implements DatabaseEntity.
func (db *Spreadsheet) GetID() primitive.ObjectID {
	return db.ID
}

// SetID implements DatabaseEntity.
func (db *Spreadsheet) SetID(id primitive.ObjectID) {
	db.ID = id
}

// New implements DatabaseEntity.
func (db *Spreadsheet) New() DatabaseEntity {
	return &Spreadsheet{}
}

func (db *Spreadsheet) FindPlayer(name string) *Player {
	for _, player := range db.Players {
		if player.Name == name {
			return player
		}
	}
	return nil
}
