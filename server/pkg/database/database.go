package database

import (
	"context"

	"github.com/Tchoukball-Tracker/pkg/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	database models.Database
)

func Connect(connection string, dbName string) error {
	database = NewMongoDatabase()
	return database.Connect(connection, dbName)
}

func Disconnect() {
	database.Disconnect()
}

func Insert(ctx context.Context, entity models.DatabaseEntity) (models.DatabaseEntity, error) {
	return database.Insert(ctx, entity)
}

func FindAll(ctx context.Context, entity models.DatabaseEntity) ([]models.DatabaseEntity, error) {
	return database.FindAll(ctx, entity)
}

func Find(ctx context.Context, entity models.DatabaseEntity) (models.DatabaseEntity, error) {
	return database.Find(ctx, entity)
}

func FindByName(ctx context.Context, entity models.DatabaseEntity, name string) (models.DatabaseEntity, error) {
	return database.FindByName(ctx, entity, name)
}

func FindByValue(ctx context.Context, entity models.DatabaseEntity, filter bson.M) ([]models.DatabaseEntity, error) {
	return database.FindByValue(ctx, entity, filter)
}

func Update(ctx context.Context, entity models.DatabaseEntity) (*mongo.UpdateResult, error) {
	return database.Update(ctx, entity)
}

func Delete(ctx context.Context, entity models.DatabaseEntity) (*mongo.DeleteResult, error) {
	return database.Delete(ctx, entity)
}
