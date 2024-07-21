// models/user.go
package models

import (
	"github.com/Tchoukball-Tracker/pkg/utils"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID       string `json:"id,omitempty"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type DBUser struct {
	ID       primitive.ObjectID `bson:"_id,omitempty"`
	Username string             `bson:"username"`
	Password string             `bson:"password"`
}

// ToDomain converts DBUser to User
func (db *DBUser) ToDomain() *User {
	return &User{
		ID:       db.ID.Hex(),
		Username: db.Username,
		Password: db.Password,
	}
}

// ToDatabase converts User to DBUser
func (u *User) ToDatabase() *DBUser {
	objID := utils.ConvertToMongoID(u.ID)

	return &DBUser{
		ID:       objID,
		Username: u.Username,
		Password: u.Password,
	}
}

// CollectionName implements DatabaseEntity.
func (db *DBUser) CollectionName() string {
	return "Users"
}

// GetID implements DatabaseEntity.
func (db *DBUser) GetID() primitive.ObjectID {
	return db.ID
}

// SetID implements DatabaseEntity.
func (db *DBUser) SetID(id primitive.ObjectID) {
	db.ID = id
}

// New implements DatabaseEntity.
func (db *DBUser) New() DatabaseEntity {
	return &DBUser{}
}
