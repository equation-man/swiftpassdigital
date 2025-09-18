//! Orgs routes. Configuring organization access routes.
use actix_web::web;
use crate::{
    handlers::{
        org_registration, org_login, org_list, org_update,
        add_contact, contact_list, contact_update,
        delete_contact, create_access_code, list_access_codes,
        get_org_via_code
    },
};

/// Registering organization routes to the system
pub fn orgs_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/organization")
        .route("/registration", web::post().to(org_registration))
        .route("/admin", web::post().to(org_login))
        .route("/login", web::post().to(get_org_via_code))
        .route("/list", web::get().to(org_list))
        .route("/update/{org_id}", web::post().to(org_update))
        .route("/contact/{org_id}", web::post().to(add_contact))
        .route("/contact/list/{org_id}", web::get().to(contact_list))
        .route("/contact/update/{org_id}/{contact_id}", web::post().to(contact_update))
        .route("/contact/delete/{org_id}/{contact_id}", web::delete().to(delete_contact))
        .route("/access/create/{org_id}", web::post().to(create_access_code))
        .route("/access/list/{org_id}", web::get().to(list_access_codes))
    );
}
