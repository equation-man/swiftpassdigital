//! Org handler functions
use actix_web::{web, HttpResponse, HttpRequest, HttpMessage};
use actix_identity::{Identity};
use crate::models::{
    Organization, OrgPayload, CreateOrg,
    Contact, CreateContact, ContactPayload,
    CreateAccess, AccessCodesPayload,
    NewUserWalletData, CreateWallet, Wallet, WalletPayload,
    db_access::*,
};
use crate::helpers::{
    NotfoundErrorResponse,
    Claims, AuthResponse, generate_jwt,
    hash_password, verify_password,
    load_secret_key, get_comm_percent,
    SubAccount, InitializeSplitPayment, PaystackWalletDetails,
    create_subaccnt, get_paystack_bank_lists,
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
pub async fn org_login(org_payload: web::Json<OrgPayload>, app_state: web::Data<AppState>, req: HttpRequest) -> HttpResponse {
    let org_res = get_org_by_email(&app_state.db, org_payload.clone().into()).await;
    if let Some(org) = org_res {
        let logged_org = org.clone();
        if verify_password(&logged_org.org_pwd, org_payload.org_pwd.clone().unwrap()).await.unwrap_or(false) {
            let token = match generate_jwt(&logged_org.org_email.clone(), &load_secret_key().await).await {
                Ok(token) => token,
                Err(_) => return HttpResponse::InternalServerError().body("Failed to generate token")
            };
            Identity::login(&mut req.extensions_mut(), logged_org.org_email.clone()).unwrap();

            let user = Organization {
                organization_id: logged_org.organization_id,
                organization_name: logged_org.organization_name,
                organization_username: logged_org.organization_username,
                org_email: logged_org.org_email,
                country: logged_org.country,
                description: logged_org.description,
            };
            let response = AuthResponse { token, user };
            return HttpResponse::Ok().json(response);
        } else {
            HttpResponse::Unauthorized().body("Invalid Credentials")
        }
    } else {
        HttpResponse::NotFound().json(NotfoundErrorResponse {
            error: "User not found".into(),
            code: 404
        })
    }
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

// ================== WALLETS =====================
pub async fn new_mpesa_wallet(wallet_details: web::Json<NewUserWalletData>, org_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let o_id: Uuid = Uuid::parse_str(&org_id.into_inner()).unwrap();
    let mpesa_wallet = CreateWallet {
        owner_id: o_id,
        business_name: wallet_details.business_name.clone(),
        settlement_bank: wallet_details.settlement_bank.clone(),
        account_number: wallet_details.account_number.clone(),
        percentage_charge: "10".to_string(),
        subaccount_code: "NO_SUBACCOUNT_CODE".to_string(),
        currency: "KES".to_string(),
        wallet_email: wallet_details.wallet_email.clone(),
    };
    let m_wallet = create_org_wallet(&app_state.db, o_id, mpesa_wallet).await;
    HttpResponse::Ok().json(m_wallet)
}

// New paystack wallet creation
pub async fn new_wallet(wallet_details: web::Json<NewUserWalletData>, org_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let details = SubAccount {
        business_name: wallet_details.business_name.clone(),
        settlement_bank: wallet_details.settlement_bank.clone(),
        account_number: wallet_details.account_number.clone(),
        percentage_charge: Some(get_comm_percent().await),
        description: Some("Subaccount wallet created".to_string()),
    };
    match create_subaccnt(details).await {
        Ok(subaccnt_res) => {
            let res = subaccnt_res.data.unwrap();
            let owner_id: Uuid = Uuid::parse_str(&org_id.into_inner()).unwrap();
            let new_wallet = CreateWallet {
                owner_id: owner_id,
                business_name: res.business_name.clone(),
                account_number: res.account_number.clone(),
                settlement_bank: res.settlement_bank.clone(),
                percentage_charge: res.percentage_charge.clone().to_string(),
                subaccount_code: res.subaccount_code.clone(),
                currency: res.currency.clone(),
                wallet_email: wallet_details.wallet_email.clone(),
            };
            let new_wallet = create_org_wallet(&app_state.db, owner_id, new_wallet).await;
            HttpResponse::Ok().json(new_wallet)
        },
        Err(err) => {
            HttpResponse::InternalServerError().body("Subaccount not created")
        }
    }
}

pub async fn get_wallet(org_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    match Uuid::parse_str(&org_id.into_inner()) {
        Ok(owner_id) => {
            let wallet = get_org_wallet(&app_state.db, owner_id).await;
            HttpResponse::Ok().json(wallet)
        },
        Err(_) => return HttpResponse::BadRequest().body("Invalid UUID")
    }
}

pub async fn get_supported_banks(org_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    match Uuid::parse_str(&org_id.into_inner()) {
        Ok(org_id) => {
            match get_paystack_bank_lists().await {
                Ok(lsts) => {
                    return HttpResponse::Ok().json(lsts);
                },
                Err(_) => return HttpResponse::BadRequest().body("Error fetching banks")
            }
        },
        Err(_) => return HttpResponse::BadRequest().body("Invalid UUID when getting banks")
    }
}

pub async fn delete_wallet(wallet_id: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let w_id: Uuid = Uuid::parse_str(&wallet_id.into_inner()).unwrap();
    let wallet = delete_org_wallet(&app_state.db, w_id).await;
    HttpResponse::Ok().json(wallet)
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
pub async fn list_access_codes(param: web::Path<String>, app_state: web::Data<AppState>) -> HttpResponse {
    let org_id: Uuid = Uuid::parse_str(&param.into_inner()).unwrap();
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

/// Get an organization via access code
pub async fn get_org_via_code(filter: web::Json<AccessCodesPayload>, app_state: web::Data<AppState>, req: HttpRequest) -> HttpResponse {
    let access_pld = org_manage_access(&app_state.db, filter.into()).await;
    if let Some(org_acc) = access_pld {
        let logged_acc = org_acc.clone();
        let token = match generate_jwt(&logged_acc.access_username.clone(), &load_secret_key().await).await {
            Ok(token) => token,
            Err(_) => return HttpResponse::InternalServerError().body("Failed to generate token")
        };
        Identity::login(&mut req.extensions_mut(), logged_acc.access_username.clone()).unwrap();
        let response = AuthResponse { token, user: logged_acc };
        return HttpResponse::Ok().json(response)
    } else {
        HttpResponse::NotFound().json(NotfoundErrorResponse {
            error: "User not found".into(),
            code: 404
        })
    }
}

/// Delete access or code access.
pub async fn revoke_access(ids: web::Path<(String, String)>, app_state: web::Data<AppState>) -> HttpResponse {
    let (org_id, access_code_id) = ids.into_inner();
    let org_uuid: Uuid = Uuid::parse_str(&org_id).unwrap();
    let access_uuid: Uuid = Uuid::parse_str(&access_code_id).unwrap();
    let remove_access = delete_access_code(&app_state.db, org_uuid, access_uuid).await;
    HttpResponse::Ok().json(remove_access)
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
            //user_id: Uuid::parse_str("029da29a-d932-4ed4-a978-09d5caec43fe").unwrap(),
            user_id: "029da29a-d932-4ed4-a978-09d5caec43fe".to_string(),
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

    fn create_wallet_fixture() -> NewUserWalletData {
        NewUserWalletData {
            business_name: "Test Organization Ltd".to_string(),
            settlement_bank: "MPESA".to_string(),
            account_number: "0711111111".to_string(),
            wallet_email: "mytestemail@gmail.com".to_string(),
        }
    }

    // ================= TESTING TRANSACTION ===============
    #[actix_web::test]
    #[ignore]
    async fn create_org_wallet() {
        let test_state: web::Data<AppState> = web::Data::new(app_state_fixture().await);
        let org_id = web::Path::from("029da29a-d932-4ed4-a978-09d5caec43fe".to_string());
        let test_subaccnt = web::Json(create_wallet_fixture());
        let resp_create = new_wallet(test_subaccnt, org_id, test_state).await;
        println!("The result subaccount creation is {:#?}", resp_create);
        assert_eq!(resp_create.status(), StatusCode::OK);
    }

    #[actix_web::test]
    #[ignore]
    async fn get_org_wallet_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state_fixture().await);
        let org_id = web::Path::from("029da29a-d932-4ed4-a978-09d5caec43fe".to_string());
        let wallet_resp = get_wallet(org_id, test_state).await;
        println!("The wallet result is {:#?}", wallet_resp.body());
        assert_eq!(wallet_resp.status(), StatusCode::OK);

    }

    #[actix_web::test]
    #[ignore]
    async fn delete_org_wallet_test() {
        let test_state: web::Data<AppState> = web::Data::new(app_state_fixture().await);
        let wallet_id = web::Path::from("1dfad197-be1e-4707-b3c9-60d1e2ac90a3".to_string());
        let del_wallet = delete_wallet(wallet_id, test_state).await;
        println!("The wallet is {:#?}", del_wallet.body());
        assert_eq!(del_wallet.status(), StatusCode::OK);

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
        //let test_state: web::Data<AppState> = web::Data::new(app_state_fixture().await);
        //let param = web::Path::from("029da29a-d932-4ed4-a978-09d5caec43fe".to_string());
        //let filter_pyld = None; //web::Json();
        //let lst_access = list_access_codes(filter_pyld, param, test_state).await;
        //println!("The list of access codes are {:#?}", lst_access.body());
        //assert_eq!(lst_access.status(), StatusCode::OK);
        println!("This is list access test......");
    }

}
