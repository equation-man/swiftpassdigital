//! User handler functions.
use actix_web::{web, HttpResponse};
use crate::models::{User, CreateUser, UserPayload};
use crate::models::db_access::*;
use uuid::Uuid;

#[path="../state.rs"]
mod state;
use state::AppState;

/// User registration or sign up handler
pub async fn user_registration(new_user: web::Json<CreateUser>, app_state: web::Data<AppState>) -> HttpResponse {
    let n_user = add_new_user(&app_state.db, new_user.into()).await;
    HttpResponse::Ok().json(n_user)
}

/// User login handler.
pub async fn user_login(user_cred: web::Json<UserPayload>, app_state: web::Data<AppState>) -> HttpResponse {
    let res = get_users(&app_state.db, user_cred.into()).await;
    HttpResponse::Ok().json(res)
}

/// Handler for updating a user.
pub async fn user_update(payload: web::Json<UserPayload>, params: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let user_id: Uuid = Uuid::parse_str(&params.into_inner()).unwrap();
    let update_user = update_user(&app_state.db, user_id, payload.into()).await;
    HttpResponse::Ok().json(update_user)
}

/// Handler for deleting a user
pub async fn user_delete(params: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let user_id: Uuid = Uuid::parse_str(&params.into_inner()).unwrap();
    let del_user = delete_user(&app_state.db, user_id).await;
    HttpResponse::Ok().json(del_user)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Mutex;
    use uuid::Uuid;
    use actix_web::http::StatusCode;

    // ============== FIXTURES ===============.
    fn register_user_info() -> CreateUser {
        CreateUser {
            first_name: "Bruce".to_string(),
            last_name: "Wayne".to_string(),
            user_name: "brucewayne".to_string(),
            email: "brucewayne@gmail.com".to_string(),
            telephone: "+254789447634".to_string(),
            password: "1234556789".to_string(),
        }
    }

    fn filter_user_fixture() -> UserPayload {
        UserPayload {
            user_id: None,
            user_name: None, //Some("jamesbond".to_string()),
            first_name: None,
            last_name: None,
            email: None,
            telephone: None,
            email_verification: None,
            password: None, //Some("1234556789".to_string()),
        }
    }

    fn payload_fixture() -> UserPayload {
        UserPayload {
            user_id: None,
            user_name: Some("jamesbondman".to_string()),
            first_name: None,
            last_name: None,
            email: None,
            telephone: None,
            email_verification: None,
            password: None, //Some("123456789".to_string()),
        }
    }

    async fn application_state_fixture() -> AppState {
        AppState::new().await
    }

    // ============== STUBS =================.

    // ============== FULL TESTS =============.
    #[actix_web::test]
    #[ignore]
    async fn user_registration_test() {
        let test_app_state: web::Data<AppState> = web::Data::new(application_state_fixture().await);
        let test_new_user = web::Json(register_user_info());
        let resp = user_registration(test_new_user, test_app_state).await;
        assert_eq!(resp.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn user_login_test() {
        let test_app_state: web::Data<AppState> = web::Data::new(application_state_fixture().await);
        let filter_user = web::Json(filter_user_fixture());
        let resp = user_login(filter_user, test_app_state).await;
        println!("The user result is {:#?}", resp.body());
        assert_eq!(resp.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn user_update_test() {
        let test_app_state: web::Data<AppState> = web::Data::new(application_state_fixture().await);
        let payload = web::Json(payload_fixture());
        let user_id = web::Path::from("6191152f-7d88-4ff1-a652-7ef3b349b628".to_string());
        let update = user_update(payload, user_id, test_app_state).await;
        println!("The user result is {:#?}", update.body());
        assert_eq!(update.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn user_delete_test() {
        let test_app_state: web::Data<AppState> = web::Data::new(application_state_fixture().await);
        let user_id = web::Path::from("6191152f-7d88-4ff1-a652-7ef3b349b628".to_string());
        let delete = user_delete(user_id, test_app_state).await;
        println!("The user deleted is {:#?}", delete.body());
        assert_eq!(delete.status(), StatusCode::OK);
    }
}
