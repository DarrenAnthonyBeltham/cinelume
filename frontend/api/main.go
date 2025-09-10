package handler

import (
	"log"
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
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}
	db := database.Connect()
	r := routes.SetupRoutes(db)
	return r
}

func Handler(w http.ResponseWriter, r *http.Request) {
	once.Do(func() {
		router = setupRouter()
	})
	router.ServeHTTP(w, r)
}