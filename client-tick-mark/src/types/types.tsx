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
    edited: string;
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
