// Verification server actions.
"use server";
import axios from "axios";
import { API_URL } from "@/config";
export async function fetchOrderFn(params) {
    const order = await axios.get(`${API_URL}/events/ticket/verify/paystack/order/${params.ticket_id}`, {
        params: {
            trxref: params.trxref,
            reference: params.reference,
            email: params.email,
            phone: params.phone,
            event_id: params.event_id,
        },
    });
    return order.data;
}
export async function fetchMpesaOrderFn(params) {
    const order = await axios.get(`${API_URL}/events/ticket/verify/${params.ticket_id}`, {
        params: {
            //trxref: params.trxref,
            reference: params.reference,
            //email: params.email,
            //phone: params.phone,
            //event_id: params.event_id,
        },
    });
    return order.data;
}
