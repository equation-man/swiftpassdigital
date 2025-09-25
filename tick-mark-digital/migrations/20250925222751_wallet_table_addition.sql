-- Add migration script here
CREATE TABLE ticket_market.wallets (
    wallet_id uuid DEFAULT ticket_market.uuid_generate_v4() PRIMARY KEY,
    owner_id uuid NOT NULL,
    business_name TEXT NOT NULL,
    bank_code TEXT NOT NULL,
    account_number TEXT NOT NULL,
    subaccount TEXT NOT NULL,
    currency TEXT
);

ALTER TABLE ticket_market.orders
ADD COLUMN paystack_reference TEXT;

ALTER TABLE ticket_market.events
ADD COLUMN subaccount TEXT;

ALTER DATABASE test_tickmark SET search_path TO ticket_market, public;
