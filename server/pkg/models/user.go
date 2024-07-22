// models/user.go
package models

import (
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// LoginRequest represents the payload for the login request
type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name         string             `bson:"name" json:"name"`
	Password     string             `json:"password"`
	KeepLoggedIn bool               `json:"keep_logged_in"`
}

// Claims struct to hold JWT claims
type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// CollectionName implements DatabaseEntity.
func (db *User) CollectionName() string {
	return "Users"
}

// GetID implements DatabaseEntity.
func (db *User) GetID() primitive.ObjectID {
	return db.ID
}

// SetID implements DatabaseEntity.
func (db *User) SetID(id primitive.ObjectID) {
	db.ID = id
}

// New implements DatabaseEntity.
func (db *User) New() DatabaseEntity {
	return &User{}
}
