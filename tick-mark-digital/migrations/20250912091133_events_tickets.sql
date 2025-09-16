-- Add migration script here
CREATE TABLE ticket_market.events (
    event_id uuid DEFAULT ticket_market.uuid_generate_v4() PRIMARY KEY,
    owner_id uuid NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    venue TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    finish_time TIMESTAMPTZ NOT NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    edited BOOLEAN,
    event_tag TEXT,
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(venue, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(event_tag, '')), 'D')
    ) STORED
);
CREATE INDEX IF NOT EXISTS ticket_search_idx ON ticket_market.events USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS tag_idx ON ticket_market.events (event_tag);

CREATE TYPE ticket_market.tick_type AS ENUM ('individual', 'group');
CREATE TABLE ticket_market.tickets (
    ticket_id uuid DEFAULT ticket_market.uuid_generate_v4() PRIMARY KEY,
    event_id uuid NOT NULL,
    base_price NUMERIC(12, 2),
    capacity BIGINT,
    start_time TIMESTAMPTZ NOT NULL,
    finish_time TIMESTAMPTZ NOT NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ticket_type ticket_market.tick_type,
    descriptoin TEXT,
    promo_code TEXT,
    FOREIGN KEY (event_id) REFERENCES ticket_market.events(event_id)
);

CREATE TYPE ticket_market.tick_status AS ENUM ('pending', 'checked', 'expired');
CREATE TABLE ticket_market.orders (
    order_id uuid DEFAULT ticket_market.uuid_generate_v4() PRIMARY KEY,
    ticket_id uuid,
    user_id uuid,
    user_email TEXT,
    user_contact TEXT,
    ticket_price NUMERIC(12, 2),
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    promo_code TEXT,
    ticket_status ticket_market.tick_status,
    entrance_code TEXT,
    order_limit BIGINT,
    discount_time INTERVAL,
    FOREIGN KEY (ticket_id) REFERENCES ticket_market.tickets(ticket_id)
);

CREATE TYPE ticket_market.disc_type AS ENUM ('percentage', 'fixed');
CREATE TABLE ticket_market.order_discounts (
    discount_id uuid DEFAULT ticket_market.uuid_generate_v4() PRIMARY KEY,
    order_id uuid,
    name TEXT,
    discount_type ticket_market.disc_type,
    value NUMERIC(12, 2),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    max_users BIGINT,
    active BOOLEAN,
    FOREIGN KEY (order_id) REFERENCES ticket_market.orders(order_id)
);

ALTER DATABASE test_tickmark SET search_path TO ticket_market, public;
