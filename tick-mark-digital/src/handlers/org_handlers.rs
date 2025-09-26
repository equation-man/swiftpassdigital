//! Org handler functions
use actix_web::{web, HttpResponse, HttpRequest, HttpMessage};
use actix_identity::{Identity};
use crate::models::{
    Organization, OrgPayload, CreateOrg,
    Contact, CreateContact, ContactPayload,
    CreateAccess, AccessCodesPayload,
    db_access::*,
};
use crate::helpers::{
    NotfoundErrorResponse,
    Claims, AuthResponse, generate_jwt,
    hash_password, verify_password,
    load_secret_key,
};
use uuid::Uuid;
use nanoid::nanoid;

#[path="../state.rs"]
mod state;
use crate::state::AppState;

/// Organization registration handler
pub async fn org_registration(new_org: web::Json<CreateOrg>, app_state: web::Data<AppState>) -> HttpResponse {
    let password_hash = match hash_password(new_org.org_pwd.clone()).await {
        Ok(hash) => hash,
        Err(_) => return HttpResponse::InternalServerError().body("Failed to hash password."),
    };
    let added_org = CreateOrg {
        organization_name: new_org.organization_name.clone(),
        org_email: new_org.org_email.clone(),
        org_pwd: password_hash,
        country: new_org.country.clone(),
    };
    let n_org = add_new_org(&app_state.db, added_org).await;
    HttpResponse::Ok().json(n_org)
}

/// Organization login handler
pub async fn org_login(org_payload: web::Json<OrgPayload>, app_state: web::Data<AppState>) -> HttpResponse {
    let org = get_org_by_pwd(&app_state.db, org_payload.into()).await;
    HttpResponse::Ok().json(org)
}

/// Organization listing handler
pub async fn org_list(org_cred: web::Json<OrgPayload>, app_state: web::Data<AppState>) -> HttpResponse {
    let lst_orgs = get_orgs(&app_state.db, org_cred.into()).await;
    HttpResponse::Ok().json(lst_orgs)
}

/// Updating organization handler.
pub async fn org_update(payload: web::Json<OrgPayload>, params: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let org_id: Uuid = Uuid::parse_str(&params.into_inner()).unwrap();
    let upd_org = update_org(&app_state.db, org_id, payload.into()).await;
    HttpResponse::Ok().json(upd_org)
}

// ================== CONTACTS ====================
/// Adding contact
pub async fn add_contact(new_cont: web::Json<CreateContact>, params: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let org_id: Uuid = Uuid::parse_str(&params.into_inner()).unwrap();
    let n_contact = add_new_contact(&app_state.db, org_id, new_cont.into()).await;
    HttpResponse::Ok().json(n_contact)
}

/// Contact list
pub async fn contact_list(org_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let org_id: Uuid = Uuid::parse_str(&org_id.into_inner()).unwrap();
    let cont_lst = get_contacts(&app_state.db, org_id).await;
    HttpResponse::Ok().json(cont_lst)
}

/// Update contact
pub async fn contact_update(cont_pld: web::Json<ContactPayload>, params: web::Path<(String, String)>, app_state: web::Data<AppState>) -> HttpResponse {
    let (o_id, c_id) = params.into_inner();
    let org_id: Uuid = Uuid::parse_str(&o_id).unwrap();
    let cont_id: Uuid = Uuid::parse_str(&c_id).unwrap();
    let cont_upd = update_contacts(&app_state.db, org_id, cont_id, cont_pld.into()).await;
    HttpResponse::Ok().json(cont_upd)
}

/// Delete contact
pub async fn delete_contact(params: web::Path<(String, String)>, app_state: web::Data<AppState>) -> HttpResponse {
    let (o_id, c_id) = params.into_inner();
    let org_id: Uuid = Uuid::parse_str(&o_id).unwrap();
    let cont_id: Uuid = Uuid::parse_str(&c_id).unwrap();
    let del_cont = delete_contacts(&app_state.db, org_id, cont_id).await;
    HttpResponse::Ok().json(del_cont)
}

// =================== ACCESS MANAGEMENT AND CONTROL ======================
/// Adding access codes 
pub async fn create_access_code(access_pld: web::Json<CreateAccess>, param: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let org_id: Uuid = Uuid::parse_str(&param.into_inner()).unwrap();
    let alphabet: [char; 32] = [
        'A','B','C','D','E','F','G','H','J','K','L','M',
        'N','P','Q','R','S','T','U','V','W','X','Y','Z',
        '2', '3', '4', '5', '6', '7', '8', '9'
    ];
    let code = nanoid!(8, &alphabet);
    let n_access = add_access_code(&app_state.db, org_id, code, access_pld.into()).await;
    HttpResponse::Ok().json(n_access)
}

/// Getting access codes
pub async fn list_access_codes(filter: Option<web::Json<AccessCodesPayload>>, param: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let org_id: Uuid = Uuid::parse_str(&param.into_inner()).unwrap();
    match filter {
        Some(filter) => {
            let lst_codes = get_access_codes(&app_state.db, org_id, filter.into()).await;
            HttpResponse::Ok().json(lst_codes)
        },
        None => {
            let access_payload = AccessCodesPayload {
                access_code_id: None,
                organization_id: None,
                user_id: None,
                access_username: None,
                access_code: None,
            };
            let lst = get_access_codes(&app_state.db, org_id, access_payload).await;
            HttpResponse::Ok().json(lst)
        }
    }
}

