//! Our web API entry point.
mod handlers;
mod routes;
mod models;

use routes::*;
#[path="./state.rs"]
mod state;
use state::AppState;

use actix_web::{App, HttpServer};
use dotenvy::dotenv;
use std::env;
use std::io;


#[actix_web::main]
async fn main() -> io::Result<()> {
    dotenv().ok();
    // Construct app and configure routes
    let app = move || {
        App::new()
            .configure(general_user_routes)
    };
    HttpServer::new(app)
        .bind("127.0.0.1:3000")?.run().await
}
