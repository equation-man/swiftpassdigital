// program types.
export interface LoginUser {
    email: string;
    password: string;
}

export interface RegisterUser extends LoginUser {
    first_name: string;
    last_name: string;
    user_name: string;
    telephone: string;
}

export interface User extends Omit<RegisterUser, "password"> {
    user_id: string;
    email_verification: boolean;
}

export interface Event {
    event_id: string;
    owner_id: string;
    title: string;
    description: string;
    venue: string;
    start_date: string;
    finish_date: string;
    added_at: string;
    edited: bool;
    event_tag: string;
}

export interface CreateEvent {
    owner_id: string;
    title: string;
    description: string;
    venue: string;
    start_date: string;
    finish_date: string;
    event_tag: string;
}

export interface Ticket {
    ticket_id: string;
    event_id: string;
    base_price: string;
    ticket_type: string;
    ticket_class: string;
    start_time: string;
    finish_time: string;
    added_at: string;
    description: string;
    discount_time: number;
    capacity: number;
}

export interface CreateTicket {
    event_id: string;
    base_price: string;
    capacity: number;
    ticket_type: string;
    ticket_class: string;
    discount_time: number;
    start_time: string;
    finish_time: string;
    description: string;
}

export interface OrderDetails {
    order_id: string;
    ticket_id: string;
    user_email: string;
    user_contact: string;
    ticket_price: string;
    added_at: string;
    ticket_status: string;
    entrance_code: string;
    order_limit: number;
}

export interface RegisterOrg {
    organization_name: string;
    org_email: string;
    org_pwd: string;
    country: string;
}

export interface LoginOrg {
    org_email: string;
    org_pwd: string;
}

export interface Organization {
    organization_id: string;
    organization_name: string;
    organization_username: string;
    org_email: string;
    country: string;
    description: string;
}

export interface Wallet {
    wallet_id: string;
    owner_id: string;
    business_name: string;
    bank_code: string;
    account_number: string;
    subaccount: string;
    currency: string;
}

export interface CreateWallet {
    business_name: string;
    settlement_bank: string;
    account_number: string;
    wallet_email: string;
}

export interface Order {
    order_id: string;
    ticket_id: string;
    user_id: string;
    user_email: string;
    user_contact: string;
    ticket_price: string;
    added_at: string;
    promo_code: string;
    ticket_status: string;
    entrance_code: string;
    order_limit: string;
    discount_time: string;
    paystack_reference: string;
}

export type QRTicketValidation = {
    ok: boolean;
    event_id?: string;
    ticket_id?: string;
    entrace_code?: string;
    ticket_type?: string;
    ticket_status?: string;
    start_time?: string;
    finish_time?: string;
    message?: string;
}

export type UsersAccessInfo = {
    access_code?: string;
    access_code_id?: string;
    access_role?: string;
    access_username?: string;
    organization_id?: string;
    permissions?: string;
    user_id?: string;
}
