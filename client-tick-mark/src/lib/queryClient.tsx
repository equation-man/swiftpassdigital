// Centralized query client configuration
"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 6000,
            gcTime: 10 * (60 * 1000),
        }
    }
});

const Provider = ({children}) => {
    const [client] = useState(queryClient);
    return (
        <QueryClientProvider client={client}>
            <SessionProvider>
                {children}
                <Toaster position="top-center" reverseOrder={false}/>
                <ReactQueryDevtools initialIsOpen={false}/>
            </SessionProvider>
        </QueryClientProvider>
    )
}

export default Provider;
