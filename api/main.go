package handler

import (
	"net/http"
	"sync"

	"github.com/DarrenAnthonyBeltham/cinelume/api/pkg/database"
	"github.com/DarrenAnthonyBeltham/cinelume/api/pkg/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var (
	router *gin.Engine
	once   sync.Once
)

func setupRouter() *gin.Engine {
	_ = godotenv.Load(".env", ".env.local")
	db := database.Connect()
	return routes.SetupRoutes(db)
}

func Handler(w http.ResponseWriter, r *http.Request) {
	once.Do(func() { router = setupRouter() })
	router.ServeHTTP(w, r)
}
