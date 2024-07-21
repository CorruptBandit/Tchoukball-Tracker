package models

import "go.mongodb.org/mongo-driver/bson/primitive"

// Spreadsheet reflects the expected structure of JSON data.
type Spreadsheet struct {
	ID   primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name string             `bson:"name" json:"name"`
	Data interface{}        `bson:"data" json:"data"`
}

// Implement the DatabaseEntity interface for Spreadsheet
func (s Spreadsheet) CollectionName() string {
	return "Spreadsheet"
}

func (s *Spreadsheet) New() DatabaseEntity {
	return &Spreadsheet{}
}

func (s *Spreadsheet) SetID(id primitive.ObjectID) {
	s.ID = id
}

func (s Spreadsheet) GetID() primitive.ObjectID {
	return s.ID
}
