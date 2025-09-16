-- Add migration script here
CREATE SCHEMA IF NOT EXISTS ticket_market;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA ticket_market;

CREATE TABLE ticket_market.users (
    user_id uuid DEFAULT ticket_market.uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(20),
    last_name VARCHAR(20),
    user_name VARCHAR(32) NOT NULL,
    email TEXT NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    password TEXT NOT NULL,
    email_verification BOOLEAN NOT NULL DEFAULT false
);
