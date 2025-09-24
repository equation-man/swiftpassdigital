// Events fetching actions.
"use server";
import axios from "axios";
import { API_URL } from "@/config";
import { Event } from "@/types/types";

export async function fetchEventsFn(): Promise<Event[] | unknown>{
    const events = await axios.get(`${API_URL}/events/list`);
    return events.data;
}
