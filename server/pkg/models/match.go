package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Match struct {
	ID        primitive.ObjectID            `json:"id,omitempty" bson:"_id,omitempty"`
	Name      string                        `json:"name" bson:"name"`
	Thirds    map[string]primitive.ObjectID `json:"thirds" bson:"thirds"`
	CreatedAt time.Time                     `json:"created_at" bson:"created_at"`
}

// CollectionName implements MongoModel.
func (db *Match) CollectionName() string {
	return "Matches"
}

// GetID implements DatabaseEntity.
func (db *Match) GetID() primitive.ObjectID {
	return db.ID
}

// SetID implements DatabaseEntity.
func (db *Match) SetID(id primitive.ObjectID) {
	db.ID = id
}

// New implements DatabaseEntity.
func (db *Match) New() DatabaseEntity {
	return &Match{}
}
