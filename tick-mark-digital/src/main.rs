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
use actix_identity::IdentityMiddleware;
use actix_session::{SessionMiddleware, storage::CookieSessionStore};
use env_logger::Env;
use log::info;
use dotenvy::dotenv;
use std::env;
use std::io;


#[actix_web::main]
async fn main() -> io::Result<()> {
    let secret_key = Key::generate(); //Generate secret key for session encryption.

    // Initilize the logger from the environment.
    env_logger::Builder::from_env(Env::default().default_filter_or("info")).init();

    // Database connections
    let shared_data = AppState::new().await;
    // Construct app and configure routes
    let app = move || {
        App::new()
            .wrap(Logger::default()) // Logger middleware
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
    HttpServer::new(app).bind("127.0.0.1:5000")?.run().await
}
