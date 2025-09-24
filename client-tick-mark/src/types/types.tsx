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
