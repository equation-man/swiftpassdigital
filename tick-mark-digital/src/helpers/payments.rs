//! Payments processor interactions
use reqwest::Error;
use serde::{Serialize, Deserialize};
use actix_web::{web};

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

/// Creating a subaccount where to deposit ticket sales funds after fees.
async fn create_subaccnt(payment_url: String, subaccount_payload: SubAccount) -> Result<SubAccountResult, Error> {
    let client = reqwest::Client::new();
    let res = client.post(&payment_url)
        .bearer_auth("sk_test_be74a6aae684bbcfb2a29831ca06c50d2c879000")
        .header("Content-Type", "application/json")
        .json(&subaccount_payload)
        .send().await?;
    let result: SubAccountResult = res.json().await?;
    Ok(result)
}

/// Initialize split transactions.
async fn init_split_trans(payment_url: String, payload: InitializeSplitPayment) -> Result<InitializeSplitPaymentResult, Error> {
    let client = reqwest::Client::new();
    let res = client.post(&payment_url)
        .bearer_auth("sk_test_be74a6aae684bbcfb2a29831ca06c50d2c879000")
        .header("Content-Type", "application/json")
        .json(&payload)
        .send().await?;
    let result: InitializeSplitPaymentResult = res.json().await?;
    Ok(result)
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

    fn init_split_fixture() -> InitializeSplitPayment {
        InitializeSplitPayment {
            email: "bigtechguyz@gmail.com".to_string(),
            amount: "1000".to_string(),
            subaccount: "ACCT_xa89kyc7gtujnzh".to_string(),
        }
    }

    // ========== REAL TESTS ==========
    #[tokio::test]
    #[ignore]
    async fn creating_sub_account_test() {
        let sub_accnt = create_subaccnt(sub_accnt_url(), sub_accnt_fixture()).await;
        println!("The sub account creation {:#?}", sub_accnt);
    }

    #[tokio::test]
    async fn initialize_payment_test() {
        let init_trans = init_split_trans(init_split_payment_url(), init_split_fixture()).await;
        println!("The initialized split transaction result is {:#?}", init_trans);
    }
}
