"use server";

import axios from "axios";
import { API_URL } from "@/config";

export async function loginUserFn(loginUser) {
    const response = await axios.post(`${API_URL}/users/login`, loginUser);
    return response.data;
}

export async function loginOrgFn(loginOrg) {
    const response = await axios.post(`${API_URL}/organization/admin`, loginOrg);
    return response.data;
}

export async function defloginOrgFn(defOrgLogin) {
    const response = await axios.post(`${API_URL}/organization/login`, defOrgLogin);
    return response.data;
}

