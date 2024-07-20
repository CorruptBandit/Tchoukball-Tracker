package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Spreadsheet struct {
	ID   primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name string             `json:"name" bson:"name"`
	Data []interface{}      `json:"data" bson:"data,omitempty"`
}

// CollectionName implements MongoModel.
func (db *Spreadsheet) CollectionName() string {
	return "Spreadsheet"
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
