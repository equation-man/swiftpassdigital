//! Events routes. Configuring organization access routes
use actix_web::web;
use crate::{
    handlers::{
        create_event, list_events, event_update, event_delete,
        create_ticket, tickets_display, ticket_info, create_order,
        orders_list,
    },
};

/// Registering event routes to the system.
pub fn events_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/events")
        .route("/create", web::post().to(create_event))
        .route("/list", web::get().to(list_events))
        .route("/update/{event_id}", web::patch().to(event_update))
        .route("/delete/{event_id}", web::delete().to(event_delete))
        .route("/ticket/create", web::post().to(create_ticket))
        .route("/ticket/{ticket_id}", web::get().to(ticket_info))
        .route("/ticket/list/{event_id}", web::get().to(tickets_display))
        .route("/ticket/order/purchase/{ticket_id}", web::post().to(create_order))
        .route("/ticket/order/list/{ticket_id}", web::get().to(orders_list))
    );
}
