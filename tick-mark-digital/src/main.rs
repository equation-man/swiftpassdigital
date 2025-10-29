//! Our web API entry point.
mod handlers;
mod routes;
mod models;
mod helpers;

use routes::*; // Loading routes.
#[path="./state.rs"]
mod state;
use state::AppState;

use actix_web::{cookie::Key, App, HttpServer, web, middleware::Logger};
use actix_session::{SessionMiddleware, storage::CookieSessionStore};
use sqlx::{PgPool, migrate::MigrateDatabase};
use tokio::time::{sleep, Duration};
use actix_identity::IdentityMiddleware;
use actix_cors::Cors;
use env_logger::Env;
use dotenvy::dotenv;
use log::info;
use std::env;
use std::io;


#[actix_web::main]
async fn main() -> io::Result<()> {
    dotenv().ok();
    let secret_key = Key::generate(); //Generate secret key for session encryption.
    // Initilize the logger from the environment.
    env_logger::Builder::from_env(Env::default().default_filter_or("info")).init();

    // Database connections
    let shared_data = AppState::new().await;

    // Load migrations
    let migrations = sqlx::migrate!("./migrations");
    // Run migrations.
    migrations.run(&shared_data.db).await.unwrap();


    // Construct app and configure routes
    let app = move || {
        App::new()
            .wrap(Logger::new("%a %{User-Agent}i %r %s %b %Dms")) // Logger middleware
            .wrap(Cors::permissive()) // Permissive used for development
            .wrap(IdentityMiddleware::default())
            .wrap(
                SessionMiddleware::builder(CookieSessionStore::default(), secret_key.clone())
                .cookie_secure(false) // Set to true in production with https
                .build()
            )
            .app_data(web::Data::new(shared_data.clone()))
            .configure(general_user_routes)
            .configure(orgs_routes)
            .configure(events_routes)
    };

    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "5000".to_string());
    println!("Server running at http://{}:{}", host, port);
    HttpServer::new(app).bind(format!("{}:{}", host, port))?.run().await
}
