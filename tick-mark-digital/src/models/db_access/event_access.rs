//! DATABASE ACCESS UTILITIES FOR EVENTS AND TICKETS.
use crate::models::{
    Event, CreateEvent, EventPayload,
    TickType, Ticket, AddTicket, TicketPayload, TickStatus, TickClass,
    Order, CreateOrder, OrderPayload,
    DiscType, Discount, AddDiscount, DiscountPayload,
    pg_interval_to_chrono_duration,
    pg_interval_to_seconds,
};
use chrono::{Duration, DateTime, Utc};
use sqlx::postgres::PgPool;
use rust_decimal::Decimal;
use std::str::FromStr;
use sqlx::Row;
use uuid::Uuid;

pub async fn add_event(db_pool: &PgPool, new_event: CreateEvent) -> Event {
    let start_date: DateTime<Utc> = new_event.start_date.parse().unwrap();
    let finish_date: DateTime<Utc> = new_event.finish_date.parse().unwrap();
    let n_event = sqlx::query!(r#"
        INSERT INTO ticket_market.events
            (owner_id, title, description, venue, start_time, finish_time, event_tag)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
            event_id, owner_id, title, description,
            venue, start_time, finish_time, added_at,
            edited, event_tag
    "#, new_event.owner_id, new_event.title,
    new_event.description, new_event.venue,
    start_date, finish_date,
    new_event.event_tag
    ).fetch_one(db_pool).await.unwrap();

    let start_time_iso_str = n_event.start_time.to_rfc3339();
    let finish_time_iso_str = n_event.finish_time.to_rfc3339();
    let added_at_str = n_event.added_at.to_rfc3339();

    Event {
        event_id: n_event.event_id,
        owner_id: n_event.owner_id,
        title: n_event.title,
        description: n_event.description,
        venue: n_event.venue,
        start_date: start_time_iso_str,
        finish_date: finish_time_iso_str,
        added_at: added_at_str,
        edited: n_event.edited.unwrap(),
        event_tag: n_event.event_tag.unwrap(),
    }
}

