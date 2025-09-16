//! Defining application state.
use std::env;
use dotenvy::dotenv;
use sqlx::postgres::PgPool;

#[derive(Debug)]
pub struct AppState {
    // Postgres sqlx connection pool
    pub db: PgPool,
}

impl AppState {
    pub async fn new() -> Self {
        dotenv().ok();
        // Getting the db env var connection string.
        let db_url = match env::var("DATABASE_URL") {
            Ok(conn) => conn,
            Err(_) => format!("Error failed retrieving db connection.")
        };
        // Creating a new sqlx connection pool.
        let db_pool = PgPool::connect(&db_url).await.unwrap();
        AppState { db: db_pool }
    }
}
