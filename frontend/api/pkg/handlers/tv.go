package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"

	"github.com/gin-gonic/gin"
)

type TvHandler struct {
	DB *sql.DB
}

func NewTvHandler(db *sql.DB) *TvHandler {
	return &TvHandler{DB: db}
}

func (h *TvHandler) GetTvDetails(c *gin.Context) {
	tvID := c.Param("id")
	apiKey := os.Getenv("TMDB_API_KEY")

	urls := map[string]string{
		"details":         fmt.Sprintf("https://api.themoviedb.org/3/tv/%s?api_key=%s", tvID, apiKey),
		"credits":         fmt.Sprintf("https://api.themoviedb.org/3/tv/%s/credits?api_key=%s", tvID, apiKey),
		"videos":          fmt.Sprintf("https://api.themoviedb.org/3/tv/%s/videos?api_key=%s", tvID, apiKey),
		"recommendations": fmt.Sprintf("https://api.themoviedb.org/3/tv/%s/recommendations?api_key=%s", tvID, apiKey),
	}

	var wg sync.WaitGroup
	results := make(map[string]json.RawMessage)
	var mu sync.Mutex

	for key, url := range urls {
		wg.Add(1)
		go func(key, url string) {
			defer wg.Done()
			resp, err := http.Get(url)
			if err != nil {
				return
			}
			defer resp.Body.Close()
			body, err := io.ReadAll(resp.Body)
			if err != nil {
				return
			}
			mu.Lock()
			results[key] = json.RawMessage(body)
			mu.Unlock()
		}(key, url)
	}
	wg.Wait()

	reviewQuery := `
		SELECT r.id, r.rating, r.comment, r.created_at, u.username, u.profile_picture_url
		FROM reviews r
		JOIN users u ON r.user_id = u.id
		WHERE r.media_id = $1 AND r.media_type = 'tv'
		ORDER BY r.created_at DESC
	`
	rows, err := h.DB.Query(reviewQuery, tvID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}
	defer rows.Close()

	var reviews []gin.H
	for rows.Next() {
		var review struct {
			ID                int
			Rating            int
			Comment           string
			CreatedAt         string
			Username          string
			ProfilePictureURL sql.NullString
		}
		if err := rows.Scan(&review.ID, &review.Rating, &review.Comment, &review.CreatedAt, &review.Username, &review.ProfilePictureURL); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan review"})
			return
		}
		reviews = append(reviews, gin.H{
			"id":                review.ID,
			"rating":            review.Rating,
			"comment":           review.Comment,
			"createdAt":         review.CreatedAt,
			"username":          review.Username,
			"profilePictureUrl": review.ProfilePictureURL.String,
		})
	}

	results["reviews"] = func() json.RawMessage {
		b, _ := json.Marshal(reviews)
		return json.RawMessage(b)
	}()

	c.JSON(http.StatusOK, results)
}