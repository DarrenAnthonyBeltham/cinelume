package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ReviewHandler struct {
	DB *sql.DB
}

func NewReviewHandler(db *sql.DB) *ReviewHandler {
	return &ReviewHandler{DB: db}
}

type ReviewPayload struct {
	MediaID         int    `json:"mediaId" binding:"required"`
	MediaType       string `json:"mediaType" binding:"required"`
	MediaTitle      string `json:"mediaTitle" binding:"required"`
	MediaPosterPath string `json:"mediaPosterPath"`
	Rating          int    `json:"rating" binding:"required,min=1,max=10"`
	Comment         string `json:"comment"`
}

func (h *ReviewHandler) AddReview(c *gin.Context) {
	userID, _ := c.Get("userID")

	var payload ReviewPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `
		INSERT INTO reviews (user_id, media_id, media_type, rating, comment, media_title, media_poster_path)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (user_id, media_id, media_type)
		DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = CURRENT_TIMESTAMP
	`
	_, err := h.DB.Exec(query, userID, payload.MediaID, payload.MediaType, payload.Rating, payload.Comment, payload.MediaTitle, payload.MediaPosterPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add or update review"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Review submitted successfully"})
}

func (h *ReviewHandler) UpdateReview(c *gin.Context) {
	userID, _ := c.Get("userID")
	reviewID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid review ID"})
		return
	}

	var payload struct {
		Rating  int    `json:"rating" binding:"required,min=1,max=10"`
		Comment string `json:"comment"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `
		UPDATE reviews SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id = $3 AND user_id = $4
	`
	res, err := h.DB.Exec(query, payload.Rating, payload.Comment, reviewID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update review"})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only edit your own reviews"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review updated successfully"})
}