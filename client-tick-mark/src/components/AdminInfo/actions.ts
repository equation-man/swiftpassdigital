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
    console.log("The data is", walletData);
    const payload: CreateWallet = {
        business_name: walletData.business_name,
        settlement_bank: walletData.settlement_bank,
        account_number: walletData.account_number,
        wallet_email: walletData.wallet_email,
    };
    const response = await axios.post(`${API_URL}/organization/wallet/create/${walletData.owner_id}`, payload);
    return response.data;
}
