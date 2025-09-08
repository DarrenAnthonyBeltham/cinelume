package models

import "time"

type User struct {
	ID                int       `json:"id"`
	Username          string    `json:"username"`
	Email             string    `json:"email"`
	PasswordHash      string    `json:"-"`
	ProfilePictureURL *string   `json:"profilePictureUrl"` 
	Description       *string   `json:"description"`      
	CreatedAt         time.Time `json:"createdAt"`
}

type RegisterPayload struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type LoginPayload struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UpdateProfilePayload struct {
	Username          string `json:"username" binding:"required"`
	Email             string `json:"email" binding:"required,email"`
	Description       string `json:"description"`
	ProfilePictureURL string `json:"profilePictureUrl"`
}