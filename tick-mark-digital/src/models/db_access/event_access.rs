//! DATABASE ACCESS UTILITIES FOR EVENTS AND TICKETS.
use crate::models::{
    Event, CreateEvent, EventPayload, Report,
    TickType, Ticket, AddTicket, TicketPayload, TickStatus, TickClass,
    Order, CreateOrder, OrderPayload, OrderDetails, OrdersReport,
    DiscType, Discount, AddDiscount, DiscountPayload,
    pg_interval_to_chrono_duration,
    pg_interval_to_seconds,
};
use chrono::{Duration, DateTime, Utc};
use futures::future;
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
        tickets: None,
        orders_report: None,
    }
}

pub async fn get_event(db_pool: &PgPool, event_id: Uuid) -> Event {
    let event = sqlx::query!(r#"
        SELECT event_id, owner_id, title,
            description, venue, start_time,
            finish_time, added_at, edited,
            event_tag
        FROM ticket_market.events
        WHERE event_id=$1
    "#, event_id).fetch_one(db_pool).await.unwrap();

    let evnt_tickets = get_tickets(db_pool, event.event_id).await;

    Event {
        event_id: event.event_id,
        owner_id: event.owner_id,
        title: event.title,
        description: event.description,
        venue: event.venue,
        start_date: event.start_time.to_rfc3339(),
        finish_date: event.finish_time.to_rfc3339(),
        added_at: event.added_at.to_rfc3339(),
        edited: event.edited.unwrap(),
        event_tag: event.event_tag.unwrap(),
        tickets: Some(evnt_tickets),
        orders_report: None,
    }
}

pub async fn get_events(db_pool: &PgPool, owner_id: Option<Uuid>, filters: EventPayload) -> Vec<Event> {
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
    "#).bind(Some(filters.event_id)).bind(Some(owner_id))
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
            tickets: None,
            orders_report: None,
        }
    }).collect()
}

// FULL TEXT SEARCH ON EVENTS
pub async fn fts_search_events(db_pool: &PgPool, search_payload: EventPayload) -> Result<Vec<Event>, sqlx::Error> {
    let events_fts = sqlx::query(r#"
        SELECT (results).*, total_count FROM ticket_market.search_events(search_query => $1)
    "#)
    .bind(search_payload.search_query)
    .fetch_all(db_pool).await?;

    let events_res = events_fts.iter().map(|event| {
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
            tickets: None,
            orders_report: None,
        }
    }).collect();

    Ok(events_res)
}

