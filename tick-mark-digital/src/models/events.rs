//! Events and tickets models
use serde::{Deserialize, Serialize};
use chrono::{Duration, DateTime, Utc};
use sqlx::postgres::types::PgInterval;
use rust_decimal::Decimal;
use actix_web::web;
use sqlx::Type;
use uuid::Uuid;
use std::fmt;

// Converting PgInterval to Duration.
pub fn pg_interval_to_chrono_duration(interval: PgInterval) -> Duration {
    let total_micros = interval.microseconds
        + interval.days as i64*86_400*1_000_000
        + interval.months as i64*30*86_400*1_000_000;
    Duration::microseconds(total_micros)
}

// Converting PgInterval to i64.
pub fn pg_interval_to_seconds(intv: PgInterval) -> i64 {
    // Assume 1 month is 30 days
    let days_from_months = (intv.months as i64) * 30;
    let total_days = days_from_months + intv.days as i64;

    let secs_from_days = total_days * 86_400; // 24*60*60
    let secs_from_micros = intv.microseconds / 1_000_000;

    secs_from_days + secs_from_micros
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Event {
    pub event_id: Uuid,
    pub owner_id: Uuid,
    pub title: String,
    pub description: String,
    pub venue: String,
    pub start_date: String, //DateTime<Utc>,
    pub finish_date: String, //DateTime<Utc>,
    pub added_at: String, //DateTime<Utc>,
    pub edited: bool,
    pub event_tag: String
}

impl From<web::Json<Event>> for Event {
    fn from(event: web::Json<Event>) -> Self {
        Event {
            event_id: event.event_id.clone(),
            owner_id: event.owner_id.clone(),
            title: event.title.clone(),
            description: event.description.clone(),
            venue: event.venue.clone(),
            start_date: event.start_date.clone(),
            finish_date: event.finish_date.clone(),
            added_at: event.added_at.clone(),
            edited: event.edited.clone(),
            event_tag: event.event_tag.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CreateEvent {
    pub owner_id: Uuid,
    pub title: String,
    pub description: String,
    pub venue: String,
    pub start_date: String, //DateTime<Utc>,
    pub finish_date: String, //DateTime<Utc>,
    pub event_tag: String,
}

impl From<web::Json<CreateEvent>> for CreateEvent {
    fn from(create_event: web::Json<CreateEvent>) -> Self {
        CreateEvent {
            owner_id: create_event.owner_id.clone(),
            title: create_event.title.clone(),
            description: create_event.description.clone(),
            venue: create_event.venue.clone(),
            start_date: create_event.start_date.clone(),
            finish_date: create_event.finish_date.clone(),
            event_tag: create_event.event_tag.clone()
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct EventPayload {
    pub event_id: Option<Uuid>,
    pub owner_id: Option<Uuid>,
    pub title: Option<String>,
    pub venue: Option<String>,
    pub start_date: Option<String>,
    pub finish_date: Option<String>,
    pub event_tag: Option<String>,
    pub search_query: Option<String>,
}

impl From<web::Json<EventPayload>> for EventPayload {
    fn from(event_payload: web::Json<EventPayload>) -> Self {
        EventPayload {
            event_id: event_payload.event_id.clone(),
            owner_id: event_payload.owner_id.clone(),
            title: event_payload.title.clone(),
            venue: event_payload.venue.clone(),
            start_date: event_payload.start_date.clone(),
            finish_date: event_payload.finish_date.clone(),
            event_tag: event_payload.event_tag.clone(),
            search_query: event_payload.search_query.clone(),
        }
    }
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, sqlx::Type)]
#[sqlx(type_name="tick_type", rename_all="lowercase")]
pub enum TickType {
    Discount,
    Regular,
    Vip,
}

impl From<web::Json<&str>> for TickType {
    fn from(tick_type: web::Json<&str>) -> Self {
        match tick_type{
            web::Json("Discount") => TickType::Discount,
            web::Json("Regular") => TickType::Regular,
            web::Json("Vip") => TickType::Vip,
            web::Json(&_) => unimplemented!("No other imlementation for the trait")
        }
    }
}


#[derive(Clone, Copy, Debug, Deserialize, Serialize, sqlx::Type)]
#[sqlx(type_name="tick_class", rename_all="lowercase")]
pub enum TickClass {
    Individual,
    Group,
}

impl From<web::Json<&str>> for TickClass {
    fn from(tick_type: web::Json<&str>) -> Self {
        match tick_type {
            web::Json("Individual") => TickClass::Individual,
            web::Json("Group") => TickClass::Group,
            web::Json(&_) => unimplemented!("No other type trait implemented")
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Ticket {
    pub ticket_id: Uuid,
    pub event_id: Uuid,
    pub base_price: String, //Decimal,
    pub capacity: i64,
    pub ticket_type: TickType, 
    pub ticket_class: TickClass,
    pub start_time: String, //DateTime<Utc>,
    pub finish_time: String, //DateTime<Utc>,
    pub discount_time: i64, //Duration,
    pub added_at: String, //DateTime<Utc>,
    pub description: String,
}

impl From<web::Json<Ticket>> for Ticket {
    fn from(ticket: web::Json<Ticket>) -> Self {
        Ticket {
            ticket_id: ticket.ticket_id.clone(),
            event_id: ticket.event_id.clone(),
            base_price: ticket.base_price.clone(),
            capacity: ticket.capacity.clone(),
            ticket_type: ticket.ticket_type.clone(),
            ticket_class: ticket.ticket_class.clone(),
            discount_time: ticket.discount_time.clone(),
            start_time: ticket.start_time.clone(),
            finish_time: ticket.finish_time.clone(),
            added_at: ticket.added_at.clone(),
            description: ticket.description.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct AddTicket {
    pub event_id: Uuid,
    pub base_price: String, //Decimal,
    pub capacity: i64,
    pub ticket_type: TickType,
    pub ticket_class: TickClass,
    pub discount_time: i64, //Duration,
    pub start_time: String, //DateTime<Utc>,
    pub finish_time: String, //DateTime<Utc>,
    pub description: String,
}

impl From<web::Json<AddTicket>> for AddTicket {
    fn from(add_ticket: web::Json<AddTicket>) -> Self {
        AddTicket {
            event_id: add_ticket.event_id.clone(),
            base_price: add_ticket.base_price.clone(),
            capacity: add_ticket.capacity.clone(),
            ticket_type: add_ticket.ticket_type.clone(),
            ticket_class: add_ticket.ticket_class.clone(),
            discount_time: add_ticket.discount_time.clone(),
            start_time: add_ticket.start_time.clone(),
            finish_time: add_ticket.finish_time.clone(),
            description: add_ticket.description.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct TicketPayload {
    pub ticket_id: Option<Uuid>,
    pub event_id: Option<Uuid>,
    pub base_price: Option<String>,
    pub capacity: Option<i64>,
    pub ticket_type: Option<TickType>,
    pub ticket_class: Option<TickClass>,
    pub discount_time: Option<i64>,
    pub start_time: Option<String>,
    pub finish_time: Option<String>,
}

impl From<web::Json<TicketPayload>> for TicketPayload {
    fn from(ticket_payload: web::Json<TicketPayload>) -> Self {
        TicketPayload {
            ticket_id: ticket_payload.ticket_id.clone(),
            event_id: ticket_payload.event_id.clone(),
            base_price: ticket_payload.base_price.clone(),
            capacity: ticket_payload.capacity.clone(),
            ticket_type: ticket_payload.ticket_type.clone(),
            ticket_class: ticket_payload.ticket_class.clone(),
            discount_time: ticket_payload.discount_time.clone(),
            start_time: ticket_payload.start_time.clone(),
            finish_time: ticket_payload.finish_time.clone(),
        }
    }
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, sqlx::Type)]
#[sqlx(type_name="tick_status", rename_all="lowercase")]
pub enum TickStatus {
    Pending,
    Checked,
    Expired
}

impl From<web::Json<&str>> for TickStatus {
    fn from(tick_status: web::Json<&str>) -> Self {
        match tick_status {
            web::Json("Pending") => TickStatus::Pending,
            web::Json("Checked") => TickStatus::Checked,
            web::Json("Expired") => TickStatus::Expired,
            web::Json(&_) => unimplemented!("No other trait to be implemented")
        }
    }
}

impl fmt::Display for TickStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let text = match self {
            TickStatus::Pending => "Pending",
            TickStatus::Checked => "Checked",
            TickStatus::Expired => "Expired",
        };
        write!(f, "{}", text)
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Order {
    pub order_id: Uuid,
    pub ticket_id: Uuid,
    //pub user_id: Uuid,
    pub user_email: String,
    pub user_contact: String,
    pub ticket_price: String, //Decimal,
    pub added_at: String, //DateTime<Utc>,
    //pub promo_code: String,
    pub entrance_code: String,
    pub ticket_status: TickStatus,
    pub order_limit: i64,
    pub paystack_reference: String,
}

impl From<web::Json<Order>> for Order {
    fn from(order: web::Json<Order>) -> Self {
        Order {
            order_id: order.order_id.clone(),
            ticket_id: order.ticket_id.clone(),
            //user_id: order.user_id.clone(),
            user_email: order.user_email.clone(),
            user_contact: order.user_contact.clone(),
            ticket_price: order.ticket_price.clone(),
            added_at: order.added_at.clone(),
            //promo_code: order.promo_code.clone(),
            entrance_code: order.entrance_code.clone(),
            ticket_status: order.ticket_status.clone(),
            order_limit: order.order_limit.clone(),
            paystack_reference: order.paystack_reference.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CreateOrder {
    //pub ticket_id: Uuid,
    //pub user_id: Uuid,
    pub user_email: String,
    pub user_contact: String,
    //pub ticket_price: Decimal,
    //pub promo_code: String,
    //pub ticket_status: TickStatus,
    //pub order_limit: i64,
}

impl From<web::Json<CreateOrder>> for CreateOrder {
    fn from(create_order: web::Json<CreateOrder>) -> Self {
        CreateOrder {
            //ticket_id: create_order.ticket_id.clone(),
            //user_id: create_order.user_id.clone(),
            user_email: create_order.user_email.clone(),
            user_contact: create_order.user_contact.clone(),
            //ticket_price: create_order.ticket_price.clone(),
            //promo_code: create_order.promo_code.clone(),
            //ticket_status: create_order.ticket_status.clone(),
            //order_limit: create_order.order_limit.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct OrderDetails {
    pub ticket_id: Uuid,
    pub user_email: String,
    pub user_contact: String,
    pub ticket_status: TickStatus,
    pub order_limit: i64,
    pub ticket_price: Decimal,
    pub paystack_reference: String,
}

impl From<web::Json<OrderDetails>> for OrderDetails {
    fn from(order_det: web::Json<OrderDetails>) -> Self {
        OrderDetails {
            ticket_id: order_det.ticket_id.clone(),
            user_email: order_det.user_email.clone(),
            user_contact: order_det.user_contact.clone(),
            ticket_status: order_det.ticket_status.clone(),
            order_limit: order_det.order_limit.clone(),
            ticket_price: order_det.ticket_price.clone(),
            paystack_reference: order_det.paystack_reference.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct OrderPayload {
    pub order_id: Option<Uuid>,
    pub ticket_id: Option<Uuid>,
    pub user_id: Option<Uuid>,
    pub user_email: Option<String>,
    pub user_contact: Option<String>,
    pub ticket_price: Option<Decimal>,
    pub promo_code: Option<String>,
    pub ticket_status: Option<TickStatus>,
    pub entrance_code: Option<String>,
    pub order_limit: Option<i64>,
    pub paystack_reference: Option<String>,
}

impl From<web::Json<OrderPayload>> for OrderPayload {
    fn from(order_payload: web::Json<OrderPayload>) -> Self {
        OrderPayload {
            order_id: order_payload.order_id.clone(),
            ticket_id: order_payload.ticket_id.clone(),
            user_id: order_payload.user_id.clone(),
            user_email: order_payload.user_email.clone(),
            user_contact: order_payload.user_contact.clone(),
            ticket_price: order_payload.ticket_price.clone(),
            promo_code: order_payload.promo_code.clone(),
            ticket_status: order_payload.ticket_status.clone(),
            entrance_code: order_payload.entrance_code.clone(),
            order_limit: order_payload.order_limit.clone(),
            paystack_reference: order_payload.paystack_reference.clone(),
        }
    }
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, sqlx::Type)]
#[sqlx(type_name="disc_type", rename_all="lowercase")]
pub enum DiscType {
    Percentage,
    Fixed,
}

impl From<web::Json<&str>> for DiscType {
    fn from(disc_type: web::Json<&str>) -> Self {
        match disc_type {
            web::Json("Percentage") => DiscType::Percentage,
            web::Json("Fixed") => DiscType::Fixed,
            web::Json(&_) => unimplemented!("No other traid to be implemented")
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Discount {
    pub discount_id: Uuid,
    pub ticket_id: Uuid,
    pub name: String,
    pub discount_type: DiscType,
    pub value: Decimal,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    pub added_at: DateTime<Utc>,
    pub max_users: i64,
    pub active: bool,
}

impl From<web::Json<Discount>> for Discount {
    fn from(discount: web::Json<Discount>) -> Self {
        Discount {
            discount_id: discount.discount_id.clone(),
            ticket_id: discount.ticket_id.clone(),
            name: discount.name.clone(),
            discount_type: discount.discount_type.clone(),
            value: discount.value.clone(),
            start_date: discount.start_date.clone(),
            end_date: discount.end_date.clone(),
            added_at: discount.added_at.clone(),
            max_users: discount.max_users.clone(),
            active: discount.active.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct AddDiscount {
    pub ticket_id: Uuid,
    pub name: String,
    pub discount_type: DiscType,
    pub value: Decimal,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    pub max_users: i64,
}

impl From<web::Json<AddDiscount>> for AddDiscount {
    fn from(add_discount: web::Json<AddDiscount>) -> Self {
        AddDiscount {
            ticket_id: add_discount.ticket_id.clone(),
            name: add_discount.name.clone(),
            discount_type: add_discount.discount_type.clone(),
            value: add_discount.value.clone(),
            start_date: add_discount.start_date.clone(),
            end_date: add_discount.end_date.clone(),
            max_users: add_discount.max_users.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct DiscountPayload {
    pub discount_id: Option<Uuid>,
    pub ticket_id: Option<Uuid>,
    pub name: Option<String>,
    pub discount_type: Option<DiscType>,
    pub value: Option<Decimal>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub max_users: Option<i64>,
    pub active: Option<bool>,
}

impl From<web::Json<DiscountPayload>> for DiscountPayload {
    fn from(disc_payload: web::Json<DiscountPayload>) -> Self {
        DiscountPayload {
            discount_id: disc_payload.discount_id.clone(),
            ticket_id: disc_payload.ticket_id.clone(),
            name: disc_payload.name.clone(),
            discount_type: disc_payload.discount_type.clone(),
            value: disc_payload.value.clone(),
            start_date: disc_payload.start_date.clone(),
            end_date: disc_payload.end_date.clone(),
            max_users: disc_payload.max_users.clone(),
            active: disc_payload.active.clone(),
        }
    }
}
