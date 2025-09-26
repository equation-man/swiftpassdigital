//! Event actions handler functions
use actix_web::{web, HttpResponse};
use crate::models::{
    Event, CreateEvent, EventPayload,
    Discount, AddDiscount, DiscountPayload,
    Order, CreateOrder, OrderPayload, OrderDetails,
    Ticket, AddTicket, TicketPayload, TickStatus,
    db_access::*,
};
use nanoid::nanoid;
use rust_decimal::Decimal;
use std::str::FromStr;
use serde::Deserialize;
use uuid::Uuid;

#[path="../state.rs"]
mod state;
use crate::state::AppState;

/// Adding an event.
pub async fn create_event(new_event: web::Json<CreateEvent>, app_state: web::Data<AppState>) -> HttpResponse {
    let n_event = add_event(&app_state.db, new_event.into()).await;
    HttpResponse::Ok().json(n_event)
}

/// Getting the details of an event.
pub async fn event_info(event_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let evnt_id: Uuid = Uuid::parse_str(&event_id.into_inner()).unwrap();
    let event = get_event(&app_state.db, evnt_id).await;
    HttpResponse::Ok().json(event)
}

/// Listing available events.
pub async fn list_events(filter: Option<web::Json<EventPayload>>, app_state: web::Data<AppState>) -> HttpResponse {
    match filter {
        Some(filter) => {
            let events = get_events(&app_state.db, None, filter.into()).await;
            HttpResponse::Ok().json(events)
        },
        None => {
            let event_payload = EventPayload {
                event_id: None,
                owner_id: None,
                title: None,
                venue: None,
                start_date: None,
                finish_date: None,
                event_tag: None,
                search_query: None,
            };
            let events = get_events(&app_state.db, None, event_payload).await;
            HttpResponse::Ok().json(events)
        }
    }
}

/// Listing my events.
pub async fn list_myevents(filter: Option<web::Json<EventPayload>>, owner_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let owner_id: Uuid = Uuid::parse_str(&owner_id.into_inner()).unwrap();
    match filter {
        Some(filter) => {
            let events = get_events(&app_state.db, Some(owner_id), filter.into()).await;
            HttpResponse::Ok().json(events)
        },
        None => {
            let event_payload = EventPayload {
                event_id: None,
                owner_id: None,
                title: None,
                venue: None,
                start_date: None,
                finish_date: None,
                event_tag: None,
                search_query: None,
            };
            let events = get_events(&app_state.db, Some(owner_id), event_payload).await;
            HttpResponse::Ok().json(events)
        }
    }
}

/// Editing the event.
pub async fn event_update(payload: web::Json<EventPayload>, params: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let event_id: Uuid = Uuid::parse_str(&params.into_inner()).unwrap();
    let updt_event = update_event(&app_state.db, event_id, payload.into()).await;
    HttpResponse::Ok().json(updt_event)
}

/// Deleting an event
pub async fn event_delete(params: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let event_id: Uuid = Uuid::parse_str(&params.into_inner()).unwrap();
    let del_event = delete_event(&app_state.db, event_id).await;
    HttpResponse::Ok().json(del_event)
}

// ============================== TICKET ACTIONS ========================
/// Creating a ticket
pub async fn create_ticket(payload: web::Json<AddTicket>, app_state: web::Data<AppState>) -> HttpResponse {
    let new_ticket = add_ticket(&app_state.db, payload.into()).await;
    HttpResponse::Ok().json(new_ticket)
}

/// Getting list of tickets.
pub async fn tickets_display(event_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let ev_id: Uuid = Uuid::parse_str(&event_id.into_inner()).unwrap();
    let ticket_list = get_tickets(&app_state.db, ev_id).await;
    HttpResponse::Ok().json(ticket_list)
}

/// Getting a ticket.
pub async fn ticket_info(ticket_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let t_id: Uuid = Uuid::parse_str(&ticket_id.into_inner()).unwrap();
    let ticket = get_single_ticket(&app_state.db, t_id).await;
    HttpResponse::Ok().json(ticket)
}

