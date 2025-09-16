//! User routes. Configuring user access routes.
use actix_web::web;
use crate::{
    handlers::{
        user_registration, user_login, user_update, user_delete,
    },
};

/// Registering a user to the system.
pub fn general_user_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/users")
        .route("/register", web::post().to(user_registration))
        .route("/login", web::post().to(user_login))
        .route("/{user_id}", web::post().to(user_update))
        .route("/{user_id}", web::post().to(user_delete))
    );
}
