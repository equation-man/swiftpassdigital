// Events fetching actions.
"use server";
import axios from "axios";
import { API_URL } from "@/config";
import { Event } from "@/types/types";

export async function fetchEventsFn(): Promise<Event[] | unknown>{
    const events = await axios.get(`${API_URL}/events/list`);
    return events.data;
}

export async function fetchReportFn(event_id: string): Promise<unknown> {
    const report = await axios.get(`${API_URL}/events/report/${event_id}`);
    return report.data;
}

export async function deleteEventFn(event_id: string): Promise<Event | unknown> {
    const del_event = await axios.delete(`${API_URL}/events/delete/${event_id}`);
    return del_event;
}
