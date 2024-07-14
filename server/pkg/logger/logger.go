package logger

import (
	"os"

	"github.com/sirupsen/logrus"
)

var Log *logrus.Logger

func init() {
	Log = logrus.New()
	Log.Out = os.Stdout
	Log.Formatter = &logrus.JSONFormatter{}

	Log.Level = logrus.DebugLevel // logrus.WarnLevel in production
}
