//! General initial states for modals accross the application.
const evDetails = {
    event_id: null,
    event_title: null,
    start_time: null,
    finish_time: null,
    del_event: null,
};
// Defining the initial state.
export const initialState = {
    payment: false,
    create_ticket: false,
    create_event: false,
    del_event: false,
    event_details: evDetails,
};
