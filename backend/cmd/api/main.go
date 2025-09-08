package main

import (
	"log"
	"os"

	"github.com/DarrenAnthonyBeltham/cinelume/backend/internal/database"
	"github.com/DarrenAnthonyBeltham/cinelume/backend/internal/routes"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	db := database.Connect()
	defer db.Close()

	router := routes.SetupRoutes(db)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server starting on http://localhost:%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}