/// Get an organization via access code
pub async fn get_org_via_code(filter: web::Json<AccessCodesPayload>, app_state: web::Data<AppState>) -> HttpResponse {
    let access_pld = org_access(&app_state.db, filter.into()).await;
    HttpResponse::Ok().json(access_pld)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Mutex;
    use crate::models::ContactType;
    use actix_web::http::StatusCode;

    // ================= FIXTURES ================
    fn register_org_info() -> CreateOrg {
        CreateOrg {
            organization_name: "KCAA".to_string(),
            org_email: "kcaa@example.com".to_string(),
            org_pwd: "1234556789".to_string(),
            country: "Kenya".to_string(),
        }
    }

    fn filter_orgs_fixture() -> OrgPayload {
        OrgPayload {
            organization_id: None,
            organization_name: None,
            organization_username: None,
            org_email: None,
            org_pwd: None,
            country: None,
            description: Some("Kiambu county swimming federation".to_string()),//None,
        }
    }

    fn org_contact_fixture() -> CreateContact {
        CreateContact {
            organization_id: Uuid::parse_str("029da29a-d932-4ed4-a978-09d5caec43fe").unwrap(),
            contact_type: ContactType::Telephone,
            contact: "0759334782".to_string(),
        }
    }

    fn org_contact_pld_fixture() -> ContactPayload {
        ContactPayload {
            contact_id: None,
            organization_id: None,
            contact_type: None,
            contact: Some("0789003422".to_string()),
        }
    }

    fn org_create_access_fixture() -> CreateAccess {
        CreateAccess {
            user_id: Uuid::parse_str("029da29a-d932-4ed4-a978-09d5caec43fe").unwrap(),
            access_username: "brucewayne".to_string(),
        }
    }

    fn org_login_fixture() -> AccessCodesPayload {
        AccessCodesPayload {
            access_code_id: None,
            organization_id: None,
            user_id: None,
            access_username: None,
            access_code: None,
        }
    }

    async fn app_state_fixture() -> AppState {
        AppState::new().await
    }

    // ================= FULL TESTS ==============
    #[actix_web::test]
    #[ignore]
    async fn org_registration_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state_fixture().await);
        let test_new_org = web::Json(register_org_info());
        let resp = org_registration(test_new_org, test_state).await;
        println!("The result is {:#?}", resp.body());
        assert_eq!(resp.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn org_list_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state_fixture().await);
        let filter_org = web::Json(filter_orgs_fixture());
        let resp_lst = org_list(filter_org.into(), test_state).await;
        println!("The orgs list result is {:#?}", resp_lst.body());
        assert_eq!(resp_lst.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn org_update_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state_fixture().await);
        let payload = web::Json(filter_orgs_fixture());
        let org_id = web::Path::from("029da29a-d932-4ed4-a978-09d5caec43fe".to_string());
        let resp_upd = org_update(payload.into(), org_id, test_state).await;
        println!("The resp upd {:#?}", resp_upd.body());
        assert_eq!(resp_upd.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn add_contact_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state_fixture().await);
        let org_id = web::Path::from("029da29a-d932-4ed4-a978-09d5caec43fe".to_string());
        let contact = web::Json(org_contact_fixture());
        let cont_add = add_contact(contact.into(), org_id, test_state).await;
        println!("The added contact is {:#?}", cont_add.body());
        assert_eq!(cont_add.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn contact_list_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state_fixture().await);
        let org_id = web::Path::from("029da29a-d932-4ed4-a978-09d5caec43fe".to_string());
        let cont_lst = contact_list(org_id, test_state).await;
        println!("The list of contacts are {:#?}", cont_lst.body());
        assert_eq!(cont_lst.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn contact_update_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state_fixture().await);
        let params = web::Path::from((
            "029da29a-d932-4ed4-a978-09d5caec43fe".to_string(),
            "42381125-eedc-4be8-b5eb-17ee67aa2ad3".to_string(),
        ));
        let upd_pld = web::Json(org_contact_pld_fixture());
        let cont_upd = contact_update(upd_pld.into(), params, test_state).await;
        println!("The updated contact is {:#?}", cont_upd.body());
        assert_eq!(cont_upd.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn contact_delete_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state_fixture().await);
        let params = web::Path::from((
            "029da29a-d932-4ed4-a978-09d5caec43fe".to_string(),
            "42381125-eedc-4be8-b5eb-17ee67aa2ad3".to_string(),
        ));
        let del = delete_contact(params, test_state).await;
        println!("The deleted contact is {:#?}", del.body());
        assert_eq!(del.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn access_code_add_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state_fixture().await);
        let param = web::Path::from("029da29a-d932-4ed4-a978-09d5caec43fe".to_string());
        let pyld = web::Json(org_create_access_fixture());
        let new_access = create_access_code(pyld, param, test_state).await;
        println!("The added access code is {:#?}", new_access.body());
        assert_eq!(new_access.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn list_access_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state_fixture().await);
        let param = web::Path::from("029da29a-d932-4ed4-a978-09d5caec43fe".to_string());
        let filter_pyld = None; //web::Json();
        let lst_access = list_access_codes(filter_pyld, param, test_state).await;
        println!("The list of access codes are {:#?}", lst_access.body());
        assert_eq!(lst_access.status(), StatusCode::OK);

    }

}
