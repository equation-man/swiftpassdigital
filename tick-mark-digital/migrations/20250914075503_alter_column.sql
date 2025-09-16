-- Add migration script here
ALTER TABLE ticket_market.tickets
RENAME COLUMN descriptoin TO description;

ALTER TABLE ticket_market.tickets
DROP COLUMN promo_code;

ALTER DATABASE test_tickmark SET search_path TO ticket_market, public;
