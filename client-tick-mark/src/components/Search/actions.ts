// Fetching events via full text search.
"use server";
import axios from "axios";
import { API_URL } from "@/config";
import { Event } from "@/types/types";

export async function searchEventsFn(params): Promise<Event[] | unknown> {
    const events = await axios.get(`${API_URL}/events/search`, {
        params: {
            search_string: params.searchQuery,
        },
    });
    return events.data;
}
