-- Add migration script here
CREATE TYPE ticket_market.contact_type AS ENUM ('email', 'telephone');
CREATE TABLE ticket_market.organizations (
    organization_id uuid DEFAULT ticket_market.uuid_generate_v4() PRIMARY KEY,
    organization_name TEXT NOT NULL,
    organization_username VARCHAR(64),
    country VARCHAR(120) NOT NULL,
    description TEXT
);

CREATE TABLE ticket_market.org_contacts (
    contact_id uuid DEFAULT ticket_market.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL,
    contact_type ticket_market.contact_type NOT NULL,
    contact VARCHAR(80) NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES ticket_market.organizations(organization_id)
);

CREATE TABLE ticket_market.org_access_codes (
    org_access_id uuid DEFAULT ticket_market.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid NOT NULL,
    access_code VARCHAR(16) NOT NULL,
    user_id uuid NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES ticket_market.organizations(organization_id)
);

CREATE TYPE ticket_market.access_role_type AS ENUM ('admin', 'manager');
CREATE TABLE ticket_market.user_access_roles (
    role_id uuid DEFAULT ticket_market.uuid_generate_v4() PRIMARY KEY,
    organization_id uuid,
    user_id uuid,
    access_code_id uuid,
    access_role ticket_market.access_role_type,
    FOREIGN KEY (organization_id) REFERENCES ticket_market.organizations(organization_id)
);

CREATE TYPE ticket_market.permission_type AS ENUM ('read', 'write', 'update', 'remove');
CREATE TABLE ticket_market.permissions (
    permission_id uuid DEFAULT ticket_market.uuid_generate_v4() PRIMARY KEY,
    user_access_role_id uuid,
    permission ticket_market.permission_type,
    FOREIGN KEY (user_access_role_id) REFERENCES ticket_market.user_access_roles(role_id)
);
