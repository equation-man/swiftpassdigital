//! Beta payment processor interactions
use reqwest::Error;
use serde::{Serialize, Deserialize};
use actix_web::{web};

#[derive(Debug, Serialize, Deserialize)]
pub struct SubAccount {
    business_name: String,
    settlement_bank: String,
    account_number: String,
    percentage_charge: Option<f64>,
    description: Option<String>,
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

/// Creating a subaccount where to deposit ticket sales funds after fees.
async fn create_subaccnt(payment_url: String, subaccount_payload: SubAccount) -> Result<SubAccountResult, Error> {
    let client = reqwest::Client::new();
    let res = client.post(&payment_url)
        .bearer_auth("sk_test_be74a6aae684bbcfb2a29831ca06c50d2c879000")
        .header("Content-Type", "application/json")
        .json(&subaccount_payload)
        .send().await?;
    let subaccnt_result: SubAccountResult = res.json().await?;
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
            business_name: "Organization Ltd".to_string(),
            settlement_bank: "MPESA".to_string(),
            account_number: "254711111111".to_string(),
            percentage_charge: Some(6.0),
            description: Some("Subaccount wallet for Organization Ltd".to_string()),
        }
    }

    fn sub_accnt_url() -> String {
        //"https://api.paystack.co/bank?country=kenya".to_string()
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

    // ========== REAL TESTS ==========
    #[tokio::test]
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
