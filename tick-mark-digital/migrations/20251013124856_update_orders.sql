-- Add migration script here
ALTER TABLE ticket_market.orders
ADD COLUMN commission_amount NUMERIC(12, 2);

ALTER TABLE ticket_market.orders
ADD COLUMN order_currency TEXT;

ALTER TABLE ticket_market.orders
ADD UNIQUE (paystack_reference);

ALTER DATABASE test_tickmark_2 SET search_path TO ticket_market, public;
