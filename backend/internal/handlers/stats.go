package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

type StatsHandler struct {
	DB *sql.DB
}

func NewStatsHandler(db *sql.DB) *StatsHandler {
	return &StatsHandler{DB: db}
}

type WatchlistStatItem struct {
	Status string `json:"status"`
	Count  int    `json:"count"`
}

type UserStats struct {
	WatchlistStats []WatchlistStatItem `json:"watchlistStats"`
	MeanScore      float64             `json:"meanScore"`
	TotalEntries   int                 `json:"totalEntries"`
	ReviewsCount   int                 `json:"reviewsCount"`
}

func (h *StatsHandler) GetUserStats(c *gin.Context) {
	username := c.Param("username")
	var userID int
	
	userQuery := `SELECT id FROM users WHERE username = $1`
	err := h.DB.QueryRow(userQuery, username).Scan(&userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	stats := UserStats{
			WatchlistStats: make([]WatchlistStatItem, 0),
			}

	statsQuery := `
		SELECT status, COUNT(*) 
		FROM watchlist_items 
		WHERE user_id = $1 
		GROUP BY status
	`
	rows, err := h.DB.Query(statsQuery, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch watchlist stats"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var item WatchlistStatItem
		if err := rows.Scan(&item.Status, &item.Count); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan stat item"})
			return
		}
		stats.WatchlistStats = append(stats.WatchlistStats, item)
		stats.TotalEntries += item.Count
	}

	scoreQuery := `SELECT COALESCE(AVG(rating), 0), COUNT(*) FROM reviews WHERE user_id = $1`
	err = h.DB.QueryRow(scoreQuery, userID).Scan(&stats.MeanScore, &stats.ReviewsCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch score stats"})
		return
	}

	c.JSON(http.StatusOK, stats)
}