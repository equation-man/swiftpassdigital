//! API authentication utils.
use argon2::{password_hash::{rand_core::OsRng, SaltString}, Argon2, PasswordHasher, PasswordVerifier};
use jsonwebtoken::{encode, decode, Header, EncodingKey, DecodingKey, Validation};
use chrono::{Utc, Duration};
use std::error::Error;
use serde::{Deserialize, Serialize};
use crate::models::{User};
use std::env;
use dotenvy::dotenv;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: User,
}

pub async fn load_secret_key() -> Vec<u8> {
    dotenv().ok();
    let secret = env::var("SECRET_KEY").expect("SECRET_KEY must be set");
    secret.into_bytes()
}

pub async fn hash_password(password: String) -> Result<String, Box<dyn Error>> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default().hash_password(password.as_bytes(), &salt).unwrap();
    Ok(hash.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    // =========== FIXTURES ===============
    fn generate_password() -> String {
        "MySuperSecret".to_string()
    }

    #[tokio::test]
    #[ignore]
    async fn test_loading_secrets() {
        let mysecret = load_secret_key().await;
        println!("The secret is {:?}", mysecret);
    }

    #[tokio::test]
    async fn test_hash_password() {
        let hash_str = hash_password(generate_password()).await;
        println!("The password hash is {:#?}", hash_str);
    }
}
