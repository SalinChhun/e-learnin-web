"use client"
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { TanstackQueryProvider } from "./TanstackQueryProvider";


interface AuthProviderProps {
    children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {

    return (
        <SessionProvider>
            <TanstackQueryProvider>
                {children}
            </TanstackQueryProvider>
        </SessionProvider>
    );
}