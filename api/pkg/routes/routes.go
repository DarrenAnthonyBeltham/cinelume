package routes

import (
	"database/sql"
	"net/http"
	"os"
	"strings"

	"github.com/DarrenAnthonyBeltham/cinelume/api/pkg/handlers"
	"github.com/DarrenAnthonyBeltham/cinelume/api/pkg/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(db *sql.DB) *gin.Engine {
	router := gin.Default()
	router.Use(corsMiddleware())

	api := router.Group("/api")

	tmdbHandler := handlers.NewTMDBHandler()
	userHandler := handlers.NewUserHandler(db)
	statsHandler := handlers.NewStatsHandler(db)
	watchlistHandler := handlers.NewWatchlistHandler(db)
	reviewHandler := handlers.NewReviewHandler(db)
	movieHandler := handlers.NewMovieHandler(db)
	tvHandler := handlers.NewTvHandler(db)
	searchHandler := handlers.NewSearchHandler()

	api.GET("/search", searchHandler.Search)

	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"ok":   true,
			"tmdb": os.Getenv("TMDB_API_KEY") != "",
			"db":   os.Getenv("DATABASE_URL") != "",
		})
	})

	api.GET("/movie/:id", movieHandler.GetMovieDetails)
	api.GET("/tv/:id", tvHandler.GetTvDetails)

	api.POST("/users/register", userHandler.Register)
	api.POST("/users/login", userHandler.Login)
	api.GET("/users/:username/stats", statsHandler.GetUserStats)
	api.GET("/users/:username/reviews", statsHandler.GetUserReviews)

	api.GET("/movies/popular", tmdbHandler.Proxy("movie/popular"))
	api.GET("/movies/top_rated", tmdbHandler.Proxy("movie/top_rated"))
	api.GET("/movies/upcoming", tmdbHandler.Proxy("movie/upcoming"))
	api.GET("/genres/movie", tmdbHandler.Proxy("genre/movie/list"))

	api.GET("/tv/popular", tmdbHandler.Proxy("tv/popular"))
	api.GET("/tv/top_rated", tmdbHandler.Proxy("tv/top_rated"))
	api.GET("/genres/tv", tmdbHandler.Proxy("genre/tv/list"))

	api.GET("/trending/all/day", tmdbHandler.Proxy("trending/all/day"))

	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/users/profile", userHandler.GetProfile)
		protected.PUT("/users/profile", userHandler.UpdateProfile)
		protected.PUT("/users/password", userHandler.UpdatePassword)
		protected.GET("/users/upload-signature", userHandler.GetUploadSignature)

		protected.POST("/watchlist", watchlistHandler.AddItem)
		protected.GET("/watchlist", watchlistHandler.GetWatchlist)
		protected.DELETE("/watchlist/:id", watchlistHandler.RemoveItem)

		protected.POST("/reviews", reviewHandler.AddReview)
		protected.PUT("/reviews/:id", reviewHandler.UpdateReview)
	}

	return router
}

func corsMiddleware() gin.HandlerFunc {
	allowed := strings.Split(os.Getenv("ALLOW_ORIGINS"), ",")
	for i := range allowed {
		allowed[i] = strings.TrimSpace(allowed[i])
	}
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		allow := ""
		for _, a := range allowed {
			if a == "" {
				continue
			}
			if a == origin {
				allow = origin
				break
			}
			if strings.HasPrefix(a, "https://*.") && strings.HasPrefix(origin, "https://") {
				d := strings.TrimPrefix(a, "https://*.")
				if strings.HasSuffix(origin, "."+d) {
					allow = origin
					break
				}
			}
		}
		if allow != "" {
			c.Header("Access-Control-Allow-Origin", allow)
			c.Header("Vary", "Origin")
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept, Authorization, X-Requested-With")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		}
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
