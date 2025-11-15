// Fetching a single ticket.
"use server";

import axios from "axios";
import { API_URL } from "@/config";

export async function eventInfoFn(e_id) {
    const response = await axios.get(`${API_URL}/events/${e_id}`);
    return response.data;
}

export async function createTicketFn(ticketDet) {
    const response = await axios.post(`${API_URL}/events/ticket/create`, ticketDet);
    return response.data;
}

export async function ticketInfoFn(e_id) {
    const response = await axios.get(`${API_URL}/events/ticket/list/${e_id}`);
    return response.data;
}

export async function singleTicketInfoFn(ticket_id) {
    const response = await axios.get(`${API_URL}/events/ticket/${ticket_id}`);
    return response.data;
}

export async function purchaseTicketFn({ orderDet, ticketId }) {
    const response = await axios.post(
        `${API_URL}/events/ticket/order/purchase/${ticketId}`,
        orderDet,
        { timeout: 60000 }
    );
    return response.data;
}

export async function mpesaTicketPurchaseFn({ orderDet, ticketId }) {
    const response = await axios.post(
        `${API_URL}/events/ticket/order/purchase/${ticketId}`,
        orderDet,
        { timeout: 60000 }
    );
    return response.data;
}

export async function createEventFn(evntDetails) {
    const response = await axios.post(`${API_URL}/events/create`, evntDetails);
    return response.data;
}

