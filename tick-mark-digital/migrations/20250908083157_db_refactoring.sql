-- Add migration script here
ALTER TABLE ticket_market.org_access_codes 
RENAME COLUMN org_access_id TO access_code_id;

ALTER TABLE ticket_market.org_access_codes
ADD COLUMN access_username TEXT;

ALTER DATABASE test_tickmark SET search_path TO ticket_market, public;
