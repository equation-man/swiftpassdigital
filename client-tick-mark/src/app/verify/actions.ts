// Verification server actions.
"use server";
import axios from "axios";
import { API_URL } from "@/config";
import { Order } from "@/types/types";

export async function fetchOrderFn(params): Promise<Order | unknown> {
    const order = await axios.get(`${API_URL}/events/ticket/verify/${params.ticket_id}`, {
        params: {
            trxref: params.trxref,
            reference: params.reference,
            email: params.email,
            phone: params.phone,
        },
    });
    return order.data;
}
