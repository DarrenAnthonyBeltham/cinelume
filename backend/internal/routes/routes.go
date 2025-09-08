package routes

import (
	"database/sql"
	"os"

	"github.com/DarrenAnthonyBeltham/cinelume/backend/internal/handlers"
	"github.com/DarrenAnthonyBeltham/cinelume/backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(db *sql.DB) *gin.Engine {
	router := gin.Default()
	router.Use(corsMiddleware())

	tmdbHandler := handlers.NewTMDBHandler()
	userHandler := handlers.NewUserHandler(db)
	statsHandler := handlers.NewStatsHandler(db)
	watchlistHandler := handlers.NewWatchlistHandler(db)

	api := router.Group("/api")
	{
		api.GET("/movies/popular", tmdbHandler.Proxy("movie/popular"))
		api.GET("/tv/top_rated", tmdbHandler.Proxy("tv/top_rated"))
		api.GET("/trending/all/day", tmdbHandler.Proxy("trending/all/day"))
		api.GET("/movies/upcoming", tmdbHandler.Proxy("movie/upcoming"))

		api.POST("/users/register", userHandler.Register)
		api.POST("/users/login", userHandler.Login)

		api.GET("/users/:username/stats", statsHandler.GetUserStats)

		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/users/profile", userHandler.GetProfile)
			protected.PUT("/users/profile", userHandler.UpdateProfile)
			protected.PUT("/users/password", userHandler.UpdatePassword)

			protected.POST("/watchlist", watchlistHandler.AddItem)
			protected.GET("/watchlist", watchlistHandler.GetWatchlist)
			protected.DELETE("/watchlist/:id", watchlistHandler.RemoveItem)
		}
	}

	return router
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", os.Getenv("ALLOW_ORIGIN"))
		c.Writer.Header().Set("Access-control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}