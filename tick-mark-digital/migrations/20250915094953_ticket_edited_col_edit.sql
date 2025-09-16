-- Add migration script here
ALTER TABLE ticket_market.events
ALTER COLUMN edited SET DEFAULT false;

ALTER DATABASE test_tickmark SET search_path TO ticket_market, public;
