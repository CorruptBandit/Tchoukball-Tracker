package utils

import (
	"github.com/Tchoukball-Tracker/pkg/logger"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ConvertToMongoID converts a hex string to a MongoDB ObjectID, logging any errors.
func ConvertToMongoID(hexID string) primitive.ObjectID {
	if hexID == "" {
		return primitive.NilObjectID
	}

	objID, err := primitive.ObjectIDFromHex(hexID)
	if err != nil {
		logger.Log.Errorf("Failed to parse ObjectID from '%s': %v", hexID, err)
		return primitive.NilObjectID
	}
	return objID
}
