// handlers/auth.go
package handlers

import (
	"net/http"

	"github.com/Tchoukball-Tracker/pkg/database"
	"github.com/Tchoukball-Tracker/pkg/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func RegisterAuthRoutes(router *gin.RouterGroup) {
	router.POST("", Login)
}

// LoginRequest represents the payload for the login request
type LoginRequest struct {
	Username     string `json:"username"`
	Password     string `json:"password"`
	KeepLoggedIn bool   `json:"keep_logged_in"`
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

	// Generate token (implementation of token generation is skipped)
	token := "generated_jwt_token"

	c.JSON(http.StatusOK, gin.H{"status": "success", "auth_token": token, "user": user.ToDomain()})
}
