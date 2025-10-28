-- Add migration script here
ALTER TABLE ticket_market.orders
ADD COLUMN commission_amount NUMERIC(12, 2);

ALTER TABLE ticket_market.orders
ADD COLUMN order_currency TEXT;

ALTER TABLE ticket_market.orders
ADD UNIQUE (paystack_reference);
