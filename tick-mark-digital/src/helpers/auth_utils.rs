//! API authentication utils.
use argon2::{password_hash::{rand_core::OsRng, SaltString}, Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
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

pub async fn verify_password(hash: &str, password: String) -> Result<bool, Box<dyn Error>>{
    let pwd_hash = PasswordHash::new(hash).unwrap();
    Ok(Argon2::default().verify_password(password.as_bytes(), &pwd_hash).is_ok())
}

pub async fn generate_jwt(email: &str, secret_key: &[u8]) -> Result<String, Box<dyn Error>>{
    let expiration=Utc::now().checked_add_signed(Duration::hours(24)).expect("valid timestamp").timestamp() as usize;
    let claims = Claims {
        sub: email.to_string(),
        exp: expiration,
    };
    let token=encode(&Header::default(), &claims, &EncodingKey::from_secret(secret_key))?;
    Ok(token)
}

pub async fn verify_jwt(token: &str, secret_key: &[u8]) -> Result<Claims, Box<dyn Error>> {
    let token_data=decode::<Claims>(token, &DecodingKey::from_secret(secret_key), &Validation::default())?;
    Ok(token_data.claims)
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
    #[ignore]
    async fn test_and_verify_hash_password() {
        let hash_str = hash_password(generate_password()).await;
        println!("The password hash is {:#?}", hash_str);
        let verif = verify_password(&hash_str.unwrap(), generate_password()).await;
        println!("The password verification is {}", verif.unwrap());
    }

    #[tokio::test]
    async fn test_generate_jwt() {
        let jwt=generate_jwt("abrakadabra@gmail.com", &load_secret_key().await).await;
        //println!("The web token is {}", jwt.unwrap());
        let verify_token=verify_jwt(&jwt.unwrap(), &load_secret_key().await).await;
        println!("The token verification is {:#?}", verify_token);
    }
}
