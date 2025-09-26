// Event actions actions page.
"use server";
import axios from "axios";
import { API_URL } from "@/config";
import { Event, Ticket } from "@/types/types";

export async function myEventsFn(owner_id: string): Promise<Event[] | unknown> {
    const response = await axios.get(`${API_URL}/events/myevents/${owner_id}`);
    return response.data;
}
