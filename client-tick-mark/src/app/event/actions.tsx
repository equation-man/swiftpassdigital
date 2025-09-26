// Fetching a single ticket.
"use server";
import axios from "axios";
import { API_URL } from "@/config";
import { Event, Ticket, OrderDetails, CreateEvent } from "@/types/types";

export async function eventInfoFn(e_id: string): Promise<Event | unknown>{
    const response = await axios.get(`${API_URL}/events/${e_id}`);
    return response.data;
}

export async function ticketInfoFn(e_id: string): Promise<Ticket[] | unknown> {
    const response = await axios.get(`${API_URL}/events/ticket/list/${e_id}`);
    return response.data;
}

export async function singleTicketInfoFn(ticket_id: string): Promise<Ticket | unknown> {
    const response = await axios.get(`${API_URL}/events/ticket/${ticket_id}`);
    return response.data;
}

type OrdDet = {
    orderDet: OrderDetails;
    ticketId: string;
}
export async function purchaseTicketFn({orderDet, ticketId}: OrdDet): Promise<OrderDetails | unknown> {
    const response = await axios.post(`${API_URL}/events/ticket/order/purchase/${ticketId}`, orderDet);
    return response.data;
}

export async function createEventFn(evntDetails: CreateEvent): Promise<Event | unknown> {
    console.log("The event payload is", evntDetails);
    const response = await axios.post(`${API_URL}/events/create`, evntDetails);
    console.log("The response for creating event is", response);
    return response.data;
}
