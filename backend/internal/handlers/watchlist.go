package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

type WatchlistHandler struct {
	DB *sql.DB
}

func NewWatchlistHandler(db *sql.DB) *WatchlistHandler {
	return &WatchlistHandler{DB: db}
}

type WatchlistItemPayload struct {
	MediaID    int    `json:"mediaId" binding:"required"`
	MediaType  string `json:"mediaType" binding:"required"`
	Title      string `json:"title" binding:"required"`
	PosterPath string `json:"posterPath"`
	Status     string `json:"status" binding:"required"`
}

func (h *WatchlistHandler) AddItem(c *gin.Context) {
	userID, _ := c.Get("userID")

	var payload WatchlistItemPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `
		INSERT INTO watchlist_items (user_id, media_id, media_type, title, poster_path, status)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (user_id, media_id, media_type) 
		DO UPDATE SET status = EXCLUDED.status, added_at = CURRENT_TIMESTAMP
	`
	_, err := h.DB.Exec(query, userID, payload.MediaID, payload.MediaType, payload.Title, payload.PosterPath, payload.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add or update item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item added to watchlist successfully"})
}

func (h *WatchlistHandler) GetWatchlist(c *gin.Context) {
	userID, _ := c.Get("userID")

	query := `
		SELECT 
			wi.id, wi.media_id, wi.media_type, wi.title, wi.poster_path, wi.status, wi.added_at,
			COALESCE(r.rating, 0) as user_rating
		FROM watchlist_items wi
		LEFT JOIN reviews r ON wi.user_id = r.user_id AND wi.media_id = r.media_id AND wi.media_type = r.media_type
		WHERE wi.user_id = $1 
		ORDER BY wi.added_at DESC
	`
	rows, err := h.DB.Query(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve watchlist"})
		return
	}
	defer rows.Close()

	var items []gin.H
	for rows.Next() {
		var item struct {
			ID         int
			MediaID    int
			MediaType  string
			Title      string
			PosterPath string
			Status     string
			AddedAt    string
			UserRating int
		}
		if err := rows.Scan(&item.ID, &item.MediaID, &item.MediaType, &item.Title, &item.PosterPath, &item.Status, &item.AddedAt, &item.UserRating); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan watchlist item"})
			return
		}
		items = append(items, gin.H{
			"id":         item.ID,
			"mediaId":    item.MediaID,
			"mediaType":  item.MediaType,
			"title":      item.Title,
			"posterPath": item.PosterPath,
			"status":     item.Status,
			"addedAt":    item.AddedAt,
			"rating":     item.UserRating,
		})
	}

	c.JSON(http.StatusOK, items)
}

func (h *WatchlistHandler) RemoveItem(c *gin.Context) {
	userID, _ := c.Get("userID")
	mediaID := c.Param("id")

	query := `DELETE FROM watchlist_items WHERE user_id = $1 AND media_id = $2`
	result, err := h.DB.Exec(query, userID, mediaID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove item"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found in watchlist"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item removed successfully"})
}