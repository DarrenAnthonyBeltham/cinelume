package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func Connect() *sql.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	if err := db.Ping(); err != nil {
		log.Fatalf("Database ping failed: %v\n", err)
	}

	log.Println("Database connection successful.")
	return db
}