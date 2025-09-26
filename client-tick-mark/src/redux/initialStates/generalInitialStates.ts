//! General initial states for modals accross the application.

// Defining the modals interface.
export interface ModalState {
    payment: bool | null;
    createTicket: bool | null;
}

// Defining the initial state.
export const initialState: ModalState = {
    payment: false,
    create_ticket: false,
    create_event: false,
}
