//! Organization accesst to the database.
use crate::models::{
    Organization, OrgPayload, CreateOrg,
    Contact, ContactType, ContactPayload,
    CreateContact, OrganizationAccessCodes,
    CreateAccess, AccessCodesPayload,
    RoleType, Role, CreateRole, RolePayload,
    PermissionType, Permission,
    CreatePermission, PermissionPayload
};
use sqlx::postgres::PgPool;
use sqlx::Row;
use uuid::Uuid;

pub async fn add_new_org(db_pool: &PgPool, new_org: CreateOrg) -> Organization {
    let n_org = sqlx::query!(r#"
        INSERT INTO ticket_market.organizations
            (organization_name, organization_username, country, description)
        VALUES
            ($1, $2, $3, $4)
        RETURNING
            organization_id, organization_name, organization_username,
            country, description
    "#,
    new_org.organization_name, new_org.organization_username,
    new_org.country, new_org.description
    ).fetch_one(db_pool).await.unwrap();

    Organization {
        organization_id: n_org.organization_id,
        organization_name: n_org.organization_name,
        organization_username: n_org.organization_username.unwrap(),
        country: n_org.country,
        description: n_org.description.unwrap(),
    }
}

pub async fn get_orgs(db_pool: &PgPool, filters: OrgPayload) -> Vec<Organization> {
    let orgs_lst = sqlx::query(r#"
        SELECT * FROM ticket_market.organizations
        WHERE
            ($1 IS NULL OR organization_id=$1)
            AND ($2 IS NULL OR organization_name=$2)
            AND ($3 IS NULL OR organization_username=$3)
            AND ($4 IS NULL OR country=$4)
    "#).bind(Some(filters.organization_id)).bind(Some(filters.organization_name))
    .bind(Some(filters.organization_username)).bind(Some(filters.country))
    .fetch_all(db_pool).await.expect("Organizations can't be retrieved.");

    orgs_lst.iter().map(|org| Organization {
        organization_id: org.get("organization_id"),
        organization_name: org.get("organization_name"),
        organization_username: org.get("organization_username"),
        country: org.get("country"),
        description: org.get("description")
    }).collect()
}

pub async fn update_org(db_pool: &PgPool, org_id: Uuid, payload: OrgPayload) -> Organization {
    let update_org = sqlx::query(r#"
        UPDATE ticket_market.organizations
            SET organization_name = COALESCE($1, organization_name),
                organization_username = COALESCE($2, organization_username),
                country = COALESCE($3, country),
                description = COALESCE($4, description)
            WHERE organization_id = $5
        RETURNING organization_id, organization_name, organization_username,
            country, description
    "#).bind(Some(payload.organization_name)).bind(Some(payload.organization_username))
    .bind(Some(payload.country)).bind(Some(payload.description)).bind(org_id)
    .fetch_one(db_pool).await.expect("Failed updating organization");

    Organization {
        organization_id: update_org.get("organization_id"),
        organization_name: update_org.get("organization_name"),
        organization_username: update_org.get("organization_username"),
        country: update_org.get("country"),
        description: update_org.get("description")
    }
}

//pub async fn delete_org(db_pool: &PgPool, org_id: Uuid) -> Organization {
//}

// =================== ADDING ORGANIZATION CONTACTS ============
pub async fn add_new_contact(db_pool: &PgPool, org_id: Uuid, contact_data: CreateContact) -> Contact {
    let add_contact = sqlx::query!(r#"
        INSERT INTO ticket_market.org_contacts 
            (organization_id, contact_type, contact)
        VALUES
            ($1, $2, $3)
        RETURNING
            contact_id, organization_id, contact_type as "contact_type: ContactType", contact
    "#, org_id, contact_data.contact_type as ContactType,
    contact_data.contact).fetch_one(db_pool).await.unwrap();

    Contact {
        contact_id: add_contact.contact_id,
        organization_id: add_contact.organization_id,
        contact_type: add_contact.contact_type,
        contact: add_contact.contact
    }
}

pub async fn get_contacts(db_pool: &PgPool, org_id: Uuid) -> Vec<Contact> {
    let cont_res = sqlx::query(r#"
        SELECT * FROM ticket_market.org_contacts
        WHERE organization_id=$1
    "#).bind(org_id).fetch_all(db_pool).await.expect("Could not fetch contacts");

    cont_res.iter().map(|cont| Contact {
        contact_id: cont.get("contact_id"),
        organization_id: cont.get("organization_id"),
        contact_type: cont.get("contact_type"),
        contact: cont.get("contact")
    }).collect()
}

pub async fn update_contacts(db_pool: &PgPool, org_id: Uuid, contact_id: Uuid, payload: ContactPayload) -> Contact {
    let upd_cont = sqlx::query(r#"
        UPDATE ticket_market.org_contacts
        SET contact = COALESCE($1, contact)
        WHERE organization_id = $2 AND contact_id = $3
        RETURNING contact_id, organization_id,
            contact_type, contact
    "#).bind(Some(payload.contact)).bind(org_id).bind(contact_id)
    .fetch_one(db_pool).await.expect("Update to contacts failed");

    Contact {
        contact_id: upd_cont.get("contact_id"),
        organization_id: upd_cont.get("organization_id"),
        contact_type: upd_cont.get("contact_type"),
        contact: upd_cont.get("contact"),
    }
}

pub async fn delete_contacts(db_pool: &PgPool, org_id: Uuid, contact_id: Uuid) -> Contact {
    let del_cont = sqlx::query!(r#"
        DELETE FROM ticket_market.org_contacts
        WHERE organization_id = $1 AND contact_id = $2
        RETURNING contact_id, organization_id,
        contact_type as "contact_type: ContactType", contact
    "#, org_id, contact_id).fetch_one(db_pool).await.expect("Deletion failed");

    Contact {
        contact_id: del_cont.contact_id,
        organization_id: del_cont.organization_id,
        contact_type: del_cont.contact_type,
        contact: del_cont.contact,
    }
}

// ======================== ACCESS CODES ==============================
pub async fn add_access_code(db_pool: &PgPool, org_id: Uuid, access_code: String, create_access: CreateAccess) -> OrganizationAccessCodes {
    let add_access = sqlx::query!(r#"
        INSERT INTO ticket_market.org_access_codes
            (user_id, organization_id, access_username, access_code)
        VALUES
            ($1, $2, $3, $4)
        RETURNING
            access_code_id, organization_id,
            access_code, user_id, access_username
    "#, create_access.user_id, org_id,
    create_access.access_username,access_code
    ).fetch_one(db_pool).await.unwrap();

    OrganizationAccessCodes {
        access_code_id: add_access.access_code_id,
        organization_id: add_access.organization_id,
        access_code: add_access.access_code,
        user_id: add_access.user_id,
        access_username: add_access.access_username.unwrap(),
    }
}

pub async fn get_access_codes(db_pool: &PgPool, org_id: Uuid, access_payload: AccessCodesPayload) -> Vec<OrganizationAccessCodes> {
    let access_lst = sqlx::query(r#"
        SELECT * FROM ticket_market.org_access_codes
        WHERE organization_id = $1
            AND ($2 IS NULL OR access_username=$2)
    "#).bind(org_id).bind(Some(access_payload.access_username))
    .fetch_all(db_pool).await.expect("Access code list can't be retrieved");

    access_lst.iter().map(|access_code| OrganizationAccessCodes {
        access_code_id: access_code.get("access_code_id"),
        organization_id: access_code.get("organization_id"),
        access_code: access_code.get("access_code"),
        user_id: access_code.get("user_id"),
        access_username: access_code.get("access_username"),
    }).collect()
}

pub async fn org_access(db_pool: &PgPool, access: AccessCodesPayload) -> Organization {
    let orgs = sqlx::query(r#"
        SELECT 
            org.organization_id, org.organization_name,
            org.organization_username, org.country, org.description
        FROM ticket_market.organizations org
        INNER JOIN ticket_market.org_access_codes code
        ON org.organization_id = code.organization_id
        AND code.access_username = $1
        AND code.access_code = $2
    "#)
    .bind(access.access_username.unwrap())
    .bind(access.access_code.unwrap())
    .fetch_all(db_pool).await.unwrap();

    orgs.iter().map(|org| Organization {
        organization_id: org.get("organization_id"),
        organization_name: org.get("organization_name"),
        organization_username: org.get("organization_username"),
        country: org.get("country"),
        description: org.get("description"),
    }).collect::<Vec<Organization>>()[0].clone()
}

pub async fn delete_access_code(db_pool: &PgPool, access_id: Uuid) -> OrganizationAccessCodes {
    let del_access = sqlx::query!(r#"
        DELETE FROM ticket_market.org_access_codes
        WHERE access_code_id = $1
        RETURNING 
            access_code_id, organization_id, access_code,
            user_id, access_username
    "#, access_id).fetch_one(db_pool).await.unwrap();

    OrganizationAccessCodes {
        access_code_id: del_access.access_code_id,
        organization_id: del_access.organization_id,
        user_id: del_access.user_id,
        access_code: del_access.access_code,
        access_username: del_access.access_username.unwrap(),
    }
}

// =================== ROLES HANDLING ====================
pub async fn add_access_roles(db_pool: &PgPool, org_id: Uuid, new_role: CreateRole) -> Role {
    let add_role = sqlx::query!(r#"
        INSERT INTO ticket_market.user_access_roles
            (user_id, access_code_id, access_role)
        VALUES
            ($1, $2, $3)
        RETURNING
            role_id, organization_id, user_id,
            access_code_id, access_role as "access_role_type: RoleType"
    "#, new_role.user_id, new_role.access_code_id,
    new_role.role as RoleType
    ).fetch_one(db_pool).await.unwrap();

    Role {
        role_id: add_role.role_id,
        user_id: add_role.user_id.unwrap(),
        access_code_id: add_role.access_code_id.unwrap(),
        role: add_role.access_role_type.unwrap(),
    }
}

pub async fn get_access_roles(db_pool: &PgPool, org_id: Uuid, access_filters: RolePayload) -> Vec<Role> {
    let lst_roles = sqlx::query(r#"
        SELECT * FROM ticket_market.user_access_roles
        WHERE organization_id=$1
            AND ($2 IS NULL OR user_id=$2)
            AND ($3 IS NULL OR access_role=$3)
    "#).bind(org_id).bind(Some(access_filters.user_id))
    .bind(Some(access_filters.role))
    .fetch_all(db_pool).await.expect("Couldn't retrieve roles");

    lst_roles.iter().map(|role| Role {
        role_id: role.get("role_id"),
        user_id: role.get("user_id"),
        access_code_id: role.get("access_code_id"),
        role: role.get("access_role"),
    }).collect()
}

pub async fn delete_access_role(db_pool: &PgPool, org_id: Uuid, role_id: Uuid) -> Role {
    let del_role = sqlx::query!(r#"
        DELETE FROM ticket_market.user_access_roles
        WHERE organization_id = $1 AND role_id = $2
        RETURNING role_id, organization_id, user_id,
        access_code_id, access_role as "access_role_type: RoleType"
    "#, org_id, role_id).fetch_one(db_pool).await.unwrap();

    Role {
        role_id: del_role.role_id,
        user_id: del_role.user_id.unwrap(),
        access_code_id: del_role.access_code_id.unwrap(),
        role: del_role.access_role_type.unwrap(),
    }
}

// =================== PERMISSIONS HANDLING ==============
pub async fn add_permission(db_pool: &PgPool, role_id: Uuid, new_perm: CreatePermission) -> Permission {
    let add_perm = sqlx::query!(r#"
        INSERT INTO ticket_market.permissions
            (user_access_role_id, permission)
        VALUES
            ($1, $2)
        RETURNING permission_id, user_access_role_id, permission as "permission_type: PermissionType"
    "#, role_id, new_perm.permission as PermissionType).fetch_one(db_pool).await.unwrap();

    Permission {
        permission_id: add_perm.permission_id,
        role_id: add_perm.user_access_role_id.unwrap(),
        permission: add_perm.permission_type.unwrap(),
    }
}

pub async fn list_permissions(db_pool: &PgPool, role_id: Uuid) -> Vec<Permission> {
    let lst_perms = sqlx::query!(r#"
        SELECT permission_id, user_access_role_id, permission as "permission_type: PermissionType"
        FROM ticket_market.permissions
        WHERE user_access_role_id=$1
    "#, role_id).fetch_all(db_pool).await.unwrap();

    lst_perms.iter().map(|perm| Permission {
        permission_id: perm.permission_id,
        role_id: perm.user_access_role_id.unwrap(),
        permission: perm.permission_type.unwrap(),
    }).collect()
}

pub async fn remove_permission(db_pool: &PgPool, permission_id: Uuid) -> Permission {
    let del_perms = sqlx::query!(r#"
        DELETE FROM ticket_market.permissions
        WHERE permission_id=$1
        RETURNING permission_id, user_access_role_id, permission as "permission_type: PermissionType"
    "#, permission_id).fetch_one(db_pool).await.unwrap();

    Permission {
        permission_id: del_perms.permission_id,
        role_id: del_perms.user_access_role_id.unwrap(),
        permission: del_perms.permission_type.unwrap(),
    }
}
