"use server";
import axios from "axios";
import { API_URL } from "@/config";
import { RegisterUser, User } from "@/types/types";

export async function registerUserFn(newUser: RegisterUser): Promise<User | unknown> {
    const createUser: RegisterUser = {
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        user_name: newUser.username,
        telephone: newUser.telephone,
        password: newUser.password,
    };
    const response = await axios.post(`${API_URL}/users/register`, createUser);
    return response.data;
}

