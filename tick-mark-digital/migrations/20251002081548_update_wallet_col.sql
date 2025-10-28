-- Add migration script here
DROP TABLE ticket_market.wallets;

CREATE TABLE ticket_market.wallets (
    wallet_id uuid DEFAULT ticket_market.uuid_generate_v4() PRIMARY KEY,
    owner_id uuid NOT NULL,
    business_name TEXT,
    bank_code TEXT,
    account_number TEXT,
    percentage_charge NUMERIC(5,2),
    settlement_bank TEXT,
    currency TEXT,
    subaccount_code TEXT,
    wallet_email TEXT
);

