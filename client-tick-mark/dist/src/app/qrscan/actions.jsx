"use server";
import axios from "axios";
import { API_URL } from "@/config";
export async function eventInfoFn(e_id) {
    const response = await axios.get(`${API_URL}/events/${e_id}`);
    return response.data;
}
