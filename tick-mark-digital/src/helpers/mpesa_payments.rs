//! Mpesa payments processing.
use reqwest::header::{ HeaderMap, HeaderValue, AUTHORIZATION };
use serde::{ Serialize, Deserialize };
use serde_json::json;
use reqwest::Error;
use dotenvy::dotenv;
use std::env;
use chrono::Local;
use base64;

// =============== MPESA EXPRESS ==================
#[derive(Debug, Serialize, Deserialize)]
pub struct StkPushRequest {
    Password: String,
    BusinessShortCode: String,
    Timestamp: String,
    Amount: String,
    PartyA: String,
    PartyB: String,
    TransactionType: String,
    PhoneNumber: String,
    TransactionDesc: String,
    AccountReference: String,
    CallBackURL: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StkPushResponse {
    MerchantRequestID: String,
    CheckoutRequestID: String,
    ResponseCode: String,
    ResponseDescription: String,
    CustomerMessage: String,
}

pub async fn generate_daraja_password(till_or_paybill: String, passkey: String) -> (String, String) {
    let timestamp = Local::now().format("%Y%m%d%H%M%S").to_string();
    // Combine shortcode, passkey, and timestamp.
    let raw = format!("{}{}{}", &till_or_paybill, &passkey, timestamp);
    // Base64 encode the combination.
    let password = base64::encode(raw);
    (password, timestamp)
}

pub async fn mpesa_auth_details() -> (String, String) {
    dotenv().ok();
    let api_url = env::var("MPESA_PAYMENT_URL").expect("Provide mpesa payment url.");
    let consumer_key = env::var("MPESA_DARAJA_CONSUMER_KEY").expect("Provide consumer secret");
    let consumer_secret = env::var("MPESA_DARAJA_CONSUMER_SECRET").expect("Provide consumer secret");

    // Encode base64(consumer_key:consumer_secret)
    let cred = base64::encode(format!("{}:{}", consumer_key, consumer_secret));
    let client = reqwest::Client::new();

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Basic {}", cred)).unwrap());

    let token_res = client.get(format!("{}/oauth/v1/generate?grant_type=client_credentials", api_url)).headers(headers).send().await.unwrap();
    let token_json: serde_json::Value = token_res.json().await.unwrap();
    let bearer_token= token_json["access_token"].as_str().ok_or("Failed to extract access token").unwrap();
    (api_url, bearer_token.to_string())
}

/// Mpesa STK push payment.
pub async fn mpesa_stk_push(payment_request: StkPushRequest) -> Result<StkPushResponse, Error> {
    let (url, bearer_token) = mpesa_auth_details().await;
    let client = reqwest::Client::new();
    let res = client.post(format!("{}/mpesa/stkpush/v1/processrequest", &url))
        .bearer_auth(&bearer_token)
        .header("Content-Type", "application/json")
        .json(&payment_request)
        .send().await?;
    let stk_resp: StkPushResponse = res.json().await?;
    Ok(stk_resp)
}


#[cfg(test)]
mod tests {
    use super::*;
    // ============== FIXTURES ====================
    async fn generate_request() -> StkPushRequest {
        dotenv().ok();
        let passkey = env::var("MPESA_DARAJA_PASSKEY").expect("Provide Mpesa daraja passkey");
        let till_or_paybill = "174379".to_string();
        let (my_password, timestamp) = generate_daraja_password(till_or_paybill.clone(), passkey).await;
        // MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjQxMjEwMTI0NTM3
        StkPushRequest {
            Password: my_password, 
            BusinessShortCode: till_or_paybill.clone(),
            Timestamp: timestamp,
            Amount: "1".to_string(),
            PartyA: "2547559009593".to_string(),
            PartyB: till_or_paybill.clone(),
            TransactionType: "CustomerPayBillOnline".to_string(),
            PhoneNumber: "254759009593".to_string(),
            TransactionDesc: "Test".to_string(),
            AccountReference: "Test".to_string(),
            CallBackURL: "https://mydomain.com/mpesa-express-simulate".to_string(),
        }
    }
    // Generating auth details
    #[tokio::test]
    #[ignore]
    async fn mpesa_auth_test() {
        let auth = mpesa_auth_details().await;
        println!("The mpesa auth is {:#?}", auth);
    }

    // Test sending stk push prompt.
    #[tokio::test]
    async fn stk_push_mpesa() {
        let stk_push_res = mpesa_stk_push(generate_request().await).await;
        println!("The mpesa stk push result is {:#?}", stk_push_res);
    }
}
