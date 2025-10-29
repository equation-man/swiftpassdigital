"use server";
import axios from "axios";
import { API_URL } from "@/config";
import { Event } from "@/types/types";

export async function eventInfoFn(e_id: string): Promise<Event | unknown>{
    const response = await axios.get(`${API_URL}/events/${e_id}`);
    return response.data;
}