pub async fn generate_report(db_pool: &PgPool, event_id: Uuid, org_id: Option<Uuid>) -> Option<OrdersReport> {
    //let evnt = get_event(db_pool, event_id).await;
    //query wallet to get currency.
    let tickets = get_tickets(db_pool, event_id).await;
    // Available tickets.
    let capacity = tickets.iter().try_fold(0i64, |acc, tk| acc.checked_add(tk.capacity)).unwrap();
    // Getting all the orders for the event.
    let ords = tickets.iter().map(|tk| async move {
        let order_payload = OrderPayload { ..Default::default() };
        get_orders(db_pool, tk.ticket_id, order_payload).await
    });
    let orders: Vec<_> = futures::future::join_all(ords).await.into_iter().flatten().collect();
    // Filtering orders based on TickClass, i.e Regular or Discount.
    let reg_orders = tickets.iter()
        .filter(|reg_tk| reg_tk.ticket_type == TickType::Regular)
        .map(|reg_tick| async move {
            let order_payload = OrderPayload { ..Default::default() };
            get_orders(db_pool, reg_tick.ticket_id, order_payload).await
        });
    let reg_ords: Vec<_> = futures::future::join_all(reg_orders).await.into_iter().flatten().collect();
    let disc_orders = tickets.iter()
        .filter(|disc_tk| disc_tk.ticket_type == TickType::Discount)
        .map(|disc_tick| async move {
            let order_payload = OrderPayload { ..Default::default() };
            get_orders(db_pool, disc_tick.ticket_id, order_payload).await
        });
    let disc_ords: Vec<_> = futures::future::join_all(disc_orders).await.into_iter().flatten().collect();
    // Getting total sales of orders.
    let t_sales = orders.iter()
        .try_fold(
            Decimal::ZERO,
            |acc, tp| acc.checked_add(
                tp.ticket_price.parse().expect("Invalid decimal for total sales")
                )
            ).unwrap();
    let reg_sales = reg_ords.iter()
        .try_fold(
            Decimal::ZERO,
            |acc, tp| acc.checked_add(
                tp.ticket_price.parse().expect("Invalid decimal for total regular sales")
                )
            ).unwrap();
    let disc_sales = disc_ords.iter()
        .try_fold(
            Decimal::ZERO,
            |acc, tp| acc.checked_add(
                tp.ticket_price.parse().expect("Invalid decimal for total discounted sales")
                )
            ).unwrap();
    let total_commission = orders.iter()
        .try_fold(
            Decimal::ZERO,
            |acc, tp| acc.checked_add(
                tp.commission_amount.parse().expect("Invalid decimal total commission")
                )
            ).unwrap();
    // Filtering sales of orders based on Status, i.e Pending & Checked
    let checked_orders: Vec<_> = orders.iter().filter(|order| order.ticket_status == TickStatus::Checked).collect();
    let n_total = t_sales.checked_sub(total_commission).unwrap();

    let orders_rpt = OrdersReport {
        event_id: event_id,
        total_tickets: orders.len().to_string(),
        discounted_tickets: disc_ords.len().to_string(),
        regular_tickets: reg_ords.len().to_string(),
        checked_tickets: checked_orders.len().to_string(),
        total_sales_amount: t_sales.to_string(),
        discounted_sales_amount: disc_sales.to_string(),
        regular_sales_amount: reg_sales.to_string(),
        service_fees: total_commission.to_string(),
        net_sales_amount: n_total.to_string(),
        net_expected_sales_amount: None,
        orders_record: Some(orders),
    };

    Some(orders_rpt)
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
        event_tag: upd_event.get("event_tag"),
        tickets: None,
        orders_report: None,
    }
}

