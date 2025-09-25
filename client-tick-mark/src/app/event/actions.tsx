// Fetching a single ticket.
"use server";
import axios from "axios";
import { API_URL } from "@/config";
import { Event, Ticket } from "@/types/types";

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