// ============================== ORDER TICKETS =========================
/// Ordering a ticket. Payment action goes here.
pub async fn create_order(payload: web::Json<CreateOrder>, token_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let order_payload: CreateOrder = payload.into();
    let alphabet: [char; 32] = [
        'A','B','C','D','E','F','G','H','J','K','L','M',
        'N','P','Q','R','S','T','U','V','W','X','Y','Z',
        '2', '3', '4', '5', '6', '7', '8', '9'
    ];
    let entrance_code_gen = nanoid!(8, &alphabet);
    let t_id: Uuid = Uuid::parse_str(&token_id.into_inner()).unwrap();
    let ticket_det = get_single_ticket(&app_state.db, t_id).await;
    let order_details = OrderDetails {
        ticket_id: ticket_det.ticket_id.clone(),
        user_email: order_payload.user_email,
        user_contact: order_payload.user_contact,
        ticket_status: TickStatus::Pending,
        order_limit: ticket_det.capacity,
        ticket_price: Decimal::from_str(&ticket_det.base_price).unwrap(),
    };
    let new_order = add_order(&app_state.db, entrance_code_gen, order_details).await;
    HttpResponse::Ok().json(new_order)
}

/// Verify order purchase. Checking or confirming the ticket goes here.
pub async fn verify_order(upd_pld: web::Json<OrderPayload>, path: web::Path<(String, String)>, app_state: web::Data<AppState>) -> HttpResponse {
    let (own_id, od_id) = path.into_inner();
    let owner_id: Uuid = Uuid::parse_str(&own_id).unwrap();
    let order_id: Uuid = Uuid::parse_str(&od_id).unwrap();
    let order_upd = update_order(&app_state.db, owner_id, order_id, upd_pld.into()).await;
    HttpResponse::Ok().json(order_upd)
}

#[derive(Debug, Deserialize)]
pub struct OrderQuery {
    pub entrance_code: Option<String>,
}

