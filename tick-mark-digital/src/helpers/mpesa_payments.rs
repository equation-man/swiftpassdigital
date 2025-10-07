//! Mpesa payments processing.
use reqwest::header::{ HeaderMap, HeaderValue, AUTHORIZATION };
use serde::{ Serialize, Deserialize };
use serde_json::json;
use reqwest::Error;
use dotenvy::dotenv;
use std::env;
use base64;

// =============== MPESA EXPRESS ==================
#[derive(Debug, Serialize, Deserialize)]
pub struct StkPushRequest {
    password: String,
    BusinessShortCode: String,
    timestamp: String,
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
    merchantRequestId: String,
    checkoutRequestId: String,
    responseCode: String,
    responseDescription: String,
    customerMessage: String,
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
    let access_token = token_json["access_token"].as_str().ok_or("Failed to extract access token").unwrap();
    (api_url, access_token.to_string())
}

/// Mpesa STK push payment.
pub async fn mpesa_stk_push(payment_request: StkPushRequest) -> Result<StkPushResponse, Error> {
    let (url, bearer_token) = mpesa_auth_details().await;
    let client = reqwest::Client::new();
    let res = client.post(format!("{}/stkpush/v1/processrequest", url))
        .bearer_auth(&bearer_token)
        .header("Content-Type", "application/json")
        .json(&payment_request)
        .send().await?;
    let stk_resp = res.json().await?;
    Ok(stk_resp)
}


#[cfg(test)]
mod tests {
    use super::*;
    // Generating auth details
    #[tokio::test]
    async fn mpesa_auth_test() {
        let auth = mpesa_auth_details().await;
        println!("The mpesa auth is {:#?}", auth);
    }
}
