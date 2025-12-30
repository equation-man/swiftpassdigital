//! Event actions handler functions
use actix_web::{web, HttpResponse};
use crate::models::{
    Event, CreateEvent, EventPayload,
    Discount, AddDiscount, DiscountPayload,
    Order, CreateOrder, OrderPayload, OrderDetails,
    Ticket, AddTicket, TicketPayload, TickStatus,
    db_access::*,
};
use crate::helpers::{
    InitializeSplitPayment,
    init_split_trans, verify_trans,
    parse_email_html_content, send_email,
    ConfirmStkTransaction, StkPushRequest,
    mpesa_stk_push, stk_push_status, generate_daraja_password,
    DarajaCallback, commission_amnt_calc, get_comm_percent,
    StkDarajaResponse,
    TicketQRData, qr_code_gen,
    mail_config, get_daraja_callback, get_paystack_callback
};
use nanoid::nanoid;
use std::{thread, time::Duration, str::FromStr};
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use rand::Rng;

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

#[derive(Debug, Clone, Deserialize)]
pub struct EventSearchQuery {
    pub event_tag: Option<String>,
    pub owner_id: Option<String>,
    pub search_string: Option<String>,
}

#[derive(Serialize)]
pub struct EventsNotFound {
    message: String,
}

/// Searching events.
pub async fn search_available_events(fts_query: web::Query<EventSearchQuery>, app_state: web::Data<AppState>) -> HttpResponse {
    let event_search_query = fts_query.into_inner();
    match event_search_query.search_string {
        Some(filter_string) => {
            let fts_payload = EventPayload {
                event_id: None,
                owner_id: None,
                title: None,
                venue: None,
                start_date: None,
                finish_date: None,
                event_tag: None,
                search_query: Some(filter_string),
            };
            let events = fts_search_events(&app_state.db, fts_payload).await;
            match events {
                Ok(events) => HttpResponse::Ok().json(events),
                Err(_) => HttpResponse::NotFound().json(EventsNotFound { message: "Events not found".to_string() })
            }
        },
        None => {
            let fts_payload = EventPayload {
                event_id: None,
                owner_id: None,
                title: None,
                venue: None,
                start_date: None,
                finish_date: None,
                event_tag: None,
                search_query: Some("".to_string()),
            };
            let events = fts_search_events(&app_state.db, fts_payload).await;
            match events {
                Ok(events) => HttpResponse::Ok().json(events),
                Err(_) => HttpResponse::NotFound().json(EventsNotFound { message: "Events not found".to_string() })
            }
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
    match Uuid::parse_str(&ticket_id.into_inner()) {
        Ok(t_id) => {
            let ticket = get_single_ticket(&app_state.db, t_id).await;
            HttpResponse::Ok().json(ticket)
        },
        Err(_) => return HttpResponse::BadRequest().body("Invalid UUID")
    }
}

// ============================== ORDER TICKETS =========================
//
// ====================================
// NEW MPESA ORDER PAYMENT FUNCTION.
// ====================================
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum OrderPayloadType {
    CreateOrder(CreateOrder),
    DarajaCallback(DarajaCallback),
}

pub async fn mpesa_order_and_callback(payload: web::Json<OrderPayloadType>, ticket_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let t_id = Uuid::parse_str(&ticket_id.into_inner()).unwrap();
    println!("Started mpesa verification {:#?}", &payload);
    match &*payload {
        OrderPayloadType::CreateOrder(order_payload) => {
            let ticket_det = get_single_ticket(&app_state.db, t_id).await;
            let target_event = get_event(&app_state.db, ticket_det.event_id.clone()).await;
            let target_wallet = get_org_wallet(&app_state.db, target_event.owner_id.clone()).await;
            let (my_password, timestamp) = generate_daraja_password(target_wallet.account_number.clone()).await;
            let ticket_price_dec = Decimal::from_str(&ticket_det.base_price.clone()).unwrap();
            let ticket_price = ticket_price_dec.trunc().to_u64().unwrap();
            let stkPushRequest = StkPushRequest {
                Password: my_password.clone(),
                BusinessShortCode: target_wallet.account_number.clone(),
                Timestamp: timestamp.clone(),
                Amount: ticket_price.to_string(), //"1".to_string(),// 
                PartyA: order_payload.user_contact.clone(),
                PartyB: target_wallet.account_number.clone(),
                TransactionType: "CustomerPayBillOnline".to_string(),
                PhoneNumber: order_payload.user_contact.clone(),
                TransactionDesc: "SwiftPassDigital Event payment".to_string(),//"SwiftPassDigital Event Ticket".to_string(),
                AccountReference: "Test payments".to_string(),
                CallBackURL: get_daraja_callback(t_id.to_string()).await,
            };
            println!("About to initiate stk push {:#?}", &stkPushRequest);
            match mpesa_stk_push(stkPushRequest).await {
                Ok(push_res) => {
                    println!("Started processing push response, for proceesing ticket {:#?}", &push_res);
                    // Check if the order has been created on payment and update it.
                    let mut delay = 5.0;
                    let mut attempts = 0;
                    let max_attempts = 7;
                    let mut order_value = None;
                    while let None = order_value {
                        attempts += 1;
                        order_value = get_single_order(&app_state.db, t_id, push_res.CheckoutRequestID.clone()).await.unwrap();
                        println!("The while loop attempts {}", attempts);
                        println!("The order value is {:#?}", &order_value);
                        if attempts == max_attempts {
                            //Stop
                            break;
                        }
                        if order_value.is_none() {
                            let jitter: f64 = rand::thread_rng().gen_range(0.7..1.3);
                            let waiting = delay * jitter;
                            thread::sleep(Duration::from_secs_f64(waiting));
                            delay *= 2.0;
                            continue;
                        }
                        let confirmStkTransaction = ConfirmStkTransaction {
                            BusinessShortCode: target_wallet.account_number.clone(),
                            Password: my_password.clone(),
                            Timestamp: timestamp.clone(),
                            CheckoutRequestID: push_res.CheckoutRequestID.clone(),
                        };
                        if let Ok(pay_status) = stk_push_status(confirmStkTransaction.clone()).await {
                            match pay_status {
                                StkDarajaResponse::Success(stk_status) => {
                                    if stk_status.ResultCode == "0".to_string() {
                                        let upd_payload: OrderPayload = OrderPayload {
                                            order_id: None,
                                            ticket_id: Some(ticket_det.ticket_id.clone()),
                                            user_id: None,
                                            user_email: Some(order_payload.user_email.clone()),
                                            user_contact: Some(order_payload.user_contact.clone()),
                                            ticket_price: None,
                                            promo_code: None,
                                            ticket_status: None,
                                            entrance_code: None,
                                            order_limit: Some(ticket_det.capacity.clone()),
                                            commission_amount: None,
                                            order_currency: None,
                                            paystack_reference: None,
                                        };
                                        // Order is the ticket.
                                        let upd = update_order(&app_state.db, push_res.CheckoutRequestID.clone(), upd_payload).await;
                                        let qr_ticket: TicketQRData = TicketQRData {
                                            order_id: upd.order_id.clone().to_string(),
                                            entrance_code: upd.entrance_code.clone(),
                                            organization_id: target_event.owner_id.clone().to_string(),
                                            event_id: target_event.event_id.clone().to_string(),
                                            ticket_type: ticket_det.ticket_type.clone().to_string(),
                                            ticket_status: upd.ticket_status.clone().to_string(),
                                            start_time: target_event.start_date.clone(),
                                            finish_time: target_event.finish_date.clone(),
                                            paystack_reference: push_res.CheckoutRequestID.clone(),
                                            ticket_id: ticket_det.ticket_id.clone().to_string(),
                                        };
                                        let qr_code_tag = qr_code_gen(qr_ticket).await.unwrap();
                                        // Send the ticket to the email here.
                                        let (sender, subject, text) = mail_config(upd.entrance_code.clone()).await;
                                        let target_name = "SwiftPassDigital User".to_string();
                                        let html = parse_email_html_content(
                                            upd.entrance_code.clone(), upd.ticket_status.clone().to_string(),
                                            target_event.title, target_event.start_date
                                            ).await;
                                        let _ = send_email(sender, upd.user_email.clone(), subject, target_name, qr_code_tag, text, Some(html)).await;
                                        return HttpResponse::Ok().json(upd);
                                    } else {
                                        println!("The result code for payment is not 0");
                                        return HttpResponse::InternalServerError().body("Error processing ticket");
                                    }
                                },
                                StkDarajaResponse::Fault(f_status) => {
                                    // Handling rate limiting.
                                    //thread::sleep(Duration::from_secs_f64(waiting)); // Backoff before retrying. 
                                    //continue;
                                    println!("Generates fault response for Daraja api stk response {:#?}", f_status);
                                    return HttpResponse::InternalServerError().body("Handling rate limiting");
                                },
                            }
                        }
                    }
                    println!("The processing error is");
                    return HttpResponse::InternalServerError().body("Payment processing failed.");
                },
                Err(err) => {
                    println!("The mpesa stk push message is {:#?}", err);
                    HttpResponse::InternalServerError().body("Error processing payment")
                }
            }
        },

        OrderPayloadType::DarajaCallback(order_callBack) => {
            let callBack = &order_callBack.Body.stkCallback;
            if let Ok(Some(order)) = get_single_order(&app_state.db, t_id.clone(), callBack.CheckoutRequestID.clone()).await {
                // Prevent double booking of tickets
                return HttpResponse::InternalServerError().body("Order already exists");
            }
            println!("The daraja stk callback result is {:#?}", &callBack);
            // Add the order reference into the db since payment is successful.
            if callBack.ResultCode == 0 {
                // Create ticket, Payment was successfull.
                let alphabet: [char; 32] = [
                    'A','B','C','D','E','F','G','H','J','K','L','M',
                    'N','P','Q','R','S','T','U','V','W','X','Y','Z',
                    '2', '3', '4', '5', '6', '7', '8', '9'
                ];
                let entrance_pass = format!("SWPD-{}", nanoid!(8, &alphabet));
                let ticket_price_obj = callBack.CallbackMetadata.as_ref().unwrap().Item
                    .iter().filter(|itm| itm.Name == "Amount").collect::<Vec<_>>()[0];
                let ticket_price: Decimal = serde_json::from_value(ticket_price_obj.Value.clone().unwrap()).unwrap();
                let comm_percent = get_comm_percent().await;
                let my_comm = commission_amnt_calc(comm_percent, ticket_price.to_string()).await;
                let order_details = OrderDetails {
                    ticket_id: t_id,
                    user_email: "NOT_SET".to_string(),
                    user_contact: "NOT_SET".to_string(),
                    ticket_status: TickStatus::Pending,
                    order_limit: 0,
                    ticket_price: ticket_price,
                    commission_amount: Decimal::from(my_comm),
                    order_currency: "KES".to_string(),
                    paystack_reference: callBack.CheckoutRequestID.clone(),
                };
                let new_order = add_order(&app_state.db, entrance_pass, order_details).await;
                println!("The order added is {:#?}", new_order);
                return HttpResponse::Ok().json(new_order);
            }
            println!("The callback result code is not 0 {:#?}", &callBack);
            HttpResponse::InternalServerError().body("Error adding order")
        },
        _ => HttpResponse::InternalServerError().body("Payment processing failuire")
    }
}
// ===================================
// LEGACY MPESA PAYMENT
// ===================================
/// Mpesa order confirmation, callback.
pub async fn mpesa_callback(payload: web::Json<DarajaCallback>, ticket_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let callBack = &payload.Body.stkCallback;
    // Check if the callback had already been called
    let target_ticket_id = Uuid::parse_str(&ticket_id.into_inner()).unwrap();
    if let Ok(Some(order)) = get_single_order(&app_state.db, target_ticket_id.clone(), callBack.CheckoutRequestID.clone()).await {
        // Prevent double booking of tickets
        return HttpResponse::InternalServerError().body("Order already exists");
    }

    // Add the order reference into the db since payment is successful.
    if callBack.ResultCode == 0 {
        // Create ticket, Payment was successfull.
        let alphabet: [char; 32] = [
            'A','B','C','D','E','F','G','H','J','K','L','M',
            'N','P','Q','R','S','T','U','V','W','X','Y','Z',
            '2', '3', '4', '5', '6', '7', '8', '9'
        ];
        let entrance_pass = format!("SWPD-{}", nanoid!(8, &alphabet));
        let ticket_price_obj = callBack.CallbackMetadata.as_ref().unwrap().Item
            .iter().filter(|itm| itm.Name == "Amount").collect::<Vec<_>>()[0];
        let ticket_price: Decimal = serde_json::from_value(ticket_price_obj.Value.clone().unwrap()).unwrap();
        let pc_comm = get_comm_percent().await;
        let my_comm = commission_amnt_calc(pc_comm, ticket_price.to_string()).await;
        let order_details = OrderDetails {
            ticket_id: target_ticket_id,
            user_email: "NOT_SET".to_string(),
            user_contact: "NOT_SET".to_string(),
            ticket_status: TickStatus::Pending,
            order_limit: 0,
            ticket_price: ticket_price,
            commission_amount: Decimal::from(my_comm),
            order_currency: "KES".to_string(),
            paystack_reference: callBack.CheckoutRequestID.clone(),
        };
        let new_order = add_order(&app_state.db, entrance_pass, order_details).await;
        return HttpResponse::Ok().json(new_order);
    }
    HttpResponse::InternalServerError().body("Error adding order")
}

/// Mpesa ordering and payment.
pub async fn mpesa_order(payload: web::Json<CreateOrder>, ticket_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let order_payload: CreateOrder = payload.into();
    let t_id: Uuid = Uuid::parse_str(&ticket_id.into_inner()).unwrap();

    let ticket_det = get_single_ticket(&app_state.db, t_id).await;
    let target_event = get_event(&app_state.db, ticket_det.event_id.clone()).await;
    let target_wallet = get_org_wallet(&app_state.db, target_event.owner_id.clone()).await;
    let (my_password, timestamp) = generate_daraja_password(target_wallet.account_number.clone()).await;
    let ticket_price_dec = Decimal::from_str(&ticket_det.base_price.clone()).unwrap();
    let ticket_price = ticket_price_dec.trunc().to_u64().unwrap();
    let stkPushRequest = StkPushRequest {
        Password: my_password.clone(),
        BusinessShortCode: target_wallet.account_number.clone(),
        Timestamp: timestamp.clone(),
        Amount: ticket_price.to_string(), //"1".to_string(),// 
        PartyA: order_payload.user_contact.clone(),
        PartyB: target_wallet.account_number.clone(),
        TransactionType: "CustomerPayBillOnline".to_string(),
        PhoneNumber: order_payload.user_contact.clone(),
        TransactionDesc: "SwiftPassDigital Event payment".to_string(),//"SwiftPassDigital Event Ticket".to_string(),
        AccountReference: "Test payments".to_string(),
        CallBackURL: get_daraja_callback(t_id.to_string()).await,
    };
    match mpesa_stk_push(stkPushRequest).await {
        Ok(push_res) => {
            // Check if the order has been created on payment and update it.
            let mut delay = 5.0;
            let mut attempts = 0;
            let max_attempts = 7;
            let mut order_value = None;
            while let None = order_value {
                attempts += 1;
                order_value = get_single_order(&app_state.db, t_id, push_res.CheckoutRequestID.clone()).await.unwrap();
                if attempts == max_attempts {
                    //Stop
                    break;
                }
                if order_value.is_none() {
                    let jitter: f64 = rand::thread_rng().gen_range(0.7..1.3);
                    let waiting = delay * jitter;
                    thread::sleep(Duration::from_secs_f64(waiting));
                    delay *= 2.0;
                    continue;
                }
                let confirmStkTransaction = ConfirmStkTransaction {
                    BusinessShortCode: target_wallet.account_number.clone(),
                    Password: my_password.clone(),
                    Timestamp: timestamp.clone(),
                    CheckoutRequestID: push_res.CheckoutRequestID.clone(),
                };
                if let Ok(pay_status) = stk_push_status(confirmStkTransaction.clone()).await {
                    match pay_status {
                        StkDarajaResponse::Success(stk_status) => {
                            if stk_status.ResultCode == "0".to_string() {
                                let upd_payload: OrderPayload = OrderPayload {
                                    order_id: None,
                                    ticket_id: Some(ticket_det.ticket_id.clone()),
                                    user_id: None,
                                    user_email: Some(order_payload.user_email.clone()),
                                    user_contact: Some(order_payload.user_contact.clone()),
                                    ticket_price: None,
                                    promo_code: None,
                                    ticket_status: None,
                                    entrance_code: None,
                                    order_limit: Some(ticket_det.capacity.clone()),
                                    commission_amount: None,
                                    order_currency: None,
                                    paystack_reference: None,
                                };
                                // Order is the ticket.
                                let upd = update_order(&app_state.db, push_res.CheckoutRequestID.clone(), upd_payload).await;
                                let qr_ticket: TicketQRData = TicketQRData {
                                    order_id: upd.order_id.clone().to_string(),
                                    entrance_code: upd.entrance_code.clone(),
                                    organization_id: target_event.owner_id.clone().to_string(),
                                    event_id: target_event.event_id.clone().to_string(),
                                    ticket_type: ticket_det.ticket_type.clone().to_string(),
                                    ticket_status: upd.ticket_status.clone().to_string(),
                                    start_time: target_event.start_date.clone(),
                                    finish_time: target_event.finish_date.clone(),
                                    paystack_reference: push_res.CheckoutRequestID.clone(),
                                    ticket_id: ticket_det.ticket_id.clone().to_string(),
                                };
                                let qr_code_tag = qr_code_gen(qr_ticket).await.unwrap();
                                // Send the ticket to the email here.
                                let (sender, subject, text) = mail_config(upd.entrance_code.clone()).await;
                                //let sender = "swiftpassdigital@drugsverse.com".to_string();
                                //let subject = "SwiftPassDigital Ticket Confirmation".to_string();
                                let target_name = "SwiftPassDigital User".to_string();
                                //let text = format!("Your event spot created successfully via SwiftPassDigital. Your ticket id is: {}. Enjoy the event", upd.entrance_code);
                                let html = parse_email_html_content(
                                    upd.entrance_code.clone(), upd.ticket_status.clone().to_string(),
                                    target_event.title, target_event.start_date
                                    ).await;
                                let _ = send_email(sender, upd.user_email.clone(), subject, target_name, qr_code_tag, text, Some(html)).await;
                                return HttpResponse::Ok().json(upd);
                            }
                            return HttpResponse::InternalServerError().body("Error processing ticket");
                        },
                        StkDarajaResponse::Fault(f_status) => {
                            // Handling rate limiting.
                            //thread::sleep(Duration::from_secs_f64(waiting)); // Backoff before retrying. 
                            //continue;
                            return HttpResponse::InternalServerError().body("Handling rate limiting");
                        },
                    }
                }
            }
            return HttpResponse::InternalServerError().body("Payment processing failed.");
        },
        Err(err) => {
            HttpResponse::InternalServerError().body("Error processing payment")
        }
    }
}

/// Ordering a ticket via paystack. Payment or purchase action goes here.
pub async fn create_order(payload: web::Json<CreateOrder>, ticket_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let order_payload: CreateOrder = payload.into();
    let t_id: Uuid = Uuid::parse_str(&ticket_id.into_inner()).unwrap();
    let ticket_det = get_single_ticket(&app_state.db, t_id).await;
    let target_event = get_event(&app_state.db, ticket_det.event_id.clone()).await;
    let target_wallet = get_org_wallet(&app_state.db, target_event.owner_id.clone()).await;
    let amount_number: f64 = ticket_det.base_price.parse().expect("Invalid base price number");
    let amount_in_subunits = (amount_number * 100.0).round() as u64;
    let initSplitPymt = InitializeSplitPayment {
        email: order_payload.user_email.clone(),
        amount: amount_in_subunits.to_string(),

        subaccount: target_wallet.subaccount_code,
        callback_url: get_paystack_callback(
            ticket_det.ticket_id.to_string(), ticket_det.event_id.to_string().clone(),
            order_payload.user_email.clone(),
            order_payload.user_contact.clone()).await,
    };
    match init_split_trans(initSplitPymt).await {
        Ok(init_payment) => {
            let split_payment_data = init_payment.data.unwrap();
            HttpResponse::Ok().json(split_payment_data)
        },
        Err(err) => {
            HttpResponse::InternalServerError().body("Error processing transaction")
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct VerificationQuery {
    pub trxref: Option<String>,
    pub reference: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub event_id: Option<String>
}

/// Verify Mpesa ticket purchase.
pub async fn verify_order(ticket_id: web::Path<String>, v_query: web::Query<VerificationQuery>, app_state: web::Data<AppState>) -> HttpResponse {
    match Uuid::parse_str(&ticket_id.into_inner()) {
        Ok(ticket_id) => {
            let q = v_query.into_inner();
            if let Some(order) = get_single_order(&app_state.db, ticket_id, q.reference.clone().unwrap()).await.unwrap() {
                return HttpResponse::Ok().json(order);
            }
            HttpResponse::InternalServerError().body("Order does not exists")
        },
        Err(_) => return HttpResponse::BadRequest().body("Invalid UUID")
    }
}

#[derive(Serialize)]
struct VerificationResponse<T> {
    ok: bool,
    data: T,
    message: String,
}

pub async fn qr_verify(target_ids: web::Path<(String, String)>, qr_payld: web::Json<OrderPayload>, app_state: web::Data<AppState>) -> HttpResponse {
    let (org_id, event_id) = target_ids.into_inner();
    let qr_data: OrderPayload = qr_payld.into();
    let uuid_org_id: Uuid = Uuid::parse_str(&org_id).unwrap();
    match get_single_order(&app_state.db, qr_data.ticket_id.clone().unwrap(), qr_data.paystack_reference.clone().unwrap()).await {
        Ok(order) => {
            match order {
                Some(order) => {
                    // Match and update the ticket here.
                    match order.ticket_status {
                        TickStatus::Pending => {
                            // Update the ticket in the database.
                            let upd_order = OrderPayload {ticket_status: Some(TickStatus::Checked), ..Default::default()};
                            let ver_order = admin_update_order(&app_state.db, uuid_org_id, qr_data.order_id.clone().unwrap(), upd_order).await;
                            let response = VerificationResponse {
                                ok: true,
                                data: ver_order,
                                message: "Ticket checked".into(),
                            };
                            return HttpResponse::Ok().json(response);
                        },
                        TickStatus::Checked => return HttpResponse::BadRequest().body("Ticket already checked"),
                        TickStatus::Expired => return HttpResponse::BadRequest().body("Ticket already expired"),
                    }
                },
                None => return HttpResponse::BadRequest().body("Invalid Ticket")
            }
        },
        Err(_) => return HttpResponse::BadRequest().body("Invalid Ticket")
    }
}

/// Verify order purchase. Checking or confirming the ticket goes here, we also send the ticket to
/// the email.
pub async fn verify_paystack_order(ticket_id: web::Path<String>, verif_query: web::Query<VerificationQuery>, app_state: web::Data<AppState>) -> HttpResponse {
    let q = verif_query.into_inner();
    let ticket_id: Uuid = Uuid::parse_str(&ticket_id.into_inner()).unwrap();
    let order_payload: OrderPayload = OrderPayload {
        paystack_reference: Some(q.reference.clone().unwrap()),
        ..Default::default()
    };
    // Check if the referece exists.
    if get_orders(&app_state.db, ticket_id, order_payload).await.len() != 0{
        return HttpResponse::InternalServerError().body("Error order exists");
    }
    //(Exponential backoff with jitters)
    let max_retries = 5;
    let mut attempts = 0;
    while let Ok(val) = verify_trans(q.reference.clone().unwrap()).await {
        let res = val.data.unwrap();
        if res.status == "success".to_string() {
            let alphabet: [char; 32] = [
                'A','B','C','D','E','F','G','H','J','K','L','M',
                'N','P','Q','R','S','T','U','V','W','X','Y','Z',
                '2', '3', '4', '5', '6', '7', '8', '9'
            ];
            let code_gen = nanoid!(8, &alphabet);
            let entrance_pass = format!("SWPD-{}", code_gen);
            let ticket = get_single_ticket(&app_state.db, ticket_id).await;
            let pc_comm = get_comm_percent().await;
            let comm_amnt = commission_amnt_calc(pc_comm, res.amount.to_string()).await;
            let order_details = OrderDetails {
                ticket_id: ticket_id,
                user_email: q.email.unwrap(),
                user_contact: q.phone.unwrap(),
                ticket_status: TickStatus::Pending,
                order_limit: ticket.capacity,
                ticket_price: Decimal::from(res.amount),
                order_currency: "KES".to_string(),
                commission_amount: Decimal::from(comm_amnt),
                paystack_reference: res.reference.clone(),
            };
            let new_order = add_order(&app_state.db, entrance_pass, order_details).await;
            // Retrieve the info to the target event using q.event_id.clone().
            let evnt_id: Uuid = Uuid::parse_str(&q.event_id.clone().unwrap()).unwrap();
            let event = get_event(&app_state.db, evnt_id).await;
            let ev_title = &event.title;
            let start = &event.start_date;
            let qr_ticket: TicketQRData = TicketQRData {
                order_id: new_order.order_id.clone().to_string(),
                entrance_code: new_order.entrance_code.clone(),
                organization_id: event.owner_id.clone().to_string(),
                event_id: evnt_id.clone().to_string(),
                ticket_type: ticket.ticket_type.clone().to_string(), // Fix ticket type enum conversion to string.
                ticket_status: new_order.ticket_status.clone().to_string(),
                start_time: start.to_string(),
                finish_time: event.finish_date.clone(),
                paystack_reference: res.reference.clone(),
                ticket_id: new_order.ticket_id.clone().to_string(),
            };
            let qr_code_tag = qr_code_gen(qr_ticket).await.unwrap();
            // Send the ticket to the email here.
            let (sender, subject, text) = mail_config(new_order.entrance_code.clone()).await;
            //let sender = "swiftpassdigital@drugsverse.com".to_string();
            //let subject = "SwiftPassDigital Ticket Confirmation".to_string();
            let target_name = "SwiftPassDigital User".to_string();
            //let text = format!("Your event spot created successfully via SwiftPassDigital. Your ticket id is: {}. Enjoy your event", new_order.entrance_code);
            let html = parse_email_html_content(
                new_order.entrance_code.clone(), new_order.ticket_status.clone().to_string(),
                ev_title.to_string(), start.to_string()
                ).await;
            let _ = send_email(sender, new_order.user_email.clone(), subject, target_name, qr_code_tag, text, Some(html)).await;
            return HttpResponse::Ok().json(new_order);
        } else if attempts == max_retries {
            break;
        } else {
            //let jitter = rand::thread_rng().gent_range(0.7..1.3);// jitter btwn 70%% -130%
            attempts += 1;
            // Backoff before retrying.
            thread::sleep(Duration::from_secs(2u64.pow(attempts)));
        }
    }
    HttpResponse::InternalServerError().body("Payment verification failed")
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
        commission_amount: None,
        order_currency: None,
        paystack_reference: None,
    };
    let orders_list = get_orders(&app_state.db, ticket_id, filters).await;
    HttpResponse::Ok().json(orders_list)
}

pub async fn events_report(evnt_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let event_id = Uuid::parse_str(&evnt_id.into_inner()).unwrap();
    let event_obj = get_event(&app_state.db, event_id).await;
    let ev_reps = generate_report(&app_state.db, event_obj, None).await;
    HttpResponse::Ok().json(ev_reps)
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
            user_email: "maryjohn@gmai.com".to_string(),
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
            order_limit: None,
            order_currency: None,
            commission_amount: None,
            paystack_reference: None
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
        let ticket_id = web::Path::from("1554b773-f49d-41d7-baca-b67a2a9943b3".to_string());
        let ticket_order = create_order(order_payload, ticket_id, test_state).await;
        println!("The ticket order is {:#?}", ticket_order.body());
        assert_eq!(ticket_order.status(), StatusCode::OK);
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

    // =============== TEST GENERATING REPORT =================
    #[actix_web::test]
    #[ignore]
    async fn gen_rep_test() {
        let e_id = web::Path::from("68a990f9-9ab3-4d42-9454-97cbc8b84bdd".to_string());
        let test_state: web::Data<AppState> = web::Data::new(app_state().await);

        //generate_report(db_pool, evnt_uid, None).await;
        let report = events_report(e_id, test_state).await;
        println!("The generated report is {:#?}", report.body());
    }
}
