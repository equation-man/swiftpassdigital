-- Add migration script here
ALTER TABLE ticket_market.organizations
ADD COLUMN org_email TEXT UNIQUE NOT NULL;

ALTER TABLE ticket_market.organizations
ADD COLUMN org_pwd TEXT NOT NULL;

ALTER TABLE ticket_market.organizations
ADD UNIQUE (organization_name);

ALTER TABLE ticket_market.users
ADD UNIQUE (user_name, email, telephone);

ALTER DATABASE test_tickmark SET search_path TO ticket_market, public;
