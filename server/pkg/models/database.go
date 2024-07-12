package models

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Database interface {
	Connect(connection string, dbName string) error
	Disconnect()
	Insert(ctx context.Context, entity DatabaseEntity) (DatabaseEntity, error)
	FindAll(ctx context.Context, entity DatabaseEntity) ([]DatabaseEntity, error)
	Find(ctx context.Context, entity DatabaseEntity) (DatabaseEntity, error)
	FindByName(ctx context.Context, entity DatabaseEntity, name string) (DatabaseEntity, error)
	FindByValue(ctx context.Context, entity DatabaseEntity, filter bson.M) ([]DatabaseEntity, error)
	Update(ctx context.Context, entity DatabaseEntity) (*mongo.UpdateResult, error)
	Delete(ctx context.Context, entity DatabaseEntity) (*mongo.DeleteResult, error)
}

type DatabaseEntity interface {
	CollectionName() string    // Returns the MongoDB collection name.
	New() DatabaseEntity       // Method to instantiate a new object of the same type.
	GetID() primitive.ObjectID // Retrieves the MongoDB ObjectID.
	SetID(primitive.ObjectID)  // Sets the MongoDB ObjectID.
	GetName() string           // Get the MongoDB Object name
	SetName(string)            // Set the MongoDB Object name
}

type ComponentDatabaseEntity interface {
	DatabaseEntity
	SetSize(*DBSize)
	SetPosition(*DBPosition)
}
