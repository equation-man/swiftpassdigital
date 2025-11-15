"use server";

import axios from "axios";
import { API_URL } from "@/config";

export async function registerUserFn(newUser) {
  const createUser = {
    first_name: newUser.first_name,
    last_name: newUser.last_name,
    email: newUser.email,
    user_name: newUser.username,   // JS version keeps your mapping
    telephone: newUser.telephone,
    password: newUser.password,
  };

  const response = await axios.post(`${API_URL}/users/register`, createUser);
  return response.data;
}

export async function registerOrgFn(newOrg) {
  const createOrg = {
    organization_name: newOrg.organization_name,
    org_email: newOrg.org_email,
    org_pwd: newOrg.org_pwd,
    country: newOrg.country,
  };

  const response = await axios.post(`${API_URL}/organization/registration`, createOrg);
  return response.data;
}

