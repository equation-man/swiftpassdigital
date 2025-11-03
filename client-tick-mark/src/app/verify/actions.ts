// Verification server actions.
"use server";
import axios from "axios";
import { API_URL } from "@/config";
import { Order } from "@/types/types";

export async function fetchOrderFn(params): Promise<Order | unknown> {
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

export async function fetchMpesaOrderFn(params): Promise<Order | unknown> {
    console.log("The fetch function params are", params)
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
