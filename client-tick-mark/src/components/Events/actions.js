// Events fetching actions.
"use server";
import axios from "axios";
import { API_URL } from "@/config";

export async function fetchEventsFn(){
    const events = await axios.get(`${API_URL}/events/list`);
    return events.data;
}

export async function fetchReportFn(event_id) {
    const report = await axios.get(`${API_URL}/events/report/${event_id}`);
    return report.data;
}

export async function deleteEventFn(event_id) {
    const del_event = await axios.delete(`${API_URL}/events/delete/${event_id}`);
    return del_event;
}
