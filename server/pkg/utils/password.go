// utils/password.go
package utils

import "golang.org/x/crypto/bcrypt"

// HashPassword hashes the given password with a cost of 5
func HashPassword(password string) (string, error) {
	const cost = 5
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), cost)
	return string(bytes), err
}

// CheckPasswordHash compares a hashed password with a plain text one
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
