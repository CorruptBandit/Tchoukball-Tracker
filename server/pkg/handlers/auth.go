// handlers/auth.go
package handlers

import (
	"net/http"
	"os"
	"time"

	"github.com/Tchoukball-Tracker/pkg/database"
	"github.com/Tchoukball-Tracker/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET_KEY"))

func RegisterAuthRoutes(router *gin.RouterGroup) {
	router.POST("", login)
	router.POST("/jwt", validateToken)
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
		c.JSON(http.StatusNotFound, models.HTTPError{Code: http.StatusNotFound, Message: "Failed to find username"})
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

	// Determine if the environment is set to release mode for HTTPS
	secure := false
	if gin.Mode() == gin.ReleaseMode {
		secure = true
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.HTTPError{Code: http.StatusInternalServerError, Message: "Could not generate token"})
		return
	}

	// Set the JWT token as an HTTP-only cookie (XSS) and SameSite (CSRF)
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie("auth_token", tokenString, int(expirationTime.Unix()-time.Now().Unix()), "/", "", secure, true)
	c.JSON(http.StatusOK, models.HTTPSuccess{Code: http.StatusOK, Message: "Logged in as: " + user.Name})
}

// validateToken checks the validity of the provided JWT token
func validateToken(c *gin.Context) {
	tokenString, err := c.Cookie("auth_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.HTTPError{Code: http.StatusUnauthorized, Message: "No token found"})
		return
	}

	claims := &models.Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, models.HTTPError{Code: http.StatusUnauthorized, Message: "Invalid token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"valid": true})
}
