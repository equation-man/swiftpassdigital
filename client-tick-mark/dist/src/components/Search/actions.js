// Fetching events via full text search.
"use server";
import axios from "axios";
import { API_URL } from "@/config";
export async function searchEventsFn(params) {
    const events = await axios.get(`${API_URL}/events/search`, {
        params: {
            search_string: params.searchQuery,
        },
    });
    return events.data;
}
