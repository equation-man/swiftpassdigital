-- Add migration script here
-- Defining a custom type
CREATE TYPE ticket_market.search_results AS (
    event_id uuid,
    owner_id uuid,
    title TEXT,
    description TEXT,
    venue TEXT,
    start_time TIMESTAMPTZ,
    finish_time TIMESTAMPTZ,
    added_at TIMESTAMPTZ,
    edited BOOLEAN,
    event_tag TEXT
);

-- EVENTS FTS FUNCTION.
CREATE OR REPLACE FUNCTION ticket_market.search_events(
    search_query TEXT,
    title TEXT DEFAULT NULL,
    venue TEXT DEFAULT NULL,
    event_tag TEXT DEFAULT NULL,
    min_date TIMESTAMPTZ DEFAULT NULL,
    max_date TIMESTAMPTZ DEFAULT NULL,
    page_size INTEGER DEFAULT 20,
    page_number INTEGER DEFAULT 1
) RETURNS TABLE (
    results ticket_market.search_results,
    total_count BIGINT
) AS $$
DECLARE
    tsquery_var tsquery;
    total BIGINT;
BEGIN
    -- Convert search_query to tsquery, handle multiple words.
    SELECT array_to_string(array_agg(lexeme || ':*'), '&')
    FROM unnest(regexp_split_to_array(trim(search_query), '\s+')) lexeme
    INTO search_query;
    tsquery_var := to_tsquery('english', search_query);

    -- Get total count for pagination
    SELECT COUNT(DISTINCT e.event_id)
        FROM ticket_market.events e
    WHERE e.search_vector @@ tsquery_var
        AND finish_time > NOW()
        AND (title IS NULL OR e.title ILIKE '%' || title || '%')
        AND (venue IS NULL OR e.venue ILIKE '%' || venue || '%')
        AND (event_tag IS NULL OR e.event_tag = event_tag)
        AND (min_date IS NULL OR e.start_time >= min_date)
        AND (max_date IS NULL OR e.start_time <= max_date)
    INTO total;

    RETURN QUERY
    WITH ranked_events AS (
        SELECT DISTINCT ON (e.event_id)
            e.event_id, e.owner_id, e.title, e.description, e.venue, e.start_time,
            e.finish_time, e.added_at, e.edited, e.event_tag,
            ts_rank(e.search_vector, tsquery_var) *
                CASE 
                    WHEN e.added_at >= NOW() - INTERVAL '7 days' THEN 1.5
                    WHEN e.added_at >= NOW() - INTERVAL '14 days' THEN 1.2
                    ELSE 1.0
                END *
                CASE
                    WHEN e.start_time <= NOW() + INTERVAL '1 day' THEN 2.0
                    WHEN e.start_time <= NOW() + INTERVAL '3 days' THEN 1.7
                    WHEN e.start_time <= NOW() + INTERVAL '7 days' THEN 1.4
                    WHEN e.start_time <= NOW() + INTERVAL '14 days' THEN 1.2
                    ELSE 1.0
                END AS rank
        FROM ticket_market.events e
        WHERE e.search_vector @@ tsquery_var
            AND finish_time > NOW()
            AND (title IS NULL OR e.title ILIKE '%' || title || '%')
            AND (venue IS NULL OR e.venue ILIKE '%' || venue || '%')
            AND (event_tag IS NULL OR e.event_tag = event_tag)
            AND (min_date IS NULL OR e.start_time >= min_date)
            AND (max_date IS NULL OR e.start_time <= max_date)
    ) SELECT ROW(
        re.event_id, re.owner_id, re.title, re.description,
        re.venue, re.start_time, re.finish_time, re.added_at, re.edited,
        re.event_tag
    )::ticket_market.search_results, total as total_count
    FROM ranked_events re ORDER BY re.rank DESC
    LIMIT page_size OFFSET (page_number - 1)*page_size;
END;
$$ LANGUAGE plpgsql;

