// Organization account management actions.
"use server"
import axios from "axios";
import { API_URL } from "@/config";
import { Wallet, CreateWallet } from "@/types/types";

export async function myWalletFn(owner_id: string): Promise<Wallet | unknown> {
    const response = await axios.get(`${API_URL}/organization/wallet/${owner_id}`);
    return response.data;
}

type walletDet = {
    walletData: CreateWallet;
}

export async function createWalletFn(walletData: Wallet): Promise<Wallet | unknown> {
    const payload: CreateWallet = {
        business_name: walletData.business_name,
        settlement_bank: walletData.settlement_bank,
        account_number: walletData.account_number,
        wallet_email: walletData.wallet_email,
    };
    const response = await axios.post(`${API_URL}/organization/wallet/create/${walletData.owner_id}`, payload);
    return response.data;
}

export async function createMpesaWalletFn(walletData: Wallet): Promise<Wallet | unknown> {
    const payload: CreateWallet = {
        business_name: walletData.business_name,
        settlement_bank: walletData.settlement_bank,
        account_number: walletData.account_number,
        wallet_email: walletData.wallet_email,
    };
    const response = await axios.post(`${API_URL}/organization/wallet/mpesa/create/${walletData.owner_id}`, payload);
    return response.data;
}

type UserAccess = {
    user_id?: string,
    access_username?: string,
}
export async function createUserAccessFn(accessData: UserAccess): Promise<unknown> {
    const response = await axios.post(`${API_URL}/organization/access/create/${accessData.org_id}`, {user_id: accessData.user_id, access_username: accessData.access_username});
    return response.data;
}

export async function getUserAccessListFn(org_id: string): Promise<unkwon> {
    const response = await axios.get(`${API_URL}/organization/access/list/${org_id}`);
    console.log("The server response for listing access logs is", response)
    return response.data;
}
