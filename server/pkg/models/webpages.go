package models

import (
	"github.com/Tchoukball-Tracker/pkg/utils"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Webpage struct {
	ID          string    `json:"id,omitempty"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	Src         string    `json:"src"`
	Size        *Size     `json:"size"`
	Position    *Position `json:"position"`
}

type DBWebpage struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Name        string             `bson:"name"`
	Description string             `bson:"description,omitempty"`
	Src         string             `bson:"src"`
	Size        *DBSize            `bson:"size"`
	Position    *DBPosition        `bson:"position"`
}

// GetName implements DatabaseEntity.
func (db *DBWebpage) GetName() string {
	return db.Name
}

// SetName implements DatabaseEntity.
func (db *DBWebpage) SetName(name string) {
	db.Name = name
}

// CollectionName implements MongoModel.
func (db *DBWebpage) CollectionName() string {
	return "Webpages"
}

// GetID implements DatabaseEntity.
func (db *DBWebpage) GetID() primitive.ObjectID {
	return db.ID
}

// SetID implements DatabaseEntity.
func (db *DBWebpage) SetID(id primitive.ObjectID) {
	db.ID = id
}

// New implements DatabaseEntity.
func (db *DBWebpage) New() DatabaseEntity {
	return &DBWebpage{}
}

func (db *DBWebpage) SetPosition(position *DBPosition) {
	db.Position = position
}

func (db *DBWebpage) SetSize(size *DBSize) {
	db.Size = size
}

func (db *DBWebpage) ToDomain() *Webpage {
	return &Webpage{
		ID:          db.ID.Hex(),
		Name:        db.Name,
		Description: db.Description,
		Src:         db.Src,
		Position:    db.Position.ToDomain(),
		Size:        db.Size.ToDomain(),
	}
}

func (w *Webpage) ToDatabase() *DBWebpage {
	objID := utils.ConvertToMongoID(w.ID)
	return &DBWebpage{
		ID:          objID,
		Name:        w.Name,
		Description: w.Description,
		Src:         w.Src,
		Size:        w.Size.ToDatabase(),
		Position:    w.Position.ToDatabase(),
	}
}
