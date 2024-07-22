// handlers/auth.go
package handlers

import (
	"net/http"
	"os"
	"time"

	"github.com/Tchoukball-Tracker/pkg/database"
	"github.com/Tchoukball-Tracker/pkg/logger"
	"github.com/Tchoukball-Tracker/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET_KEY"))

func RegisterAuthRoutes(router *gin.RouterGroup) {
	router.POST("", login)
	router.POST("/jwt", login)
}

type LoginRequest struct {
	Username     string `json:"username"`
	Password     string `json:"password"`
	KeepLoggedIn bool   `json:"keep_logged_in"`
}

// Login handles the login process
func login(c *gin.Context) {
	var loginRequest LoginRequest
	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(http.StatusBadRequest, models.HTTPError{Code: http.StatusBadRequest, Message: "Invalid request"})
		return
	}

	// Find user by username
	result, err := database.FindByName(c.Request.Context(), &models.User{}, loginRequest.Username)
	if err != nil {
		logger.Log.Error(err)
		c.JSON(http.StatusUnauthorized, models.HTTPError{Code: http.StatusUnauthorized, Message: "Invalid username or password"})
		return
	}

	user := result.(*models.User)

	// Compare passwords
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginRequest.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, models.HTTPError{Code: http.StatusUnauthorized, Message: "Invalid username or password"})
		return
	}

	// Set token expiration time
	expirationTime := time.Now().Add(168 * time.Hour) // 7-day token validity
	claims := &models.Claims{
		Username: user.Name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: "Could not generate token"})
		return
	}

	// Set the JWT token as an HTTP-only cookie
	c.SetCookie("auth_token", tokenString, int(expirationTime.Unix()-time.Now().Unix()), "/", "", false, false)
	c.JSON(http.StatusOK, models.HTTPSuccess{Code: http.StatusOK, Message: "Logged in as: " + user.Name})
}
