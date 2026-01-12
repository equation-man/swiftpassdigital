//! Mpesa payments processing.
use reqwest::header::{ HeaderMap, HeaderValue, AUTHORIZATION };
use serde::{ Serialize, Deserialize };
use chrono::{Local, DateTime, Utc};
use serde_json::json;
use reqwest::Error;
use dotenvy::dotenv;
use std::env;
use base64;

// =============== MPESA EXPRESS ==================
#[derive(Debug, Clone, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StkPushResponse {
    pub MerchantRequestID: String,
    pub CheckoutRequestID: String,
    pub ResponseCode: String,
    pub ResponseDescription: String,
    pub CustomerMessage: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct B2CResponse {
    ConversationID: String,
    OriginatorConversationID: String,
    ResponseCode: String,
    ResponseDescription: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct C2BTransactionStatus {
    Initiator: String,
    SecurityCredential: String,
    CommandID: String,
    TransactionID: String,
    PartyA: u64,
    IdentifierType: u8,
    ResultURL: String,
    QueueTimeOutURL: String,
    Remarks: String,
    Occassion: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct C2BTransactionStatusResp {
    OriginatorConversationID: String,
    ConversationID: String,
    ResponseCode: String,
    ResponseDescription: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ConfirmStkTransaction {
    pub BusinessShortCode: String,
    pub Password: String,
    pub Timestamp: String,
    pub CheckoutRequestID: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ConfirmStkTransactionResponse {
    pub ResponseCode: String,
    pub ResponseDescription: String,
    pub MerchantRequestID: String,
    pub CheckoutRequestID: String,
    pub ResultCode: String,
    pub ResultDesc: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct DarajaCallback {
    pub Body: Body,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Body {
    pub stkCallback: StkCallback,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct StkCallback {
    pub MerchantRequestID: String,
    pub CheckoutRequestID: String,
    pub ResultCode: i32,
    pub ResultDesc: String,
    #[serde(default)]
    pub CallbackMetadata: Option<CallbackMetadata>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CallbackMetadata {
    pub Item: Vec<CallbackItem>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CallbackItem {
    pub Name: String,
    #[serde(default)]
    pub Value: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct FaultDetail {
    pub fault: Fault,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Fault {
    pub faultstring: String,
    pub detail: FaultCode,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct FaultCode {
    errorcode: String,
}

#[derive(Debug, Clone)]
pub enum StkDarajaResponse {
    Success(ConfirmStkTransactionResponse),
    Fault(FaultDetail)
}

/// Generating daraja password.
pub async fn generate_daraja_password(till_or_paybill: String) -> (String, String) {
    dotenv().ok();
    let passkey = env::var("MPESA_DARAJA_PASSKEY").expect("Provide Mpesa daraja passkey");
    let timestamp = Local::now().format("%Y%m%d%H%M%S").to_string();
    // Combine shortcode, passkey, and timestamp.
    let raw = format!("{}{}{}", &till_or_paybill, &passkey, timestamp);
    // Base64 encode the combination.
    let password = base64::encode(raw);
    (password, timestamp)
}

pub async fn get_daraja_callback(itm_id: String) -> String {
    dotenv().ok();
    let url = env::var("MPESA_DARAJA_CALLBACK").expect("Provide callback url");
    format!("{}/{}", url, itm_id)
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

/// Calculating the commission amount
pub async fn get_comm_percent() -> u8 {
    dotenv().ok();
    let perc_value = env::var("PERCENTAGE_COMMISSION").unwrap_or_else(|_| "6".to_string());
    perc_value.parse::<u8>().unwrap()
}

pub async fn commission_amnt_calc(percent: u8, total_amount: String) -> u64 {
    let total = total_amount.parse::<u64>().unwrap();
    (percent as u64*total)/100
}

pub async fn discount_calc(percent_amount: f64, amount_in_cents: f64) -> f64 {
    let percent_price = 100.0 - percent_amount;
    ((percent_price * amount_in_cents) / 100.0 * 100.0).round() / 100.0
}

pub async fn discount_is_active(end_date: String) -> bool {
    let utc_end_date: DateTime<Utc> = end_date.parse().unwrap();
    Utc::now() < utc_end_date
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
    println!("Parse resp stk {:#?}", &stk_resp);
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

/// Confirm stk push or c2b transaction.
pub async fn stk_c2b_status(c2b_trans_status: C2BTransactionStatus) -> Result<C2BTransactionStatusResp, Error> {
    let (url, bearer_token) = mpesa_auth_details().await;
    let client = reqwest::Client::new();
    let c2b_status = client.post(format!("{}/mpesa/transactionstatus/v1/query", &url))
        .bearer_auth(&bearer_token)
        .header("Content-Type", "application/json")
        .json(&c2b_trans_status)
        .send().await?;
    let res = c2b_status.json().await?;
    Ok(res)
}

/// Confirm stk push transaction query.
pub async fn stk_push_status(stk_status_request: ConfirmStkTransaction) -> Result<StkDarajaResponse, Error> {
    let (url, bearer_token) = mpesa_auth_details().await;
    let client = reqwest::Client::new();
    let stk_status = client.post(format!("{}/mpesa/stkpushquery/v1/query", &url))
        .bearer_auth(&bearer_token)
        .header("Content-Type", "application/json")
        .json(&stk_status_request)
        .send().await?;
    let text = stk_status.text().await?;
    let value: serde_json::Value = serde_json::from_str(&text).unwrap();
    // Detect rate limitting.
    if value.get("fault").is_some() {
        let fault: FaultDetail = serde_json::from_value(value).unwrap();
        return Ok(StkDarajaResponse::Fault(fault));
    }
    let json_res: ConfirmStkTransactionResponse = serde_json::from_value(value).unwrap();
    Ok(StkDarajaResponse::Success(json_res))
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;
    // ============== FIXTURES ====================
    async fn generate_request() -> StkPushRequest {
        dotenv().ok();
        let till_or_paybill = "174379".to_string();
        let (my_password, timestamp) = generate_daraja_password(till_or_paybill.clone()).await;
        StkPushRequest {
            Password: my_password, 
            BusinessShortCode: till_or_paybill.clone(),
            Timestamp: timestamp,
            Amount: "1".to_string(),
            PartyA: "254759009593".to_string(),
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
            Amount: commission_amnt_calc(0 as u64, "1000".to_string()).await,
            PartyA: 600998,
            PartyB: 254708374149,
            Remarks: "Test remarks".to_string(),
            QueueTimeOutURL: "https://mydomain.com/b2c/queue".to_string(),
            ResultURL: "https://mydomain.com/b2/result".to_string(),
            Occasion: "null".to_string(),
        }
    }

    async fn generate_c2b_status() -> C2BTransactionStatus {
        dotenv().ok();
        let sec_cred = env::var("MPESA_B2C_SECURITY_CRED").expect("Provide sec cred");
        C2BTransactionStatus {
            Initiator: "testapi".to_string(),
            SecurityCredential: sec_cred,
            CommandID: "TransactionStatusQuery".to_string(),
            TransactionID: "ws_CO_08102025093200359759009593".to_string(),
            PartyA: 600987,
            IdentifierType: 4,
            ResultURL: "https://mydomain.com/TransactionStatus/result/".to_string(),
            QueueTimeOutURL: "https://mydomain.com/TransactionStatus/queue/".to_string(),
            Remarks: "OK".to_string(),
            Occassion: "null".to_string(),
        }
    }

    async fn confirm_stk_trans() -> ConfirmStkTransaction {
        dotenv().ok();
        let till_or_paybill = "174379".to_string();
        let (my_password, timestamp) = generate_daraja_password(till_or_paybill.clone()).await;
        ConfirmStkTransaction {
            BusinessShortCode: till_or_paybill,
            Password: my_password,
            Timestamp: timestamp,
            CheckoutRequestID: "ws_CO_08102025093200359759009593".to_string(),
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
        println!("The mpesa stk(c2b) push result is {:#?}", stk_push_res);
    }

    // Test stk status
    #[tokio::test]
    #[ignore]
    async fn stk_push_c2b_test() {
        let status = stk_c2b_status(generate_c2b_status().await).await;
        println!("The stk push status is {:#?}", status);
    }

    // STK push status.
    #[tokio::test]
    #[ignore]
    async fn stk_status_push_test() {
        let status = stk_push_status(confirm_stk_trans().await).await;
        println!("The status for stk push is {:#?}", status);
    }

    // Test b2c api.
    #[tokio::test]
    #[ignore]
    async fn b2c_payment_test() {
        let b2c_test = mpesa_b2c_settlement(generate_b2c_req().await).await;
        println!("The b2c result is {:#?}", b2c_test);
    }

    #[tokio::test]
    #[ignore]
    async fn commission_test() {
        let comm_amount = commission_amnt_calc(0 as u64, "1000".to_string()).await;
        println!("The commission amount is: {:#?}", comm_amount);
    }

    // TEST GETTING THE CALLBACK URL CONFIGURATION.
    #[tokio::test]
    #[ignore]
    async fn get_daraja_callback_test() {
        let c_url = get_daraja_callback("item005".to_string()).await;
        println!("The callback url is {}", c_url);
    }
}
