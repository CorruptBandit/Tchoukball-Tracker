package middleware

import (
	"net/http"
	"os"

	"github.com/Tchoukball-Tracker/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET_KEY"))

func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("auth_token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, models.HTTPError{Code: http.StatusUnauthorized, Message: "No token found"})
			c.Abort()
			return
		}

		claims := &models.Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, models.HTTPError{Code: http.StatusUnauthorized, Message: "Invalid token"})
			c.Abort()
			return
		}

		c.Next()
	}
}
