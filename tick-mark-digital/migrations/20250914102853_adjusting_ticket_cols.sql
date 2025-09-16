-- Add migration script here
ALTER TABLE ticket_market.tickets
DROP COLUMN ticket_type;

DROP TYPE ticket_market.tick_type;

CREATE TYPE ticket_market.tick_class AS ENUM ('individual', 'group');
CREATE TYPE ticket_market.tick_type AS ENUM ('discount', 'regular', 'vip');

ALTER TABLE ticket_market.tickets
ADD COLUMN ticket_type ticket_market.tick_type;

ALTER TABLE ticket_market.tickets
ADD COLUMN ticket_class ticket_market.tick_class;

ALTER TABLE ticket_market.tickets
ADD COLUMN discount_time INTERVAL;

ALTER DATABASE test_tickmark SET search_path TO ticket_market, public;