pub async fn get_events(db_pool: &PgPool, filters: EventPayload) -> Vec<Event> {
    let start_date = match filters.start_date {
        Some(s_date) => Some(s_date.parse::<DateTime<Utc>>().unwrap()),
        None => None
    };
    let finish_date = match filters.finish_date {
        Some(f_date) => Some(f_date.parse::<DateTime<Utc>>().unwrap()),
        None => None
    };

    let event_list = sqlx::query(r#"
        SELECT * FROM ticket_market.events
        WHERE ($1 IS NULL OR event_id=$1)
            AND ($2 IS NULL OR owner_id=$2)
            AND ($3 IS NULL OR title=$3)
            AND ($4 IS NULL OR venue=$4)
            AND ($5 IS NULL OR start_time=$5)
            AND ($6 IS NULL OR finish_time=$6)
            AND ($7 IS NULL OR event_tag=$7)
    "#).bind(Some(filters.event_id)).bind(Some(filters.owner_id))
        .bind(Some(filters.title)).bind(Some(filters.venue))
        .bind(Some(start_date)).bind(Some(finish_date))
        .bind(Some(filters.event_tag))
    .fetch_all(db_pool).await.expect("Events fetch failed");

    event_list.iter().map(|event| {
        let start_time_str = event.get::<DateTime<Utc>, &str>("start_time").to_rfc3339();
        let finish_time_str = event.get::<DateTime<Utc>, &str>("finish_time").to_rfc3339();
        let added_at_str = event.get::<DateTime<Utc>, &str>("added_at").to_rfc3339();
        Event {
            event_id: event.get("event_id"),
            owner_id: event.get("owner_id"),
            title: event.get("title"),
            description: event.get("description"),
            venue: event.get("venue"),
            start_date: start_time_str,
            finish_date: finish_time_str,
            added_at: added_at_str,
            edited: event.get("edited"),
            event_tag: event.get("event_tag"),
        }
    }).collect()
}

pub async fn update_event(db_pool: &PgPool, event_id: Uuid, payload: EventPayload) -> Event {
    let upd_event = sqlx::query(r#"
        UPDATE ticket_market.events
            SET title = COALESCE($1, title),
                venue = COALESCE($2, venue),
                start_time = COALESCE($3, start_time),
                finish_time = COALESCE($4, finish_time),
                event_tag = COALESCE($5, event_tag),
                edited = true
            WHERE event_id = $6
        RETURNING event_id, owner_id, title, description, venue,
            start_time, finish_time, added_at, edited, event_tag
    "#).bind(Some(payload.title)).bind(Some(payload.venue))
    .bind(Some(payload.start_date)).bind(Some(payload.finish_date))
    .bind(Some(payload.event_tag)).bind(event_id)
    .fetch_one(db_pool).await.expect("Failed updateing event");

    let start_time_str = upd_event.get::<DateTime<Utc>, &str>("start_time").to_rfc3339();
    let finish_time_str = upd_event.get::<DateTime<Utc>, &str>("finish_time").to_rfc3339();
    let added_at_str = upd_event.get::<DateTime<Utc>, &str>("added_at").to_rfc3339();

    Event {
        event_id: upd_event.get("event_id"),
        owner_id: upd_event.get("owner_id"),
        title: upd_event.get("title"),
        description: upd_event.get("description"),
        venue: upd_event.get("venue"),
        start_date: start_time_str,
        finish_date: finish_time_str,
        added_at: added_at_str, 
        edited: upd_event.get("edited"),
        event_tag: upd_event.get("event_tag")
    }
}

pub async fn delete_event(db_pool: &PgPool, event_id: Uuid) -> Event {
    let del_event = sqlx::query!(r#"
        DELETE FROM ticket_market.events
        WHERE event_id=$1
        RETURNING event_id, owner_id, title, description, venue,
            start_time, finish_time, added_at, edited, event_tag
    "#, event_id).fetch_one(db_pool).await.unwrap();

    let start_time_iso_str = del_event.start_time.to_rfc3339();
    let finish_time_iso_str = del_event.finish_time.to_rfc3339();
    let added_at_str = del_event.added_at.to_rfc3339();

    Event {
        event_id: del_event.event_id,
        owner_id: del_event.owner_id,
        title: del_event.title,
        description: del_event.description,
        venue: del_event.venue,
        start_date: start_time_iso_str,
        finish_date: finish_time_iso_str,
        added_at: added_at_str,
        edited: del_event.edited.unwrap(),
        event_tag: del_event.event_tag.unwrap(),
    }
}

// =================== TICKET ACTIONS ===========================
pub async fn add_ticket(db_pool: &PgPool, new_ticket: AddTicket) -> Ticket {
    let start_time: DateTime<Utc> = new_ticket.start_time.parse().unwrap();
    let finish_time: DateTime<Utc> = new_ticket.finish_time.parse().unwrap();
    let price = Decimal::from_str(&new_ticket.base_price).unwrap();
    let ticket_duration = Duration::days(new_ticket.discount_time);

    let ticket = sqlx::query!(r#"
        INSERT INTO ticket_market.tickets
            (event_id, base_price, capacity, ticket_type, start_time, finish_time, description, ticket_class, discount_time)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING ticket_id, event_id, base_price,
            capacity, ticket_type as "tick_type: TickType", start_time, finish_time,
            added_at, description, ticket_class as "tick_class: TickClass", discount_time
    "#,new_ticket.event_id, price,
    new_ticket.capacity, new_ticket.ticket_type as TickType, start_time,
    finish_time, new_ticket.description,
    new_ticket.ticket_class as TickClass, ticket_duration as Duration
    ).fetch_one(db_pool).await.unwrap();

    let start_time_iso_str = ticket.start_time.to_rfc3339();
    let finish_time_iso_str = ticket.finish_time.to_rfc3339();
    let added_at_str = ticket.added_at.to_rfc3339();
    let ticket_price = ticket.base_price.unwrap().to_string();

    Ticket {
        ticket_id: ticket.ticket_id,
        event_id: ticket.event_id,
        base_price: ticket_price,
        capacity: ticket.capacity.unwrap(),
        ticket_type: ticket.tick_type.unwrap(),
        ticket_class: ticket.tick_class.unwrap(),
        discount_time: pg_interval_to_seconds(ticket.discount_time.unwrap()),
        start_time: start_time_iso_str, 
        finish_time: finish_time_iso_str, 
        added_at: added_at_str,
        description: ticket.description.unwrap(),
    }
}

pub async fn get_tickets(db_pool: &PgPool, event_id: Uuid) -> Vec<Ticket> {


    let tickets = sqlx::query(r#"
        SELECT * FROM ticket_market.tickets
        WHERE event_id=$1
    "#).bind(event_id)
    .fetch_all(db_pool).await.expect("Tickets fetch failed");

    tickets.iter().map(|ticket| {
        let start_time_str = ticket.get::<DateTime<Utc>, &str>("start_time").to_rfc3339();
        let finish_time_str = ticket.get::<DateTime<Utc>, &str>("finish_time").to_rfc3339();
        let added_at_str = ticket.get::<DateTime<Utc>, &str>("added_at").to_rfc3339();
        let t_price = ticket.get::<Decimal, &str>("base_price").to_string();

        Ticket {
            ticket_id: ticket.get("ticket_id"),
            event_id: ticket.get("event_id"),
            base_price: t_price,
            capacity: ticket.get("capacity"),
            ticket_type: ticket.get("ticket_type"),
            ticket_class: ticket.get("ticket_class"),
            discount_time: pg_interval_to_seconds(ticket.get("discount_time")),
            start_time: start_time_str,
            finish_time: finish_time_str,
            added_at: added_at_str,
            description: ticket.get("description"),
        }
    }).collect()
}

// ==================== TICKET ORDERS =====================
pub async fn add_order(db_pool: &PgPool, entrance_code: String, new_order: CreateOrder) -> Order {
    let n_order = sqlx::query!(r#"
        INSERT INTO ticket_market.orders
            (ticket_id, user_id, user_email, user_contact, ticket_price,
            promo_code, ticket_status,
            entrance_code, order_limit)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING order_id, ticket_id, user_id, user_email,
            user_contact, ticket_price, added_at, promo_code,
            ticket_status as "tick_status: TickStatus", entrance_code, order_limit
    "#, new_order.ticket_id, new_order.user_id, new_order.user_email,
    new_order.user_contact, new_order.ticket_price, new_order.promo_code,
    new_order.ticket_status as TickStatus, entrance_code, new_order.order_limit
    ).fetch_one(db_pool).await.unwrap();

    Order {
        order_id: n_order.order_id,
        ticket_id: n_order.ticket_id.unwrap(),
        user_id: n_order.user_id.unwrap(),
        user_email: n_order.user_email.unwrap(),
        user_contact: n_order.user_contact.unwrap(),
        ticket_price: n_order.ticket_price.unwrap(),
        added_at: n_order.added_at,
        promo_code: n_order.promo_code.unwrap(),
        ticket_status: n_order.tick_status.unwrap(),
        entrance_code: n_order.entrance_code.unwrap(),
        order_limit: n_order.order_limit.unwrap(),
    }
}

pub async fn get_orders(db_pool: &PgPool, ticket_id: Uuid, filters: OrderPayload) -> Vec<Order> {
    let orders = sqlx::query(r#"
        SELECT * FROM ticket_market.orders
        WHERE ticket_id=$1
            AND ($2 IS NULL OR order_id=$2)
            AND ($3 IS NULL OR user_id=$3)
            AND ($4 IS NULL OR user_email=$4)
            AND ($5 IS NULL OR user_contact=$5)
            AND ($6 IS NULL OR ticket_price=$6)
            AND ($7 IS NULL OR promo_code=$7)
            AND ($8 IS NULL OR ticket_status=$8)
            AND ($9 IS NULL OR entrance_code=$9)
            AND ($10 IS NULL OR order_limit=$10)
    "#).bind(Some(ticket_id)).bind(Some(filters.order_id))
    .bind(Some(filters.user_id)).bind(Some(filters.user_email))
    .bind(Some(filters.user_contact)).bind(Some(filters.ticket_price))
    .bind(Some(filters.promo_code)).bind(Some(filters.ticket_status))
    .bind(Some(filters.entrance_code)).bind(Some(filters.order_limit))
    .fetch_all(db_pool).await.expect("Failed fetching orders");

    orders.iter().map(|order| Order {
        order_id: order.get("order_id"),
        ticket_id: order.get("ticket_id"),
        user_id: order.get("user_id"),
        user_email: order.get("user_email"),
        user_contact: order.get("user_contact"),
        ticket_price: order.get("ticket_price"),
        added_at: order.get("added_at"),
        promo_code: order.get("promo_code"),
        ticket_status: order.get("ticket_status"),
        entrance_code: order.get("entrance_code"),
        order_limit: order.get("order_limit")
    }).collect()
}

// ======================== DISCOUNT =====================
pub async fn add_discount(db_pool: &PgPool, new_discount: AddDiscount) -> Discount {
    let n_discount = sqlx::query!(r#"
        INSERT INTO ticket_market.discount_rules
            (ticket_id, name, discount_type, value, start_date, end_date, max_users)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7)
        RETURNING discount_id, ticket_id, name,
            discount_type as "disc_type: DiscType", value, start_date,
            end_date, added_at, max_users, active
    "#, new_discount.ticket_id, new_discount.name, new_discount.discount_type as DiscType,
    new_discount.value, new_discount.start_date, new_discount.end_date,
    new_discount.max_users
    ).fetch_one(db_pool).await.unwrap();

    Discount {
        discount_id: n_discount.discount_id,
        ticket_id: n_discount.ticket_id,
        name: n_discount.name,
        discount_type: n_discount.disc_type,
        value: n_discount.value,
        start_date: n_discount.start_date,
        end_date: n_discount.end_date,
        added_at: n_discount.added_at,
        max_users: n_discount.max_users.unwrap(),
        active: n_discount.active.unwrap(),
    }
}

pub async fn get_discounts(db_pool: &PgPool, ticket_id: Uuid, filters: DiscountPayload) -> Vec<Discount> {
    let discounts = sqlx::query(r#"
        SELECT * FROM ticket_market.discount_rules
        WHERE ticket_id=$1
            AND ($2 IS NULL OR discount_id=$2)
            AND ($3 IS NULL OR name=$3)
            AND ($4 IS NULL OR discount_type=$4)
            AND ($5 IS NULL OR value=$6)
            AND ($7 IS NULL OR start_date=$7)
            AND ($8 IS NULL OR end_date=$8)
            AND ($9 IS NULL OR max_users=$9)
            AND ($10 IS NULL OR active=$10)
    "#).bind(ticket_id).bind(Some(filters.discount_id)).bind(Some(filters.name))
    .bind(Some(filters.discount_type)).bind(Some(filters.value)).bind(Some(filters.start_date))
    .bind(Some(filters.end_date)).bind(Some(filters.max_users)).bind(Some(filters.active))
    .fetch_all(db_pool).await.unwrap();

    discounts.iter().map(|disc| Discount {
        discount_id: disc.get("discount_id"),
        ticket_id: disc.get("ticket_id"),
        name: disc.get("name"),
        discount_type: disc.get("discount_type"),
        value: disc.get("value"),
        start_date: disc.get("start_date"),
        end_date: disc.get("end_date"),
        added_at: disc.get("added_at"),
        max_users: disc.get("max_users"),
        active: disc.get("active"),
    }).collect()
}

pub async fn update_discount(db_pool: &PgPool, discount_id: Uuid, payload: DiscountPayload) -> Discount {
    let upd_disc = sqlx::query(r#"
        UPDATE ticket_market.discount_rules
            SET name = COALESCE($1, name),
                discount_type = COALESCE($2, discount_type),
                value = COALESCE($3, value),
                start_date = COALESCE($4, start_date),
                end_date = COALESCE($5, end_date),
                max_users = COALESCE($6, max_users),
                active = COALESCE($7, active)
            WHERE discount_id = $8
        RETURNING discount_id, ticket_id, name, discount_type,
            value, start_date, end_date, added_at, max_users, active
    "#).bind(Some(payload.name)).bind(Some(payload.discount_type)).bind(Some(payload.value))
    .bind(Some(payload.start_date)).bind(Some(payload.end_date))
    .bind(Some(payload.max_users)).bind(Some(payload.active))
    .fetch_one(db_pool).await.expect("Updating discount rules failed");

    Discount {
        discount_id: upd_disc.get("discount_id"),
        ticket_id: upd_disc.get("ticket_id"),
        name: upd_disc.get("name"),
        discount_type: upd_disc.get("discount_type"),
        value: upd_disc.get("value"),
        start_date: upd_disc.get("start_date"),
        end_date: upd_disc.get("end_date"),
        added_at: upd_disc.get("added_at"),
        max_users: upd_disc.get("max_users"),
        active: upd_disc.get("active"),
    }
}

pub async fn del_discount(db_pool: &PgPool, discount_id: Uuid, ticket_id: Uuid) -> Discount {
    let del_disc = sqlx::query!(r#"
        DELETE FROM ticket_market.discount_rules
        WHERE discount_id=$1 AND ticket_id=$2
        RETURNING discount_id, ticket_id, name,
            discount_type as "disc_type: DiscType", value,
            start_date, end_date, added_at, max_users, active
    "#, discount_id, ticket_id).fetch_one(db_pool).await.unwrap();

    Discount {
        discount_id: del_disc.discount_id,
        ticket_id: del_disc.ticket_id,
        name: del_disc.name,
        discount_type: del_disc.disc_type,
        value: del_disc.value,
        start_date: del_disc.start_date,
        end_date: del_disc.end_date,
        added_at: del_disc.added_at,
        max_users: del_disc.max_users.unwrap(),
        active: del_disc.active.unwrap(),
    }
}
