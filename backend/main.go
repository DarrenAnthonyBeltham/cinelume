package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found")
	}

	router := gin.Default()
	router.Use(corsMiddleware())

	api := router.Group("/api")
	{
		api.GET("/movies/popular", tmdbProxyHandler("movie/popular"))
		api.GET("/tv/top_rated", tmdbProxyHandler("tv/top_rated"))
		api.GET("/trending/all/day", tmdbProxyHandler("trending/all/day"))
		api.GET("/movies/upcoming", tmdbProxyHandler("movie/upcoming"))
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("🚀 Server starting on port %s", port)
	router.Run(":" + port)
}

func tmdbProxyHandler(endpoint string) gin.HandlerFunc {
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
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response from TMDB"})
			return
		}

		if resp.StatusCode != http.StatusOK {
			c.JSON(resp.StatusCode, gin.H{"error": "Error from TMDB API", "details": string(body)})
			return
		}

		c.Data(http.StatusOK, "application/json; charset=utf-8", body)
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", os.Getenv("ALLOW_ORIGIN"))
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}