-- Add migration script here
ALTER TABLE ticket_market.events ADD COLUMN is_published BOOLEAN DEFAULT FALSE;
UPDATE ticket_market.events SET is_published = TRUE;
ALTER TABLE ticket_market.events ALTER COLUMN is_published SET NOT NULL;
