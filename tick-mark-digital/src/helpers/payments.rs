//! Payments processor interactions
use reqwest::Error;
use serde::{Serialize, Deserialize};
use actix_web::{web};
use dotenvy::dotenv;
use std::env;

// ================== PESAPAL ========================
#[derive(Debug, Serialize, Deserialize)]
pub struct IntegrationDetails {
    consumer_key: String,
    consumer_secret: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IntegrationResult{
    token: String,
    expiryDate: String,
    error: Option<String>,
    status: String,
    message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IPNRegData {
    url: String,
    ipn_notification_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IPNRegDataRes {
    url: String,
    created_date: String,
    ipn_id: String,
    notification_type: u8,
    ipn_notification_type_description: String,
    ipn_status: u8,
    //ipn_status_description: String,
    error: Option<String>,
    status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentRequest {
    id: String,
    currency: String,
    amount: f64,
    description: String,
    callback_url: String,
    redirect_mode: Option<String>,
    notification_id: String,
    branch: String,
    billing_address: BillingAddress,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BillingAddress {
    email_address: String,
    phone_number: String,
    country_code: String,
    first_name: String,
    middle_name: String,
    last_name: String,
    line_1: String,
    line_2: String,
    city: String,
    state: String,
    postal_code: String,
    zip_code: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentRequestRes {
    order_tracking_id: Option<String>,
    merchant_reference: Option<String>,
    redirect_url: Option<String>,
    status: Option<String>,
    error: Option<PesapalErrorResponse>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PesapalErrorResponse {
    pub error: Option<PesapalError>,
    pub status: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PesapalError {
    pub code: Option<String>,
    pub message: Option<String>,
    pub description: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionStatusRes {
    payment_method: Option<String>,
    amount: Option<f64>,
    created_date: Option<String>,
    confirmation_code: Option<String>,
    payment_status_description: Option<String>,
    description: Option<String>,
    message: Option<String>,
    payment_account: Option<String>,
    call_back_url: Option<String>,
    status_code: Option<u8>,
    merchant_reference: Option<String>,
    payment_status_code: Option<String>,
    currency: Option<String>,
    error: Option<TransactionStatusError>,
    status: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionStatusError {
    error_type: Option<String>,
    code: Option<String>,
    message: Option<String>,
    call_back_url: Option<String>
}

pub async fn integration_details() -> (String, String) {
    dotenv().ok();
    let consumer_key = env::var("PESAPAL_CONSUMER_KEY").expect("Provide pesapal consumer key");
    let consumer_secret = env::var("PESAPAL_CONSUMER_SECRET").expect("Provide consumer secret");
    (consumer_key, consumer_secret)
}

/// Authentication in pesapal. Getting auth token.
pub async fn payment_auth(payment_url: String, credentials: IntegrationDetails) -> Result<IntegrationResult, Error> {
    let client = reqwest::Client::new();
    let res = client.post(&payment_url)
        .header("Content-Type", "application/json")
        .json(&credentials)
        .send().await?;
    let auth_res = res.json().await?;
    Ok(auth_res)
}

/// IPN Registraions.(Instant Payment Notification). We'll take ipn id here, and set it to the
/// notification_id
pub async fn ipnregistration(payment_url: String, bearer_token: String, ipnregCred: IPNRegData) -> Result<IPNRegDataRes, Error> {
    let client = reqwest::Client::new();
    let ipn_res = client.post(&payment_url)
        .bearer_auth(&bearer_token)
        .header("Content-type", "application/json")
        .json(&ipnregCred)
        .send().await?;
    let ipn = ipn_res.json().await?;
    Ok(ipn)
}

/// Submit Order Request Endpoint. Creating payment request.
pub async fn payment_request(payment_url: String, bearer_token: String, payload: PaymentRequest) -> Result<PaymentRequestRes, Error> {
    let client = reqwest::Client::new();
    let pay_req = client.post(&payment_url)
        .bearer_auth(&bearer_token)
        .header("Content-type", "application/json")
        .json(&payload)
        .send().await?;
    let res = pay_req.json().await?;
    Ok(res)
}

/// Check transaction status.
pub async fn check_transaction_status(payment_url: String, bearer_token: String, order_tracking_id: String) -> Result<TransactionStatusRes, Error> {
    let client = reqwest::Client::new();
    let pay_confirm = client.get(format!("{}{}", &payment_url, &order_tracking_id))
        .bearer_auth(&bearer_token)
        .send().await?;
    let confirm_res = pay_confirm.json().await?;
    Ok(confirm_res)
}

#[cfg(test)]
mod tests {
    use super::*;
    // ========== FIXTURES ============
    fn payment_request_fixture() -> PaymentRequest {
        PaymentRequest {
            id: "89458379".to_string(),
            currency: "KES".to_string(),
            amount: 1.00,
            description: "Payment description goes here".to_string(),
            callback_url: "https://unnational-intervocalic-lilia.ngrok-free.dev".to_string(),
            redirect_mode: Some("".to_string()),
            notification_id: "a1a6268a-4670-4045-bb8b-e03f928627ec".to_string(),
            branch: "Store Name - HQ".to_string(),
            billing_address: billing_address(),
        }
    }

    fn billing_address() -> BillingAddress {
        BillingAddress {
            email_address: "john.doe@example.com".to_string(),
            phone_number: "0759009593".to_string(),
            country_code: "KE".to_string(),
            first_name: "John".to_string(),
            middle_name: "".to_string(),
            last_name: "Doe".to_string(),
            line_1: "Pesapal limited".to_string(),
            line_2: "".to_string(),
            city: "".to_string(),
            state: "".to_string(),
            postal_code: "".to_string(),
            zip_code: "".to_string(),
        }
    }

    // ========== PESAPAL TESTS =========
    async fn integration_payload() -> IntegrationDetails {
        let (c_key, c_secret) = integration_details().await;
        IntegrationDetails {
            consumer_key: c_key,
            consumer_secret: c_secret,
        }
    }

    fn payment_url() -> String {
        "https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken".to_string()
    }

    fn ipnreg_fixture() -> IPNRegData {
        IPNRegData {
            url: "https://www.myapplication.com/ipn".to_string(),
            ipn_notification_type: "GET".to_string(),
        }
    }

    fn ipnreg_url() -> String {
        "https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN".to_string()
    }

    fn test_token() -> String {
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3VzZXJkYXRhIjoiZWQ2MTkwMGYtZGNiMy00NjM2LWIxNGUtY2U1MGQwYzk2M2I1IiwidWlkIjoicWtpbzFCR0dZQVhUdTJKT2ZtN1hTWE5ydW9ac3JxRVciLCJuYmYiOjE3NTkyOTY0MzgsImV4cCI6MTc1OTMwMDAzOCwiaWF0IjoxNzU5Mjk2NDM4LCJpc3MiOiJodHRwOi8vY3licWEucGVzYXBhbC5jb20vIiwiYXVkIjoiaHR0cDovL2N5YnFhLnBlc2FwYWwuY29tLyJ9.j_DWXdPkryXceBqDb-k93KyBK_82PJ0S_73ZUq4yi6o".to_string()
    }

    fn payment_request_url() -> String {
        "https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest".to_string()
    }

    fn confirm_url() -> String {
        "https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId=".to_string()
    }

    #[tokio::test]
    #[ignore]
    async fn testing_pesapal_keys() {
        let details = integration_details().await;
        println!("The pesapal details are {:#?}", details);
        println!("Testing 1 2");
    }

    #[tokio::test]
    #[ignore]
    async fn auth_test() {
        let cred = integration_payload().await;
        let auth = payment_auth(payment_url(), cred).await;
        println!("The auth res is {:#?}", auth);
    }

    #[tokio::test]
    #[ignore]
    async fn ipnreg_test() {
        let ipn_res = ipnregistration(ipnreg_url(), test_token(), ipnreg_fixture()).await;
        println!("The auth res is {:#?}", ipn_res);
    }

    #[tokio::test]
    #[ignore]
    async fn payment_request_test() {
        let payment_req = payment_request(payment_request_url(), test_token(), payment_request_fixture()).await;
        println!("The payment request is {:#?}", payment_req);
    }

    #[tokio::test]
    #[ignore]
    async fn payment_confirm_test() {
        let o_tracking_id = "4ba76a7f-b15e-41d8-a9cf-db43265aeb48".to_string();
        let cnf = check_transaction_status(confirm_url(), test_token(), o_tracking_id).await;
        println!("Payment confirmation is {:#?}", cnf);
    }
}
