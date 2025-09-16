//! Organizations models.
use serde::{Deserialize, Serialize};
use sqlx::Type;
use uuid::Uuid;
use actix_web::web;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Organization {
    pub organization_id: Uuid,
    pub organization_name: String,
    pub organization_username: String,
    pub country: String,
    pub description: String,
}

impl From<web::Json<Organization>> for Organization {
    fn from(org: web::Json<Organization>) -> Self {
        Organization {
            organization_id: org.organization_id.clone(),
            organization_name: org.organization_name.clone(),
            organization_username: org.organization_username.clone(),
            country: org.country.clone(),
            description: org.description.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CreateOrg {
    pub organization_name: String,
    pub organization_username: String,
    pub country: String,
    pub description: String,
}

impl From<web::Json<CreateOrg>> for CreateOrg {
    fn from(create_org: web::Json<CreateOrg>) -> Self {
        CreateOrg {
            organization_name: create_org.organization_name.clone(),
            organization_username: create_org.organization_username.clone(),
            country: create_org.country.clone(),
            description: create_org.description.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct OrgPayload {
    pub organization_id: Option<Uuid>,
    pub organization_name: Option<String>,
    pub organization_username: Option<String>,
    pub country: Option<String>,
    pub description: Option<String>,
}

impl From<web::Json<OrgPayload>> for OrgPayload {
    fn from(payload: web::Json<OrgPayload>) -> Self {
        OrgPayload {
            organization_id: payload.organization_id.clone(),
            organization_name: payload.organization_name.clone(),
            organization_username: payload.organization_username.clone(),
            country: payload.country.clone(),
            description: payload.description.clone(),
        }
    }
}

#[derive(Clone, Debug, Copy, Deserialize, Serialize, sqlx::Type)]
#[sqlx(type_name="contact_type", rename_all="lowercase")]
pub enum ContactType {
    Email,
    Telephone,
}

impl From<web::Json<&str>> for ContactType {
    fn from(cont_type: web::Json<&str>) -> Self {
        match cont_type {
            web::Json("Email") => ContactType::Email,
            web::Json("Telephone") => ContactType::Telephone,
            web::Json(&_) => unimplemented!("No other type trait to be implemente")
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Contact {
    pub contact_id: Uuid,
    pub organization_id: Uuid,
    pub contact_type: ContactType,
    pub contact: String,
}

impl From<web::Json<Contact>> for Contact {
    fn from(cont: web::Json<Contact>) -> Self {
        Contact {
            contact_id: cont.contact_id.clone(),
            organization_id: cont.organization_id.clone(),
            contact_type: cont.contact_type.clone(),
            contact: cont.contact.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CreateContact {
    pub organization_id: Uuid,
    pub contact_type: ContactType,
    pub contact: String,
}

impl From<web::Json<CreateContact>> for CreateContact {
    fn from(create_cont: web::Json<CreateContact>) -> Self {
        CreateContact {
            organization_id: create_cont.organization_id.clone(),
            contact_type: create_cont.contact_type.clone(),
            contact: create_cont.contact.clone(),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ContactPayload {
    pub contact_id: Option<Uuid>,
    pub organization_id: Option<Uuid>,
    pub contact_type: Option<ContactType>,
    pub contact: Option<String>
}

impl From<web::Json<ContactPayload>> for ContactPayload {
    fn from(cont_payload: web::Json<ContactPayload>) -> Self {
        ContactPayload {
            contact_id: cont_payload.contact_id.clone(),
            organization_id: cont_payload.organization_id.clone(),
            contact_type: cont_payload.contact_type.clone(),
            contact: cont_payload.contact.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct OrganizationAccessCodes {
    pub access_code_id: Uuid,
    pub organization_id: Uuid,
    pub user_id: Uuid,
    pub access_username: String,
    pub access_code: String,
}

impl From<web::Json<OrganizationAccessCodes>> for OrganizationAccessCodes {
    fn from(access_payload: web::Json<OrganizationAccessCodes>) -> Self {
        OrganizationAccessCodes {
            access_code_id: access_payload.access_code_id.clone(),
            organization_id: access_payload.organization_id.clone(),
            user_id: access_payload.user_id.clone(),
            access_username: access_payload.access_username.clone(),
            access_code: access_payload.access_code.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CreateAccess {
    pub user_id: Uuid,
    pub access_username: String,
}

impl From<web::Json<CreateAccess>> for CreateAccess {
    fn from(create_access: web::Json<CreateAccess>) -> Self {
        CreateAccess {
            user_id: create_access.user_id.clone(),
            access_username: create_access.access_username.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct AccessCodesPayload {
    pub access_code_id: Option<Uuid>,
    pub organization_id: Option<Uuid>,
    pub user_id: Option<Uuid>,
    pub access_username: Option<String>,
    pub access_code: Option<String>,
}

impl From<web::Json<AccessCodesPayload>> for AccessCodesPayload {
    fn from(access_code: web::Json<AccessCodesPayload>) -> Self {
        AccessCodesPayload {
            access_code_id: access_code.access_code_id.clone(),
            organization_id: access_code.organization_id.clone(),
            user_id: access_code.user_id.clone(),
            access_username: access_code.access_username.clone(),
            access_code: access_code.access_code.clone(),
        }
    }
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, sqlx::Type)]
#[sqlx(type_name="access_role_type", rename_all="lowercase")]
pub enum RoleType {
    Admin,
    Manager,
}

impl From<web::Json<&str>> for RoleType {
    fn from(role_type: web::Json<&str>) -> Self {
        match role_type {
            web::Json("Admin") => RoleType::Admin,
            web::Json("Manager") => RoleType::Manager,
            web::Json(&_) => unimplemented!("No implentation for this role")
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Role {
    pub role_id: Uuid,
    pub user_id: Uuid,
    pub access_code_id: Uuid,
    pub role: RoleType,
    //pub permissions: Vec<Permission>,
}

impl From<web::Json<Role>> for Role {
    fn from(role: web::Json<Role>) -> Self {
        Role {
            role_id: role.role_id.clone(),
            user_id: role.user_id.clone(),
            access_code_id: role.access_code_id.clone(),
            role: role.role.clone(),
            //permissions: role.permissions.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CreateRole {
    pub user_id: Uuid,
    pub access_code_id: Uuid,
    pub role: RoleType
}

impl From<web::Json<CreateRole>> for CreateRole {
    fn from(create_role: web::Json<CreateRole>) -> Self {
        CreateRole {
            user_id: create_role.user_id.clone(),
            access_code_id: create_role.access_code_id.clone(),
            role: create_role.role.clone()
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct RolePayload {
    pub user_id: Option<Uuid>,
    pub access_code_id: Option<Uuid>,
    pub role: Option<RoleType>,
}

impl From<web::Json<RolePayload>> for RolePayload {
    fn from(role_payload: web::Json<RolePayload>) -> Self {
        RolePayload {
            user_id: role_payload.user_id.clone(),
            access_code_id: role_payload.access_code_id.clone(),
            role: role_payload.role.clone(),
        }
    }
}

#[derive(Clone, Debug, Copy, Deserialize, Serialize, sqlx::Type)]
#[sqlx(type_name="permission_type", rename_all="lowercase")]
pub enum PermissionType {
    Basic,
    Moderate,
    SuperUser
}

impl From<web::Json<&str>> for PermissionType {
    fn from(permission_type: web::Json<&str>) -> Self {
        match permission_type {
            web::Json("Basic") => PermissionType::Basic,
            web::Json("Moderate") => PermissionType::Moderate,
            web::Json("SuperUser") => PermissionType::SuperUser,
            web::Json(&_) => unimplemented!("No implementation for this permission"),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Permission {
    pub permission_id: Uuid,
    pub role_id: Uuid,
    pub permission: PermissionType,
}

impl From<web::Json<Permission>> for Permission {
    fn from(permission: web::Json<Permission>) -> Self {
        Permission {
            permission_id: permission.permission_id.clone(),
            role_id: permission.role_id.clone(),
            permission: permission.permission.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CreatePermission {
    pub role_id: Uuid,
    pub permission: PermissionType,
}

impl From<web::Json<CreatePermission>> for CreatePermission {
    fn from(permission: web::Json<CreatePermission>) -> Self {
        CreatePermission {
            role_id: permission.role_id.clone(),
            permission: permission.permission.clone(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct PermissionPayload {
    pub permission_id: Uuid,
    pub role_id: Uuid,
    pub permission: PermissionType,
}

impl From<web::Json<PermissionPayload>> for PermissionPayload {
    fn from(permission: web::Json<PermissionPayload>) -> Self {
        PermissionPayload {
            permission_id: permission.permission_id.clone(),
            role_id: permission.role_id.clone(),
            permission: permission.permission.clone()
        }
    }
}