pub async fn delete_event(db_pool: &PgPool, event_id: Uuid) -> Event {
    // Deleting event related ticket first.
    let _ = delete_ticket(db_pool, event_id.clone()).await.unwrap();
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
        tickets: None,
        orders_report: None,
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

pub async fn get_single_ticket(db_pool: &PgPool, ticket_id: Uuid) -> Ticket {
    let ticket = sqlx::query(r#"
        SELECT * FROM ticket_market.tickets
        WHERE ticket_id=$1
    "#).bind(ticket_id)
    .fetch_one(db_pool).await.expect("Tickets fetch failed");

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
}

// Updating ticket.
pub async fn update_ticket(db_pool: &PgPool, ticket_id: Uuid, payload: TicketPayload) -> Result<Ticket, sqlx::Error> {
    let upd_ticket = sqlx::query(r#"
        UPDATE ticket_market.tickets
            SET base_price = COALESCE($1, base_price),
                capacity = COALESCE($2, capacity),
                ticket_type = COALESCE($3, type_type),
                ticket_class = COALESCE($4, ticket_class),
                discount_time = COALESCE($5, discount_time),
                start_time = COALESCE($7, start_time),
                finish_time = COALESCE($8, finish_time),
                description = COALESCE($9, description)
            WHERE ticket_id = $10
        RETURNING ticket_id, event_id, capacity,
            ticket_type as "tick_type: TickType", 
            ticket_class as "tick_class: TickClass",
            discount_time, start_time, finish_time,
            added_at, description, base_price
    "#).bind(Some(payload.base_price)).bind(Some(payload.capacity))
    .bind(Some(payload.ticket_type)).bind(Some(payload.ticket_class))
    .bind(Some(payload.discount_time)).bind(Some(payload.start_time))
    .bind(Some(payload.finish_time)).bind(Some(payload.description))
    .bind(ticket_id)
    .fetch_one(db_pool).await?;

    let start_time_str = upd_ticket.get::<DateTime<Utc>, &str>("start_time").to_rfc3339();
    let finish_time_str = upd_ticket.get::<DateTime<Utc>, &str>("finish_time").to_rfc3339();
    let added_at_str = upd_ticket.get::<DateTime<Utc>, &str>("added_at").to_rfc3339();
    let t_price = upd_ticket.get::<Decimal, &str>("base_price").to_string();

    Ok(Ticket {
        ticket_id: upd_ticket.get("ticket_id"),
        event_id: upd_ticket.get("event_id"),
        base_price: t_price,
        capacity: upd_ticket.get("capacity"),
        ticket_type: upd_ticket.get("ticket_type"),
        ticket_class: upd_ticket.get("ticket_class"),
        discount_time: pg_interval_to_seconds(upd_ticket.get("discount_time")),
        start_time: start_time_str,
        finish_time: finish_time_str,
        added_at: added_at_str,
        description: upd_ticket.get("description"),
    })

}

pub async fn delete_ticket(db_pool: &PgPool, event_id: Uuid) -> Result<Option<Ticket>, sqlx::Error> {
    let del_t = sqlx::query!(r#"
        DELETE FROM ticket_market.tickets
        WHERE event_id=$1
        RETURNING ticket_id, event_id, capacity,
            ticket_type as "tick_type: TickType", 
            ticket_class as "tick_class: TickClass",
            discount_time, start_time, finish_time,
            added_at, description, base_price
    "#, event_id).fetch_optional(db_pool).await?;
    if del_t.is_none() {
        return Ok(None)
    }

    let del_ticket = del_t.unwrap();

    let start_time_iso_str = del_ticket.start_time.to_rfc3339();
    let finish_time_iso_str = del_ticket.finish_time.to_rfc3339();
    let added_at_str = del_ticket.added_at.to_rfc3339();
    let ticket_price = del_ticket.base_price.unwrap().to_string();

    Ok(Some(Ticket {
        ticket_id: del_ticket.ticket_id,
        event_id: del_ticket.event_id,
        base_price: ticket_price,
        capacity: del_ticket.capacity.unwrap(),
        ticket_type: del_ticket.tick_type.unwrap(),
        ticket_class: del_ticket.tick_class.unwrap(),
        discount_time: pg_interval_to_seconds(del_ticket.discount_time.unwrap()),
        start_time: start_time_iso_str, 
        finish_time: finish_time_iso_str, 
        added_at: added_at_str,
        description: del_ticket.description.unwrap(),
    }))

}

// ==================== TICKET ORDERS =====================
pub async fn add_order(db_pool: &PgPool, entrance_code: String, new_order: OrderDetails) -> Order {
    let n_order = sqlx::query!(r#"
        INSERT INTO ticket_market.orders
            (ticket_id, user_contact, ticket_price, ticket_status,
            entrance_code, order_limit, user_email, paystack_reference,
            commission_amount, order_currency)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING order_id, ticket_id, user_id, user_email,
            user_contact, ticket_price, added_at, paystack_reference,
            ticket_status as "tick_status: TickStatus",
            entrance_code, order_limit, commission_amount, order_currency
    "#, new_order.ticket_id, new_order.user_contact, new_order.ticket_price,
    new_order.ticket_status as TickStatus, entrance_code, new_order.order_limit,
    new_order.user_email, new_order.paystack_reference,
    new_order.commission_amount, new_order.order_currency).fetch_one(db_pool).await.unwrap();
    let added_at_str = n_order.added_at.to_rfc3339();
    let order_price = n_order.ticket_price.unwrap().to_string();
    let commission_amnt = n_order.commission_amount.unwrap().to_string();
    Order {
        order_id: n_order.order_id,
        ticket_id: n_order.ticket_id.unwrap(),
        //user_id: n_order.user_id.unwrap(),
        user_email: n_order.user_email.unwrap(),
        user_contact: n_order.user_contact.unwrap(),
        ticket_price: order_price,
        added_at: added_at_str,
        //promo_code: n_order.promo_code.unwrap(),
        ticket_status: n_order.tick_status.unwrap(),
        entrance_code: n_order.entrance_code.unwrap(),
        order_limit: n_order.order_limit.unwrap(),
        paystack_reference: n_order.paystack_reference.unwrap(),
        commission_amount: commission_amnt,
        order_currency: n_order.order_currency.unwrap()
    }
}

pub async fn get_single_order(db_pool: &PgPool, ticket_id: Uuid, payment_reference: String) -> Result<Option<Order>, sqlx::Error> {
    let order = sqlx::query(r#"
        SELECT * FROM ticket_market.orders
        WHERE paystack_reference=$1 AND ticket_id=$2
    "#).bind(payment_reference).bind(ticket_id)
    .fetch_optional(db_pool).await?;

    let order_res = match order {
        Some(order_) => {
            let added_at_str = order_.get::<DateTime<Utc>, &str>("added_at").to_rfc3339();
            let order_price = order_.get::<Decimal, &str>("ticket_price").to_string();
            let commission_amnt = order_.get::<Decimal, &str>("commission_amount").to_string();
            Some(Order {
                order_id: order_.get("order_id"),
                ticket_id: order_.get("ticket_id"),
                //user_id: n_order.user_id.unwrap(),
                user_email: order_.get("user_email"),
                user_contact: order_.get("user_contact"),
                ticket_price: order_price,
                added_at: added_at_str,
                //promo_code: n_order.promo_code.unwrap(),
                ticket_status: order_.get("ticket_status"),
                entrance_code: order_.get("entrance_code"),
                order_limit: order_.get("order_limit"),
                paystack_reference: order_.get("paystack_reference"),
                commission_amount: commission_amnt,
                order_currency: order_.get("order_currency")
            })
        },
        _ => None
    };

    Ok(order_res)
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
            AND ($11 IS NULL OR paystack_reference=$11)
            AND ($12 IS NULL OR order_currency=$12)
    "#).bind(Some(ticket_id)).bind(Some(filters.order_id))
    .bind(Some(filters.user_id)).bind(Some(filters.user_email))
    .bind(Some(filters.user_contact)).bind(Some(filters.ticket_price))
    .bind(Some(filters.promo_code)).bind(Some(filters.ticket_status))
    .bind(Some(filters.entrance_code)).bind(Some(filters.order_limit))
    .bind(Some(filters.paystack_reference)).bind(Some(filters.order_currency))
    .fetch_all(db_pool).await.expect("Failed fetching orders");

    orders.iter().map(|order| {
        let added_at_str = order.get::<DateTime<Utc>, &str>("added_at").to_rfc3339();
        let o_price = order.get::<Decimal, &str>("ticket_price").to_string();
        let c_amount = order.get::<Decimal, &str>("commission_amount").to_string();
        Order {
            order_id: order.get("order_id"),
            ticket_id: order.get("ticket_id"),
            //user_id: order.get("user_id"),
            user_email: order.get("user_email"),
            user_contact: order.get("user_contact"),
            ticket_price: o_price,
            added_at: added_at_str,
            //promo_code: order.get("promo_code"),
            ticket_status: order.get("ticket_status"),
            entrance_code: order.get("entrance_code"),
            order_limit: order.get("order_limit"),
            paystack_reference: order.get("paystack_reference"),
            commission_amount: c_amount,
            order_currency: order.get("order_currency")
        }
    }).collect()
}

pub async fn admin_update_order(db_pool: &PgPool, owner_id: Uuid, order_id: Uuid, payload: OrderPayload) -> Order {
    let upd_order = sqlx::query(r#"
        UPDATE ticket_market.orders o
        SET ticket_status = $1
        FROM ticket_market.tickets t
        JOIN ticket_market.events e ON e.event_id=t.event_id
        WHERE o.ticket_id = t.ticket_id
            AND e.owner_id=$2
            AND o.order_id=$3
        RETURNING o.order_id, o.ticket_id, o.user_id, o.user_email,
            o.user_contact, o.ticket_price, o.added_at, o.promo_code,
            o.ticket_status, o.entrance_code, o.order_limit, o.order_currency,
            o.commission_amount, o.paystack_reference

    "#).bind(Some(payload.ticket_status)).bind(owner_id)
    .bind(order_id)
    .fetch_one(db_pool).await.expect("Failed updateing event");

    let added_at_str = upd_order.get::<DateTime<Utc>, &str>("added_at").to_rfc3339();
    let o_price = upd_order.get::<Decimal, &str>("ticket_price").to_string();
    let c_amount = upd_order.get::<Decimal, &str>("commission_amount").to_string();

    Order {
        order_id: upd_order.get("order_id"),
        ticket_id: upd_order.get("ticket_id"),
        //user_id: order.get("user_id"),
        user_email: upd_order.get("user_email"),
        user_contact: upd_order.get("user_contact"),
        ticket_price: o_price,
        added_at: added_at_str,
        //promo_code: order.get("promo_code"),
        ticket_status: upd_order.get("ticket_status"),
        entrance_code: upd_order.get("entrance_code"),
        order_limit: upd_order.get("order_limit"),
        paystack_reference: upd_order.get("paystack_reference"),
        commission_amount: c_amount,
        order_currency: upd_order.get("order_currency")
    }
}

pub async fn update_order(db_pool: &PgPool, payment_reference: String, payload: OrderPayload) -> Order {
    let upd_order = sqlx::query(r#"
        UPDATE ticket_market.orders
            SET ticket_id = COALESCE($1, ticket_id),
                user_id = COALESCE($2, user_id),
                user_email = COALESCE($3, user_email),
                user_contact = COALESCE($4, user_contact),
                ticket_price = COALESCE($5, ticket_price),
                promo_code = COALESCE($6, promo_code),
                ticket_status = COALESCE($7, ticket_status),
                entrance_code = COALESCE($8, entrance_code),
                order_limit = COALESCE($9, order_limit)
            WHERE paystack_reference = $10
        RETURNING order_id, ticket_id, user_id, user_email,
            user_contact, ticket_price, added_at,
            promo_code, commission_amount, ticket_status, entrance_code,
            order_limit, paystack_reference, order_currency
    "#).bind(Some(payload.ticket_id)).bind(Some(payload.user_id))
    .bind(Some(payload.user_email)).bind(Some(payload.user_contact))
    .bind(Some(payload.ticket_price)).bind(Some(payload.promo_code))
    .bind(Some(payload.ticket_status)).bind(Some(payload.entrance_code))
    .bind(Some(payload.order_limit)).bind(payment_reference)
    .fetch_one(db_pool).await.expect("Failed updating event");

    let added_at_str = upd_order.get::<DateTime<Utc>, &str>("added_at").to_rfc3339();
    let o_price = upd_order.get::<Decimal, &str>("ticket_price").to_string();
    let c_amount = upd_order.get::<Decimal, &str>("commission_amount").to_string();

    Order {
        order_id: upd_order.get("order_id"),
        ticket_id: upd_order.get("ticket_id"),
        //user_id: order.get("user_id"),
        user_email: upd_order.get("user_email"),
        user_contact: upd_order.get("user_contact"),
        ticket_price: o_price,
        added_at: added_at_str,
        //promo_code: order.get("promo_code"),
        ticket_status: upd_order.get("ticket_status"),
        entrance_code: upd_order.get("entrance_code"),
        order_limit: upd_order.get("order_limit"),
        paystack_reference: upd_order.get("paystack_reference"),
        commission_amount: c_amount,
        order_currency: upd_order.get("order_currency")
    }
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
