// Helps decide on how we'll change invocation of the modals.
"use client";
import { initialState } from "@/redux/initialStates/generalInitialStates";
import { createSlice } from "@reduxjs/toolkit";

// Create the modal slice
export const modalSlice = createSlice({
    name: "generalModal",
    initialState,
    reducers: {
        updatePaymentModalState: (state, action) => {
            state.payment = action.payload;
        },
        createEventModalState: (state, action) => {
            state.create_event = action.payload;
        },
        createTicketModalState: (state, action) => {
            state.create_ticket = action.payload;
        },
        updateEvDetails: (state, action) => {
            state.event_details = action.payload;
        },
        updateEventModalState: (state, action) => {
          state.upd_event = action.payload;
        },
        updateEventFormState: (state, action) => {
          state.upd_form = action.payload;
        },
        deleteModalState: (state, action) => {
            state.del_event = action.payload;
        },
        createEvDetails: (state, action) => {
          state.create_event_details = action.payload;
        },
        addTicketDetails: (state, action) => {
          state.add_ticket_details = action.payload;
        },
        addDiscountDetails: (state, action) => {
          state.add_discount_details = action.payload;
        },
        addTicketItems: (state, action) => {
          //state.ticket_items.push(action.payload.payload);
          state.ticket_items = action.payload.payload
        },
        clearTicketItems: (state) => {
          state.ticket_items = null;
        },
    }
});

// Optional: a simple fallback reducer (if needed)
const generalReducer = (state = initialState, action) => {
    switch (action) {
        case true:
        case false:
            return { ...state, error: null };
        default:
            return state;
    }
};

// Export actions and reducer
export const { 
    updatePaymentModalState, 
    createEventModalState, 
    createTicketModalState, 
    updateEvDetails, 
    deleteModalState,
    updateEventModalState,
    createEvDetails,
    addTicketDetails,
    addDiscountDetails,
    addTicketItems,
    clearTicketItems,
    updateEventFormState,
} = modalSlice.actions;

export default modalSlice.reducer;

