//! Users models.
use crate::models::db_access;
use actix_web::web;
use uuid::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub user_id: Uuid,
    pub first_name: String,
    pub last_name: String,
    pub user_name: String,
    pub email: String,
    pub telephone: String,
    pub email_verification: bool,
}

impl From<web::Json<User>> for User {
    fn from(user: web::Json<User>) -> Self {
        User {
            user_id: user.user_id.clone(),
            first_name: user.first_name.clone(),
            last_name: user.last_name.clone(),
            user_name: user.user_name.clone(),
            email: user.email.clone(),
            telephone: user.telephone.clone(),
            email_verification: user.email_verification.clone(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPayload {
    pub user_id: Option<Uuid>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub user_name: Option<String>,
    pub email: Option<String>,
    pub telephone: Option<String>,
    pub email_verification: Option<bool>,
    pub password: Option<String>,
}

impl From<web::Json<UserPayload>> for UserPayload{
    fn from(filters: web::Json<UserPayload>) -> Self {
        UserPayload {
            user_id: filters.user_id.clone(),
            first_name: filters.first_name.clone(),
            last_name: filters.last_name.clone(),
            user_name: filters.user_name.clone(),
            email: filters.email.clone(),
            telephone: filters.telephone.clone(),
            email_verification: filters.email_verification.clone(),
            password: filters.password.clone(),
        }
    }
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUser {
    pub first_name: String,
    pub last_name: String,
    pub user_name: String,
    pub email: String,
    pub telephone: String,
    pub password: String,
}

impl From<web::Json<CreateUser>> for CreateUser {
    fn from(create_user: web::Json<CreateUser>) -> Self {
        CreateUser {
            first_name: create_user.first_name.clone(),
            last_name: create_user.last_name.clone(),
            user_name: create_user.user_name.clone(),
            email: create_user.email.clone(),
            telephone: create_user.telephone.clone(),
            password: create_user.password.clone(),
        }
    }
}
