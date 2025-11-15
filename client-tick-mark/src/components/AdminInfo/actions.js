// Organization account management actions.
"use server";

import axios from "axios";
import { API_URL } from "@/config";

// GET WALLET
export async function myWalletFn(owner_id) {
    const response = await axios.get(`${API_URL}/organization/wallet/${owner_id}`);
    return response.data;
}

// CREATE BANK WALLET
export async function createWalletFn(walletData) {
    const payload = {
        business_name: walletData.business_name,
        settlement_bank: walletData.settlement_bank,
        account_number: walletData.account_number,
        wallet_email: walletData.wallet_email,
    };

    const response = await axios.post(
        `${API_URL}/organization/wallet/create/${walletData.owner_id}`,
        payload
    );

    return response.data;
}

// CREATE MPESA WALLET
export async function createMpesaWalletFn(walletData) {
    const payload = {
        business_name: walletData.business_name,
        settlement_bank: walletData.settlement_bank,
        account_number: walletData.account_number,
        wallet_email: walletData.wallet_email,
    };

    const response = await axios.post(
        `${API_URL}/organization/wallet/mpesa/create/${walletData.owner_id}`,
        payload
    );

    return response.data;
}

// CREATE USER ACCESS
export async function createUserAccessFn(accessData) {
    const response = await axios.post(
        `${API_URL}/organization/access/create/${accessData.org_id}`,
        {
            user_id: accessData.user_id,
            access_username: accessData.access_username
        }
    );

    return response.data;
}

// GET USER ACCESS LIST
export async function getUserAccessListFn(org_id) {
    const response = await axios.get(
        `${API_URL}/organization/access/list/${org_id}`
    );
    return response.data;
}

// DELETE USER ACCESS
export async function deleteUserAccessFn(organization_id, access_code_id) {
    const response = await axios.delete(
        `${API_URL}/organization/access/revoke/${organization_id}/${access_code_id}`
    );
    return response.data;
}

