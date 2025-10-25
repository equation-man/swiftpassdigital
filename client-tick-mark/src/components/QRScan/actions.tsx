// QR CODE SERVER ACTIONS.
"use server";
import axios from "axios";
import { API_URL } from "@/config";
import { QRTicketValidation, Ticket } from "@/types/types";

export async function confirmQRcodeFn(qr_validation: QRTicketValidation): Promise<QRTicketValidation | unkwon> {
    console.log("Confirming qr code data", qr_validation);
    const qrconfresp = await axios.patch(`${API_URL}/events/ticket/qrverify/${qr_validation.organization_id}/${qr_validation.event_id}`, {
        entrance_code: qr_validation.entrance_code,
        paystack_reference: qr_validation.paystack_reference,
        ticket_id: qr_validation.ticket_id,
        order_id: qr_validation.order_id,
    });
    console.log("The qr confirmation resp is", qrconfresp)
    return qrconfresp.data;
}
