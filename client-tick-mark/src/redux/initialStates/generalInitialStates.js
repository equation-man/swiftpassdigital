//! General initial states for modals accross the application.
// Initial event details object
const evDetails = {
    event_id: null,
    event_title: null,
    start_time: null,
    finish_time: null,
    del_event: null,
};

// Event addition details.
const createEvent = {
  owner_id: null, title: null, description: null,
  venue: null, start_date: null, finish_date: null,
  event_tag: null
};
// Ticket addition details.
const addTicket = {
  event_id: null, base_price: null, capacity: null, 
  ticket_type: null, ticket_class: null, discount_time: null, 
  start_time: null, finish_time: null, description: null
};
// Discound rules details.
const addDiscountRules = {
  ticket_id: null, name: null, discount_type: null, 
  value: null, start_date: null, end_date: null, 
  max_users: null,
};


// Initial modal state
export const initialState = {
    payment: false,
    create_ticket: false,
    create_event: false,
    del_event: false,
    upd_event: false,
    event_details: evDetails,
    create_event_details: null,
    add_ticket_details: null,
    add_discount_details: null,
    ticket_items: [],
};

