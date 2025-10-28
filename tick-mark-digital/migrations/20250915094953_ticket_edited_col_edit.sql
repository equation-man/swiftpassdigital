-- Add migration script here
ALTER TABLE ticket_market.events
ALTER COLUMN edited SET DEFAULT false;

