-- Add migration script here
ALTER TABLE ticket_market.tickets
RENAME COLUMN descriptoin TO description;

ALTER TABLE ticket_market.tickets
DROP COLUMN promo_code;

