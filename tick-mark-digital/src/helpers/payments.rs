//! Payments processor interactions
use reqwest::Error;
use serde::{Serialize, Deserialize};
use actix_web::{web};
use dotenvy::dotenv;
use std::env;

#[derive(Debug, Serialize, Deserialize)]
pub struct SubAccount {
    business_name: String,
    bank_code: String,
    account_number: String,
    percentage_charge: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubAccountResult {
    status: bool,
    message: String,
    data: Option<SubAccountResData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubAccountResData {
    business_name: String,
    account_number: String,
    percentage_charge: u8,
    settlement_bank: String,
    currency: String,
    bank: u64,
    integration: u64,
    domain: String,
    account_name: String,
    product: String,
    managed_by_integration: u64,
    subaccount_code: String,
    is_verified: bool,
    settlement_schedule: String,
    active: bool,
    migrate: bool,
    id: u64,
    createdAt: String,
    updatedAt: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InitializeSplitPayment {
    email: String,
    amount: String,
    subaccount: String,
    callback_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InitializeSplitPaymentResult {
    status: bool,
    message: String,
    data: Option<InitializeSplitPaymentResData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InitializeSplitPaymentResData {
    authorization_url: String,
    access_code: String,
    reference: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyPaymentRes {
    status: bool,
    message: String,
    data: Option<VerifyPaymentResData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyPaymentResData {
    id: u64,
    domain: String,
    status: String,
    reference: String,
    receipt_number: Option<String>,
    amount: u64,
    message: Option<String>,
    gateway_response: String,
}

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

pub async fn integration_details() -> (String, String) {
    dotenv().ok();
    let consumer_key = env::var("PESAPAL_CONSUMER_KEY").expect("Provide pesapal consumer key");
    let consumer_secret = env::var("PESAPAL_CONSUMER_SECRET").expect("Provide consumer secret");
    (consumer_key, consumer_secret)
}

/// Authentication in pesapal.
pub async fn payment_auth(payment_url: String, credentials: IntegrationDetails) -> Result<IntegrationResult, Error> {
    let client = reqwest::Client::new();
    let res = client.post(&payment_url)
        .header("Content-Type", "application/json")
        .json(&credentials)
        .send().await?;
    let auth_res = res.json().await?;
    Ok(auth_res)
}

/// IPN Registraions.(Instant Payment Notification)
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

/// Creating a subaccount where to deposit ticket sales funds after fees.
async fn create_subaccnt(payment_url: String, subaccount_payload: SubAccount) -> Result<SubAccountResult, Error> {
    let client = reqwest::Client::new();
    let res = client.post(&payment_url)
        .header("Content-Type", "application/json")
        .json(&subaccount_payload)
        .send().await?;
    let subaccnt_result = res.json().await?;
    Ok(subaccnt_result)
}

/// Initialize split transactions.
async fn init_split_trans(payment_url: String, payload: InitializeSplitPayment) -> Result<InitializeSplitPaymentResult, Error> {
    let client = reqwest::Client::new();
    let res = client.post(&payment_url)
        .bearer_auth("sk_test_be74a6aae684bbcfb2a29831ca06c50d2c879000")
        .header("Content-Type", "application/json")
        .json(&payload)
        .send().await?;
    let split_result: InitializeSplitPaymentResult = res.json().await?;
    Ok(split_result)
}

/// Verify transactions
async fn verify_trans(target_url: String) -> Result<VerifyPaymentRes, Error> {
    let client = reqwest::Client::new();
    let res = client.get(&target_url)
        .bearer_auth("sk_test_be74a6aae684bbcfb2a29831ca06c50d2c879000")
        .send().await?;
    let verify_result: VerifyPaymentRes = res.json().await?;
    Ok(verify_result)
}

#[cfg(test)]
mod tests {
    use super::*;
    // ========== FIXTURES ============
    fn sub_accnt_fixture() -> SubAccount {
        SubAccount {
            business_name: "John Doe Events".to_string(),
            bank_code: "057".to_string(),
            account_number: "0000000000".to_string(),
            percentage_charge: Some(6.0),
        }
    }

    fn sub_accnt_url() -> String {
        "https://api.paystack.co/subaccount".to_string()
    }

    fn init_split_payment_url() -> String {
        "https://api.paystack.co/transaction/initialize".to_string()
    }

    fn verify_payment_url(reference: &str) -> String {
      let ref_url = format!("https://api.paystack.co/transaction/verify/{}", reference);
      ref_url.to_string()
    }

    fn init_split_fixture() -> InitializeSplitPayment {
        InitializeSplitPayment {
            email: "bigtechguyz@gmail.com".to_string(),
            amount: "1000".to_string(),
            subaccount: "ACCT_xa89kyc7gtujnzh".to_string(),
            callback_url: "http://localhost:3000/event/5f51badb-acfe-4b0f-8b9d-6a2d96a5fd1e".to_string()
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
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3VzZXJkYXRhIjoiZWQ2MTkwMGYtZGNiMy00NjM2LWIxNGUtY2U1MGQwYzk2M2I1IiwidWlkIjoicWtpbzFCR0dZQVhUdTJKT2ZtN1hTWE5ydW9ac3JxRVciLCJuYmYiOjE3NTkxODE5MTEsImV4cCI6MTc1OTE4NTUxMSwiaWF0IjoxNzU5MTgxOTExLCJpc3MiOiJodHRwOi8vY3licWEucGVzYXBhbC5jb20vIiwiYXVkIjoiaHR0cDovL2N5YnFhLnBlc2FwYWwuY29tLyJ9.vcZAZ8iqPJs4VhtR2_gmsf13QW05WxztFKRVBRsjux8".to_string()

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
    async fn ipnreg_test() {
        let ipn_res = ipnregistration(ipnreg_url(), test_token(), ipnreg_fixture()).await;
        println!("The auth res is {:#?}", ipn_res);
    }

    // ========== REAL TESTS ==========
    #[tokio::test]
    #[ignore]
    async fn creating_sub_account_test() {
        let sub_accnt = create_subaccnt(sub_accnt_url(), sub_accnt_fixture()).await;
        println!("The sub account creation {:#?}", sub_accnt);
    }

    #[tokio::test]
    #[ignore]
    async fn initialize_payment_test() {
        let init_trans = init_split_trans(init_split_payment_url(), init_split_fixture()).await;
        println!("The initialized split transaction result is {:#?}", init_trans);
    }


    #[tokio::test]
    #[ignore]
    async fn verfying_payment_test() {
        let url = verify_payment_url("mz2233rb2z");
        let verification = verify_trans(url).await;
        println!("The payment url is result is {:#?}", verification);
    }
}
