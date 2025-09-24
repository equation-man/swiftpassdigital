"use server";
import axios from "axios";
import { API_URL } from "@/config";
import { LoginUser, User } from "@/types/types";

export async function loginUserFn(loginUser: LoginUser): Promise<User[] | unknown>{
    const response = await axios.post(`${API_URL}/users/login`, loginUser);
    return response.data;
}
