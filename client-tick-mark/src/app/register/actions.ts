"use server";
import axios from "axios";
import { API_URL } from "@/config";
import { RegisterUser, User, RegisterOrg, Organization } from "@/types/types";

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

export async function registerOrgFn(newOrg: RegisterOrg): Promise<Organization | unknown> {
    const createOrg: RegisterOrg = {
        organization_name: newOrg.organization_name,
        org_email: newOrg.org_email,
        org_pwd: newOrg.org_pwd,
        country: newOrg.country,
    };
    const response = await axios.post(`${API_URL}/organization/registration`, createOrg);
    return response.data;
}
