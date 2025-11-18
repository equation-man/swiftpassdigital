//! Beta payment processor interactions
use reqwest::Error;
use serde::{Serialize, Deserialize};
use serde_json::Value;
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

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateSubaccount {
    #[serde(skip_serializing_if="Option::is_none")]
    pub business_name: Option<String>,
    #[serde(skip_serializing_if="Option::is_none")]
    pub settlement_bank: Option<String>,
    #[serde(skip_serializing_if="Option::is_none")]
    pub account_number: Option<String>,
    #[serde(skip_serializing_if="Option::is_none")] 
    pub percentage_charge: Option<f64>,
    #[serde(skip_serializing_if="Option::is_none")]
    pub description: Option<String>,
}

impl From<web::Json<UpdateSubaccount>> for UpdateSubaccount {
    fn from(subaccnt: web::Json<UpdateSubaccount>) -> Self {
        UpdateSubaccount {
            business_name: subaccnt.business_name.clone(),
            settlement_bank: subaccnt.settlement_bank.clone(),
            account_number: subaccnt.account_number.clone(),
            percentage_charge: subaccnt.percentage_charge.clone(),
            description: subaccnt.description.clone()
        }
    }
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

/// Getting paystack callback url
pub async fn get_paystack_callback(ticket_id: String, event_id: String, email: String, contact: String) -> String {
    dotenv().ok();
    let url = env::var("PAYSTACK_PAYMENT_CALLBACK").expect("Provide callback url");
    format!("{}/verify/{}?event_id={}&email={}&phone={}", url, ticket_id, event_id, email, contact)
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
pub async fn verify_trans(reference: String) -> Result<VerifyPaymentRes, Error> {
    let (payment_url, access_key) = paystack_integration().await;
    let client = reqwest::Client::new();
    let res = client.get(format!("{}/transaction/verify/{}",&payment_url, &reference))
        .bearer_auth(&access_key)
        .send().await?;
    let verify_result: VerifyPaymentRes = res.json().await?;
    Ok(verify_result)
}

pub async fn get_paystack_bank_lists() -> Result<Option<Vec<Value>>, Error> {
    let (payment_url, access_key) = paystack_integration().await;
    let  client = reqwest::Client::new();
    let res = client.get(format!("{}/bank?country=kenya", &payment_url))
        .bearer_auth(&access_key)
        .send().await?;
    let res_json: Value = res.json().await?;
    // Get the "data" array safely
    let mut banks: Option<Vec<Value>> = None;
    if let Some(array) = res_json["data"].as_array() {
        // Filter active events
        banks = Some(array
            .iter()
            .cloned()
            .filter(|item| item["country"] == "Kenya".to_string())
            .collect());

        return Ok(banks);
    }
    Ok(None)
}

pub async fn upd_paystack_subaccnt(subaccnt_id: String, update_data: UpdateSubaccount) -> Result<Value, Error>{
    let (payment_url, access_key) = paystack_integration().await;
    let client = reqwest::Client::new();
    let res = client.put(format!("{}/subaccount/{}", &payment_url, &subaccnt_id))
        .bearer_auth(&access_key)
        .send().await?;
    let res_json: Value = res.json().await?;
    Ok(res_json)
}

pub async fn get_paystack_subaccnt(subaccnt_id: String) -> Result<Value, Error>{
    let (payment_url, access_key) = paystack_integration().await;
    let client = reqwest::Client::new();
    let res = client.get(format!("{}/subaccount/{}", &payment_url, &subaccnt_id))
        .bearer_auth(&access_key)
        .send().await?;
    let res_json: Value = res.json().await?;
    Ok(res_json)
}

#[cfg(test)]
mod tests {
    use super::*;

    // ========== FIXTURES ============
    fn sub_accnt_fixture() -> SubAccount {
        SubAccount {
            business_name: "Events Organization Ltd".to_string(),
            settlement_bank: "Zenith Bank".to_string(),
            account_number: "0000000000".to_string(),
            percentage_charge: Some(10),
            description: Some("Subaccount wallet for Events Organization Ltd".to_string()),
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
            subaccount: "ACCT_cmjmenayvnae4hw".to_string(),
            callback_url: "http://localhost:3000/event/5f51badb-acfe-4b0f-8b9d-6a2d96a5fd1e".to_string()
        }
    }

    // ========== REAL TESTS ==========
    #[tokio::test]
    #[ignore]
    async fn paystack_bank_lists() {
        let lst = get_paystack_bank_lists().await;
        println!("The banks lists is {:#?}", lst);
    }

    #[tokio::test]
    #[ignore]
    async fn creating_sub_account_test() {
        let sub_accnt = create_subaccnt(sub_accnt_fixture()).await;
        println!("The sub account creation {:#?}", sub_accnt);
    }

    #[tokio::test]
    #[ignore]
    async fn initialize_payment_test() {
        let init_trans = init_split_trans(init_split_fixture()).await;
        println!("The initialized split transaction result is {:#?}", init_trans);
    }

    #[tokio::test]
    #[ignore]
    async fn verfying_payment_test() {
        let verification = verify_trans("8te15wq0x5".to_string()).await;
        println!("The payment url is result is {:#?}", verification);
    }

    #[tokio::test]
    #[ignore]
    async fn update_paystack_subaccnt_test() {
        let upd_data = UpdateSubaccount {
            business_name: None,
            settlement_bank: None,
            account_number: None,
            percentage_charge: Some(0.0),
            description: Some("Subaccount wallet updated".to_string()),
        };
        let upd_val = upd_paystack_subaccnt("ACCT_78r6yma9pjolxpo".to_string(), upd_data).await;
        println!("The subaccount wallet update is {:#?}", &upd_val);
    }

    #[tokio::test]
    #[ignore]
    async fn get_paystack_details() {
        let resp = get_paystack_subaccnt("ACCT_78r6yma9pjolxpo".to_string()).await;
        println!("The subaccount details are {:#?}", &resp);
    }
}
