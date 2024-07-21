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
	router.POST("", Login)
}

// LoginRequest represents the payload for the login request
type LoginRequest struct {
	Username     string `json:"username"`
	Password     string `json:"password"`
	KeepLoggedIn bool   `json:"keep_logged_in"`
}

// Claims struct to hold JWT claims
type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// Login handles the login process
func Login(c *gin.Context) {
	var loginReq LoginRequest
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, models.HTTPError{Code: http.StatusBadRequest, Message: "Invalid request"})
		return
	}

	// Find user by username
	dbUser := &models.DBUser{Username: loginReq.Username}
	result, err := database.FindByValue(c.Request.Context(), dbUser, map[string]interface{}{"username": loginReq.Username})
	if err != nil || len(result) == 0 {
		c.JSON(http.StatusUnauthorized, models.HTTPError{Code: http.StatusUnauthorized, Message: "Invalid username or password"})
		return
	}

	user := result[0].(*models.DBUser)

	// Compare passwords
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, models.HTTPError{Code: http.StatusUnauthorized, Message: "Invalid username or password"})
		return
	}

	// Set token expiration time
	expirationTime := time.Now().Add(24 * time.Hour) // 24-hour token validity
	claims := &Claims{
		Username: user.Username,
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
	c.SetCookie("auth_token", tokenString, int(expirationTime.Unix()-time.Now().Unix()), "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{"status": "success", "auth_token": tokenString, "user": user.ToDomain()})
}