/// Listing ordered tickets.
pub async fn orders_list(params: web::Path<String>, query: web::Query<OrderQuery>, app_state: web::Data<AppState>) -> HttpResponse {
    let q = query.into_inner();
    let ticket_id = Uuid::parse_str(&params.into_inner()).unwrap();
    let filters: OrderPayload = OrderPayload {
        order_id: None,
        ticket_id: None,
        user_id: None,
        user_email: None,
        user_contact: None,
        ticket_price: None,
        promo_code: None,
        ticket_status: None,
        entrance_code: q.entrance_code,
        order_limit: None,
    };
    let orders_list = get_orders(&app_state.db, ticket_id, filters).await;
    HttpResponse::Ok().json(orders_list)
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::Rng;
    use std::sync::Mutex;
    use actix_web::http::StatusCode;
    use rust_decimal::Decimal;
    use chrono::{DateTime, NaiveDateTime, TimeZone, Utc, Duration};
    use crate::models::{TickType, DiscType, TickStatus, TickClass};

    fn random_datetime() -> DateTime<Utc> {
        // Define range: Jan 1 2000 - Jan 1, 2030
        let start = Utc.ymd(2000, 1, 1).and_hms(0, 0, 0);
        let end = Utc.ymd(2030, 1, 1).and_hms(0, 0, 0);
        // Convert to seconds since epoch
        let start_ts = start.timestamp();
        let end_ts = end.timestamp();
        // Random second in range
        let mut rng = rand::thread_rng();
        let rand_ts = rng.gen_range(start_ts..end_ts);
        // Optional: random nanoseconds (0-999,999,999)
        let rand_nanos = rng.gen_range(0..1_000_000_000);
        // Convert back
        DateTime::<Utc>::from_utc(NaiveDateTime::from_timestamp(rand_ts, rand_nanos), Utc)
    }

    // ====================== FIXTURES ==================
    fn create_event_info() -> CreateEvent {
        CreateEvent {
            owner_id: Uuid::parse_str("5f1b1eb1-e6b2-4c2a-8c9d-774c0e7efa08").unwrap(),
            title: "KCAA level 2 swimming championship".to_string(),
            description: "Swimming gala championship".to_string(),
            venue: "Mpesa Foundation".to_string(),
            start_date: random_datetime().to_string(),
            finish_date: random_datetime().to_string(),
            event_tag: "Swimming Championship".to_string(),
        }
    }

    fn event_payload_info() -> EventPayload {
        EventPayload {
            event_id: None,
            owner_id: None,
            title: Some("Pipsa Developmental gala".to_string()),
            venue: None,
            start_date: None,
            finish_date: None,
            event_tag: None,
            search_query: None,
        }
    }

    fn create_ticket_info() -> AddTicket {
        AddTicket {
            event_id: Uuid::parse_str("5f51badb-acfe-4b0f-8b9d-6a2d96a5fd1e").unwrap(),
            base_price: Decimal::new(1000, 2).to_string(),
            capacity: 500,
            ticket_type: TickType::Regular,
            ticket_class: TickClass::Individual,
            discount_time: 0,
            start_time: random_datetime().to_string(),
            finish_time: random_datetime().to_string(),
            description: "Premium tickets for Pipsa developmental gala".to_string(),
        }
    }

    fn ticket_filters_info() -> TicketPayload {
        TicketPayload {
            ticket_id: None,
            event_id: None,
            base_price: None,
            capacity: None,
            ticket_type: None,
            ticket_class: None,
            discount_time: None,
            start_time: None,
            finish_time: None,
        }
    }

    fn create_order_info() -> CreateOrder {
        CreateOrder {
            //ticket_id: Uuid::parse_str("e2500818-b029-4c84-87fe-9dece7135549").unwrap(),
            //user_id: Uuid::parse_str("029da29a-d932-4ed4-a978-09d5caec43fe").unwrap(),
            //user_email: "maryjohn@gmai.com".to_string(),
            user_contact: "0719984385".to_string(),
            //ticket_price: Decimal::new(100000, 2).to_string(),
            //promo_code: "KCAA2025".to_string(),
            //ticket_status: TickStatus::Checked,
            //order_limit: 1,
        }
    }

    fn order_filters_info() -> OrderPayload {
        OrderPayload {
            order_id: None,
            ticket_id: None,
            user_id: None,
            user_email: None,
            user_contact: None,
            ticket_price: None,
            promo_code: None,
            ticket_status: None,
            entrance_code: None,
            order_limit: None
        }
    }

    async fn app_state() -> AppState {
        AppState::new().await
    }

    // ====================== FULL TESTS ================
    #[actix_web::test]
    #[ignore]
    async fn create_event_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state().await);
        let new_event = web::Json(create_event_info());
        let resp = create_event(new_event, test_state).await;
        println!("The new event is {:#?}", resp.body());
        assert_eq!(resp.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn list_event_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state().await);
        let payload = None;
        let lst_events = list_events(payload, test_state).await;
        println!("The list of access codes are {:#?}", lst_events.body());
        assert_eq!(lst_events.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn update_event_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state().await);
        let payload = web::Json(event_payload_info());
        let event_id = web::Path::from("2bb30c5e-7a01-4d6b-a6c3-970a02f94d1a".to_string());
        let upd_events = event_update(payload, event_id, test_state).await;
        println!("The updated access codes are {:#?}", upd_events.body());
        assert_eq!(upd_events.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn delete_event_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state().await);
        let event_id = web::Path::from("2bb30c5e-7a01-4d6b-a6c3-970a02f94d1a".to_string());
        let del_events = event_delete(event_id, test_state).await;
        println!("The deleted event is {:#?}", del_events.body());
        assert_eq!(del_events.status(), StatusCode::OK);
    }

    // =============== CREATING A TICKET =====================
    #[actix_web::test]
    #[ignore]
    async fn create_ticket_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state().await);
        let new_ticket = web::Json(create_ticket_info());
        let resp_tick = create_ticket(new_ticket, test_state).await;
        println!("The new ticket is {:#?}", resp_tick.body());
        assert_eq!(resp_tick.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn list_ticket_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state().await);
        let ticket_filters = web::Json(ticket_filters_info());
        
        //let list = tickets_list(ticket_filters, test_state).await;
        //println!("The ticket list is {:#?}", list.body());
        //assert_eq!(list.status(), StatusCode::OK);
    }

    // =============== TICKET ORDERING ====================
    #[actix_web::test]
    #[ignore]
    async fn create_order_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state().await);
        let order_payload = web::Json(create_order_info());
        //let ticket_order = create_order(order_payload, test_state).await;
        //println!("The ticket order is {:#?}", ticket_order.body());
        //assert_eq!(ticket_order.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn list_orders_test() {
        //orders_list
        let test_state: web::Data<AppState> = web::Data::new(app_state().await);
        let order_filters = web::Json(order_filters_info());
        let ticket_id = web::Path::from("e2500818-b029-4c84-87fe-9dece7135549".to_string());
        //let orders = orders_list(order_filters, ticket_id, test_state).await;
        //println!("The ticket list is {:#?}", orders.body());
        //assert_eq!(orders.status(), StatusCode::OK);
    }
}
