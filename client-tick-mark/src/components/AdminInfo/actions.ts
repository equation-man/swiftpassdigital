// Organization account management actions.
"use server"
import axios from "axios";
import { API_URL } from "@/config";
import { Wallet } from "@/types/types";

export async function myWalletFn(owner_id: string): Promise<Wallet | unknown> {
    const response = await axios.get(`${API_URL}/organization/wallet/${owner_id}`);
    console.log("The wallet respnose is", respnose)
    return response.data;
}
