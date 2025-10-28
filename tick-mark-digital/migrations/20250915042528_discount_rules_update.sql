-- Add migration script here
DROP TABLE ticket_market.order_discounts;
CREATE TABLE ticket_market.discount_rules (
    discount_id uuid DEFAULT ticket_market.uuid_generate_v4() PRIMARY KEY,
    ticket_id uuid NOT NULL,
    name TEXT NOT NULL,
    discount_type ticket_market.disc_type NOT NULL,
    value NUMERIC(12, 2) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    max_users BIGINT,
    active BOOLEAN DEFAULT true,
    FOREIGN KEY (ticket_id) REFERENCES ticket_market.tickets(ticket_id)
);
