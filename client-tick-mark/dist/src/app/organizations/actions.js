// Event actions actions page.
"use server";
import axios from "axios";
import { API_URL } from "@/config";
export async function myEventsFn(owner_id) {
    const response = await axios.get(`${API_URL}/events/myevents/${owner_id}`);
    return response.data;
}
