// Helps decide on how we'll change invocation of the modals.
"use client";
import { initialState } from "@/redux/initialStates/generalInitialStates";
import { createSlice } from "@reduxjs/toolkit";
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
        deleteModalState: (state, action) => {
            state.del_event = action.payload;
        }
    }
});
const generalReducer = (state = modalInitialState, action) => {
    switch (action) {
        case true:
            return Object.assign(Object.assign({}, state), { error: null });
        case false:
            return Object.assign(Object.assign({}, state), { error: null });
        default:
            return state;
    }
};
export const { updatePaymentModalState, createEventModalState, createTicketModalState, updateEvDetails, deleteModalState } = modalSlice.actions;
export default modalSlice.reducer;
