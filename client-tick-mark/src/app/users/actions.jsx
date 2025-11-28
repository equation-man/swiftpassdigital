// Listing organizations
"use server";
import axios from "axios";
import { API_URL } from "@/config";

export async function orgsAvailableFn(owner_id) {
    try {
        const response = await axios.get(`${API_URL}/organization/list`);
        return response.data;
    } catch (error) {
        return [];
    }
}
