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
    pub Password: String,
    pub BusinessShortCode: String,
    pub Timestamp: String,
    pub Amount: String,
    pub PartyA: String,
    pub PartyB: String,
    pub TransactionType: String,
    pub PhoneNumber: String,
    pub TransactionDesc: String,
    pub AccountReference: String,
    pub CallBackURL: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StkPushResponse {
    pub MerchantRequestID: String,
    pub CheckoutRequestID: String,
    pub ResponseCode: String,
    pub ResponseDescription: String,
    pub CustomerMessage: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct B2CRequest {
    OriginatorConversationID: String,
    InitiatorName: String,
    SecurityCredential: String,
    CommandID: String,
    Amount: u64,
    PartyA: u64,
    PartyB: u64,
    Remarks: String,
    QueueTimeOutURL: String,
    ResultURL: String,
    Occasion: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct B2CResponse {
    ConversationID: String,
    OriginatorConversationID: String,
    ResponseCode: String,
    ResponseDescription: String,
}

/// Generating daraja password.
pub async fn generate_daraja_password(till_or_paybill: String, passkey: String) -> (String, String) {
    let timestamp = Local::now().format("%Y%m%d%H%M%S").to_string();
    // Combine shortcode, passkey, and timestamp.
    let raw = format!("{}{}{}", &till_or_paybill, &passkey, timestamp);
    // Base64 encode the combination.
    let password = base64::encode(raw);
    (password, timestamp)
}

/// Generation bearer authorization token and api url.
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

/// B2C(from till to mpesa mobile money wallet)
pub async fn mpesa_b2c_settlement(b2c_request: B2CRequest) -> Result<B2CResponse, Error> {
    let (url, bearer_token) = mpesa_auth_details().await;
    let client = reqwest::Client::new();
    let b2c_res = client.post(format!("{}/mpesa/b2c/v3/paymentrequest", &url))
        .bearer_auth(&bearer_token)
        .header("Content-Type", "application/json")
        .json(&b2c_request)
        .send().await?;
    let jsn_resp = b2c_res.json().await?;
    Ok(jsn_resp)
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;
    // ============== FIXTURES ====================
    async fn generate_request() -> StkPushRequest {
        dotenv().ok();
        let passkey = env::var("MPESA_DARAJA_PASSKEY").expect("Provide Mpesa daraja passkey");
        let till_or_paybill = "174379".to_string();
        let (my_password, timestamp) = generate_daraja_password(till_or_paybill.clone(), passkey).await;
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
    async fn generate_b2c_req() -> B2CRequest {
        dotenv().ok();
        let sec_credentials = env::var("MPESA_B2C_SECURITY_CRED").expect("Provide Security credentials");
        let orgId = Uuid::new_v4();
        B2CRequest {
            OriginatorConversationID: orgId.to_string(),
            InitiatorName: "testapi".to_string(),
            SecurityCredential: sec_credentials,
            CommandID: "SalaryPayment".to_string(),
            Amount: 10,
            PartyA: 600998,
            PartyB: 254708374149,
            Remarks: "Test remarks".to_string(),
            QueueTimeOutURL: "https://mydomain.com/b2c/queue".to_string(),
            ResultURL: "https://mydomain.com/b2/result".to_string(),
            Occasion: "null".to_string(),
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
    #[ignore]
    async fn stk_push_mpesa() {
        let stk_push_res = mpesa_stk_push(generate_request().await).await;
        println!("The mpesa stk push result is {:#?}", stk_push_res);
    }

    // Test b2c api.
    #[tokio::test]
    async fn b2c_payment_test() {
        let b2c_test = mpesa_b2c_settlement(generate_b2c_req().await).await;
        println!("The b2c result is {:#?}", b2c_test);
    }
}
