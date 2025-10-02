//! Beta payment processor interactions
use reqwest::Error;
use serde::{Serialize, Deserialize};
use actix_web::{web};
use dotenvy::dotenv;
use std::env;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubAccount {
    pub business_name: String,
    pub settlement_bank: String,
    pub account_number: String,
    pub percentage_charge: Option<u8>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubAccountResult {
    pub status: bool,
    pub message: String,
    pub data: Option<SubAccountResData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubAccountResData {
    pub business_name: String,
    pub account_number: String,
    pub percentage_charge: u8,
    pub settlement_bank: String,
    pub currency: String,
    pub bank: u64,
    pub integration: u64,
    pub domain: String,
    //account_name: String,
    pub product: String,
    pub managed_by_integration: u64,
    pub subaccount_code: String,
    pub is_verified: bool,
    pub settlement_schedule: String,
    pub active: bool,
    pub migrate: bool,
    pub id: u64,
    pub createdAt: String,
    pub updatedAt: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitializeSplitPayment {
    pub email: String,
    pub amount: String,
    pub subaccount: String,
    pub callback_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitializeSplitPaymentResult {
    pub status: bool,
    pub message: String,
    pub data: Option<InitializeSplitPaymentResData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitializeSplitPaymentResData {
    pub authorization_url: String,
    pub access_code: String,
    pub reference: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyPaymentRes {
    pub status: bool,
    pub message: String,
    pub data: Option<VerifyPaymentResData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyPaymentResData {
    pub id: u64,
    pub domain: String,
    pub status: String,
    pub reference: String,
    pub receipt_number: Option<String>,
    pub amount: u64,
    pub message: Option<String>,
    pub gateway_response: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaystackWalletDetails {
    pub owner_id: String,
    pub business_name: String,
    pub account_number: String,
    pub percentage_charge: f64,
    pub settlement_bank: String,
    pub currency: String,
    pub subaccount_code: String,
    pub wallet_email: String,
}

/// Load payment url and access key.
async fn paystack_integration() -> (String, String) {
    dotenv().ok();
    let payment_url = env::var("PAYSTACK_URL").expect("Provide paystack url");
    let access_token = env::var("PAYSTACK_ACCESS_KEY").expect("Provide access token");
    (payment_url, access_token)
}

/// Creating a subaccount where to deposit ticket sales funds after fees.
pub async fn create_subaccnt(subaccount_payload: SubAccount) -> Result<SubAccountResult, Error> {
    let (payment_url, access_key) = paystack_integration().await;
    let client = reqwest::Client::new();
    let res = client.post(format!("{}/subaccount",&payment_url))
        .bearer_auth(&access_key)
        .header("Content-Type", "application/json")
        .json(&subaccount_payload)
        .send().await?;
    let subaccnt_result: SubAccountResult = res.json().await?;
    Ok(subaccnt_result)
}

/// Initialize split transactions.
pub async fn init_split_trans(payload: InitializeSplitPayment) -> Result<InitializeSplitPaymentResult, Error> {
    let (payment_url, access_key) = paystack_integration().await;
    let client = reqwest::Client::new();
    let res = client.post(format!("{}/transaction/initialize",&payment_url))
        .bearer_auth(&access_key)
        .header("Content-Type", "application/json")
        .json(&payload)
        .send().await?;
    let split_result: InitializeSplitPaymentResult = res.json().await?;
    Ok(split_result)
}

/// Verify transactions
pub async fn verify_trans(reference: String, access_key: String) -> Result<VerifyPaymentRes, Error> {
    let (payment_url, access_key) = paystack_integration().await;
    let client = reqwest::Client::new();
    let res = client.get(format!("{}/transaction/verify/{}",&payment_url, &reference))
        .bearer_auth(&access_key)
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
            account_number: "0711111111".to_string(),
            percentage_charge: Some(6),
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
    #[ignore]
    async fn creating_sub_account_test() {
        let sub_accnt = create_subaccnt(sub_accnt_fixture()).await;
        println!("The sub account creation {:#?}", sub_accnt);
    }

    #[tokio::test]
    #[ignore]
    async fn initialize_payment_test() {
        //let init_trans = init_split_trans(init_split_payment_url(), init_split_fixture()).await;
        //println!("The initialized split transaction result is {:#?}", init_trans);
        todo!();
    }

    #[tokio::test]
    #[ignore]
    async fn verfying_payment_test() {
        //let url = verify_payment_url("mz2233rb2z");
        //let verification = verify_trans(url).await;
        //println!("The payment url is result is {:#?}", verification);
        todo!();
    }
}
