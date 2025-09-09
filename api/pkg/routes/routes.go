package routes

import (
	"database/sql"
	"os"

	"cinelume/api/pkg/handlers"
	"cinelume/api/pkg/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(db *sql.DB) *gin.Engine {
	router := gin.Default()
	router.Use(corsMiddleware())

	tmdbHandler := handlers.NewTMDBHandler()
	userHandler := handlers.NewUserHandler(db)
	statsHandler := handlers.NewStatsHandler(db)
	watchlistHandler := handlers.NewWatchlistHandler(db)
	reviewHandler := handlers.NewReviewHandler(db)
	movieHandler := handlers.NewMovieHandler(db)
	tvHandler := handlers.NewTvHandler(db)
	searchHandler := handlers.NewSearchHandler()

	api := router.Group("/api")
	{
		api.GET("/search", searchHandler.Search)

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
	}

	return router
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