"use server";
import axios from "axios";
import { API_URL } from "@/config";
import { LoginUser, User, LoginOrg, Organization } from "@/types/types";

export async function loginUserFn(loginUser: LoginUser): Promise<User[] | unknown>{
    const response = await axios.post(`${API_URL}/users/login`, loginUser);
    return response.data;
}

export async function loginOrgFn(loginOrg: LoginOrg): Promise<Organization | unknown> {
    const response = await axios.post(`${API_URL}/organization/admin`, loginOrg);
    return response.data;
}

type DerOrgLogin = {
    access_username: string;
    access_code: string;
}

export async function defloginOrgFn(defOrgLogin: DefOrgLogin): Promise<unkwon> {
    const response = await axios.post(`${API_URL}/organization/login`, defOrgLogin);
    console.log("The default login response is", response)
    return response.data;
}
