package database

import (
	"context"
	"reflect"

	"github.com/Tchoukball-Tracker/pkg/logger"
	"github.com/Tchoukball-Tracker/pkg/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"gopkg.in/mgo.v2/bson"
)

type MockDB struct {
	Data map[primitive.ObjectID]models.DatabaseEntity
}

func NewMockDB() *MockDB {
	return &MockDB{
		Data: make(map[primitive.ObjectID]models.DatabaseEntity),
	}
}

func (mdb *MockDB) Connect(_, _ string) error {
	return nil
}

func (mdb *MockDB) Disconnect() {
	// No operation needed for mock
}

func (mdb *MockDB) Insert(_ context.Context, entity models.DatabaseEntity) (models.DatabaseEntity, error) {
	oid := primitive.NewObjectID()
	entity.SetID(oid)
	mdb.Data[oid] = entity
	return entity, nil
}

func (mdb *MockDB) FindAll(_ context.Context, entity models.DatabaseEntity) ([]models.DatabaseEntity, error) {
	results := make([]models.DatabaseEntity, 0, len(mdb.Data))
	for _, v := range mdb.Data {
		if v.CollectionName() == entity.CollectionName() {
			results = append(results, v)
		}
	}
	return results, nil
}

func (mdb *MockDB) Find(_ context.Context, entity models.DatabaseEntity) (models.DatabaseEntity, error) {
	for _, v := range mdb.Data {
		if v.GetID() == entity.GetID() {
			return v, nil
		}
	}
	return nil, mongo.ErrNoDocuments
}

func (mdb *MockDB) FindByName(_ context.Context, _ models.DatabaseEntity, name string) (models.DatabaseEntity, error) {
	return nil, mongo.ErrNoDocuments
}

func (mdb *MockDB) FindByValue(_ context.Context, _ models.DatabaseEntity, filter primitive.M) ([]models.DatabaseEntity, error) {
	results := []models.DatabaseEntity{}

	// Iterate over each document in the mock database
	for _, doc := range mdb.Data {
		// Marshal the document into BSON
		bsonData, err := bson.Marshal(doc)
		if err != nil {
			logger.Log.Error("Failed to marshal BSON:", err)
			return nil, err
		}

		// Unmarshal into a map for easier comparison
		var docMap map[string]interface{}
		err = bson.Unmarshal(bsonData, &docMap)
		if err != nil {
			logger.Log.Error("Failed to unmarshal BSON:", err)
			return nil, err
		}

		// Check if the document matches the filter
		match := true
		for key, filterValue := range filter {
			if value, ok := docMap[key]; ok {
				if !reflect.DeepEqual(value, filterValue) {
					match = false
					break
				}
			} else {
				match = false
				break
			}
		}

		if match {
			results = append(results, doc)
		}
	}
	return results, nil
}

func (mdb *MockDB) Update(_ context.Context, entity models.DatabaseEntity) (*mongo.UpdateResult, error) {
	if _, ok := mdb.Data[entity.GetID()]; ok {
		mdb.Data[entity.GetID()] = entity
		return &mongo.UpdateResult{MatchedCount: 1, ModifiedCount: 1}, nil
	}
	return &mongo.UpdateResult{}, nil
}

func (mdb *MockDB) Delete(_ context.Context, entity models.DatabaseEntity) (*mongo.DeleteResult, error) {
	if _, ok := mdb.Data[entity.GetID()]; ok {
		delete(mdb.Data, entity.GetID())
		return &mongo.DeleteResult{DeletedCount: 1}, nil
	}
	return &mongo.DeleteResult{DeletedCount: 0}, nil
}
