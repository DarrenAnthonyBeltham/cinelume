package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type TMDBHandler struct{}

func NewTMDBHandler() *TMDBHandler {
	return &TMDBHandler{}
}

func (h *TMDBHandler) Proxy(endpoint string) gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := os.Getenv("TMDB_API_KEY")
		if apiKey == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Server configuration error"})
			return
		}

		tmdbURL := fmt.Sprintf("https://api.themoviedb.org/3/%s?api_key=%s&language=en-US&page=1", endpoint, apiKey)
		
		resp, err := http.Get(tmdbURL)
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Failed to fetch data from TMDB"})
			return
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
			return
		}

		if resp.StatusCode != http.StatusOK {
			c.JSON(resp.StatusCode, gin.H{"error": "Error from TMDB API"})
			return
		}
		c.Data(http.StatusOK, "application/json; charset=utf-8", body)
	}
}