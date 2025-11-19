import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            role?: string;
            permissions?: string[];
        };
        access_token: string;
        expires_in: number;
        error?: string;
    }

    interface User {
        id: string;
        name?: string;
        role?: string;
        permissions?: string[];
        access_token: string;
        refresh_token: string;
        expires_in: number;
        remember: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId: string;
        name?: string;
        role?: string;
        permissions?: string[];
        access_token: string;
        refreshToken: string;
        expiresAt: number;
        rememberMe: boolean;
        error?: string;
    }
}