package database

import (
	"context"
	"crypto/tls"
	"errors"
	"time"

	"github.com/Tchoukball-Tracker/pkg/logger"
	"github.com/Tchoukball-Tracker/pkg/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDB struct {
	client *mongo.Client
	db     *mongo.Database
}

func NewMongoDatabase() *MongoDB {
	return &MongoDB{}
}

func (mdb *MongoDB) Connect(connection string, dbName string) error {
	tlsConfig := tls.Config{
		InsecureSkipVerify: true,
	}
	clientOptions := options.Client().ApplyURI(connection).SetTLSConfig(&tlsConfig)
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var err error
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return err
	}

	if err = client.Ping(ctx, nil); err != nil {
		return err
	}
	mdb.client = client

	mdb.db = client.Database(dbName)
	logger.Log.Info("Successfully connected to MongoDB!")
	return nil
}

func (mdb *MongoDB) Disconnect() {
	if mdb.client != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := mdb.client.Disconnect(ctx); err != nil {
			logger.Log.Error("Error disconnecting from MongoDB: %v\n", err)
		} else {
			logger.Log.Info("Disconnected from MongoDB")
		}
	}
}

func (mdb *MongoDB) Insert(ctx context.Context, entity models.DatabaseEntity) (models.DatabaseEntity, error) {
	collection := mdb.db.Collection(entity.CollectionName())

	res, err := collection.InsertOne(ctx, entity)
	entity.SetID(res.InsertedID.(primitive.ObjectID))

	return entity, err
}

func (mdb *MongoDB) FindAll(ctx context.Context, entity models.DatabaseEntity) ([]models.DatabaseEntity, error) {
	collection := mdb.db.Collection(entity.CollectionName())

	// Create a cursor over all documents
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return []models.DatabaseEntity{}, err
	}
	defer cursor.Close(ctx)

	// Use a slice of the specific concrete type via entity.New()
	var results []models.DatabaseEntity
	for cursor.Next(ctx) {
		elem := entity.New()
		if err := cursor.Decode(elem); err != nil {
			return results, err
		}
		results = append(results, elem)
	}
	return results, cursor.Err()
}

func (mdb *MongoDB) Find(ctx context.Context, entity models.DatabaseEntity) (models.DatabaseEntity, error) {
	collection := mdb.db.Collection(entity.CollectionName())

	err := collection.FindOne(ctx, bson.M{"_id": entity.GetID()}).Decode(entity)
	return entity, err
}

func (mdb *MongoDB) FindByName(ctx context.Context, entity models.DatabaseEntity, name string) (models.DatabaseEntity, error) {
	collection := mdb.db.Collection(entity.CollectionName())

	result := collection.FindOne(ctx, bson.M{"name": name})
	if err := result.Err(); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("Failed to find result with this name")
		}

		return nil, err
	}

	err := result.Decode(entity)
	if err != nil {
		return nil, err
	}
	return entity, err
}

func (mdb *MongoDB) FindByValue(ctx context.Context, entity models.DatabaseEntity, filter bson.M) ([]models.DatabaseEntity, error) {
	collection := mdb.db.Collection(entity.CollectionName())

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []models.DatabaseEntity
	for cursor.Next(ctx) {
		elem := entity.New()
		if err := cursor.Decode(elem); err != nil {
			return nil, err
		}
		results = append(results, elem)
	}
	return results, cursor.Err()
}

func (mdb *MongoDB) Update(ctx context.Context, entity models.DatabaseEntity) (*mongo.UpdateResult, error) {
	collection := mdb.db.Collection(entity.CollectionName())

	result, err := collection.UpdateOne(
		ctx,
		bson.M{"_id": entity.GetID()},
		bson.D{{Key: "$set", Value: entity}},
	)

	return result, err
}

func (mdb *MongoDB) Delete(ctx context.Context, entity models.DatabaseEntity) (*mongo.DeleteResult, error) {
	collection := mdb.db.Collection(entity.CollectionName())

	result, err := collection.DeleteOne(ctx, bson.M{"_id": entity.GetID()})
	return result, err
}
