//! Database functions for user object related login.
use crate::models::{CreateUser, User, UserPayload, LoggedUser};
use sqlx::postgres::PgPool;
use sqlx::Row;
use uuid::Uuid;

pub async fn add_new_user(db_pool: &PgPool, new_user: CreateUser) -> User {
    let new_user = sqlx::query!(r#"
        INSERT INTO ticket_market.users
            (first_name, last_name,user_name,
            email, telephone, password)
        VALUES
            ($1, $2, $3, $4, $5, $6)
        RETURNING
            user_id, first_name, last_name, user_name,
            email, telephone, email_verification
    "#, new_user.first_name, new_user.last_name,
    new_user.user_name, new_user.email,
    new_user.telephone, new_user.password
    ).fetch_one(db_pool).await.unwrap();

    User {
        user_id: new_user.user_id,
        first_name: new_user.first_name.unwrap(),
        last_name: new_user.last_name.unwrap(),
        user_name: new_user.user_name,
        email: new_user.email,
        telephone: new_user.telephone,
        email_verification: new_user.email_verification,
    }
}

pub async fn get_users(db_pool: &PgPool, filters: UserPayload) -> Vec<LoggedUser> {
    let res = sqlx::query(r#"
        SELECT * FROM ticket_market.users
        WHERE
            ($1 IS NULL OR user_id=$1)
            AND ($2 IS NULL OR user_name=$2)
            AND ($3 IS NULL OR email=$3)
            AND ($4 IS NULL OR telephone=$4)
    "#).bind(Some(filters.user_id)).bind(Some(filters.user_name))
    .bind(Some(filters.email))
    .bind(Some(filters.telephone)).fetch_all(db_pool).await
    .expect("Failed getting users");

    res.iter().map(|usr| LoggedUser {
        user_id: usr.get("user_id"),
        first_name: usr.get("first_name"),
        last_name: usr.get("last_name"),
        user_name: usr.get("user_name"),
        email: usr.get("email"),
        telephone: usr.get("telephone"),
        password: usr.get("password"),
        email_verification: usr.get("email_verification"),
    }).collect()
}

pub async fn update_user(db_pool: &PgPool, user_id: Uuid, payload: UserPayload) -> User {
    let update_res = sqlx::query(r#"
        UPDATE ticket_market.users
            SET first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                user_name = COALESCE($3, user_name),
                email = COALESCE($4, email),
                telephone = COALESCE($5, telephone),
                password = COALESCE($6, password),
                email_verification = COALESCE($7, email_verification)
            WHERE user_id = $8
        RETURNING user_id, first_name, last_name,
            user_name, email, telephone, email_verification
    "#).bind(Some(payload.first_name)).bind(Some(payload.last_name))
    .bind(Some(payload.user_name)).bind(Some(payload.email))
    .bind(Some(payload.telephone)).bind(Some(payload.password))
    .bind(Some(payload.email_verification)).bind(user_id)
    .fetch_one(db_pool).await.expect("Failed updating user");

    User {
        user_id: update_res.get("user_id"),
        first_name: update_res.get("first_name"),
        last_name: update_res.get("last_name"),
        user_name: update_res.get("user_name"),
        email: update_res.get("email"),
        telephone: update_res.get("telephone"),
        email_verification: update_res.get("email_verification"),
    }
}

pub async fn delete_user(db_pool: &PgPool, user_id: Uuid) -> User {
    let delete_user = sqlx::query!(r#"
        DELETE FROM ticket_market.users
        WHERE user_id = $1
        RETURNING user_id, first_name, last_name,
            user_name, email, telephone, email_verification
    "#, user_id).fetch_one(db_pool).await.unwrap();

    User {
        user_id: delete_user.user_id,
        first_name: delete_user.first_name.unwrap(),
        last_name: delete_user.last_name.unwrap(),
        user_name: delete_user.user_name,
        email: delete_user.email,
        telephone: delete_user.telephone,
        email_verification: delete_user.email_verification,
    }
}
