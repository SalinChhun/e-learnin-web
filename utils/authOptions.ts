import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import CryptoJS from 'crypto-js';
import authService from "@/service/auth.service";
import { AuthRequest } from "@/lib/types/auth";

// Define interfaces for API responses
interface LoginResponse {
    data: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
    };
    status: {
        code: number;
        message: string;
    };
}

const encryptToken = (token: string): string => {
    const secretKey = process.env.NEXTAUTH_SECRET || 'default-secret-key';
    return CryptoJS.AES.encrypt(token, secretKey).toString();
};

const decryptToken = (encryptedToken: string): string => {
    const secretKey = process.env.NEXTAUTH_SECRET || 'default-secret-key';
    const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};


async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        if (!token.rememberMe) {
            return {
                ...token,
                error: "NoRefreshToken",
            };
        }


        const currentTime = Math.floor(Date.now() / 1000);
        const tokenExpiry = token.expiresAt as number;

        if (tokenExpiry > currentTime) {
            return token;
        }

        const decryptedRefreshToken = token.refreshToken
            ? decryptToken(token.refreshToken as string)
            : token.refreshToken;

        // Make a request to your API with the refresh token
        const response = await authService.refresh({
            refresh_token: decryptedRefreshToken,
        });

        const refreshedTokens = response.data as LoginResponse;

        if (refreshedTokens.status.code !== 200 || !refreshedTokens.data.access_token) {
            throw new Error("Invalid refresh token response");
        }

        const expiresAt = Math.floor(Date.now() / 1000) + refreshedTokens.data.expires_in || 3000;

        const encryptedAccessToken = encryptToken(refreshedTokens.data.access_token);
        const encryptedRefreshToken = encryptToken(refreshedTokens.data.refresh_token);

        // Parse the new access token to get updated user information
        const tokenParts = refreshedTokens.data.access_token.split('.');
        const tokenPayload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

        const scope = tokenPayload.scope || '';
        const permissions = scope.split(' ');

        return {
            ...token,
            id: tokenPayload.sub,
            access_token: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
            role: tokenPayload.role,
            permissions: permissions,
            expiresAt,
            error: undefined, // Clear any previous errors
        };
    } catch (error) {
        console.error("Error refreshing access token", error);
        return {
            ...token,
            error: "RefreshTokenError",
        };
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    let authRequest: AuthRequest = {
                        username: credentials.username,
                        password: credentials.password
                    }

                    const response = await authService.login(authRequest);
                    
                    const data = response.data as LoginResponse;

                    if (data?.status?.code !== 200 || !data?.data?.access_token) {
                        const errorMessage = data?.status?.message || "Login failed";
                        throw new Error(errorMessage);
                    }

                    const rememberMe = true

                    const encryptedAccessToken = encryptToken(data.data.access_token);
                    const encryptedRefreshToken = encryptToken(data.data.refresh_token);

                    const tokenParts = data.data.access_token.split('.');
                    const tokenPayload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

                    const scope = tokenPayload.scope || '';
                    const permissions = scope.split(' ');

                    return {
                        id: tokenPayload.sub || credentials.username,
                        name: tokenPayload.sub || credentials.username,
                        role: tokenPayload.role,
                        permissions: permissions,
                        access_token: encryptedAccessToken,
                        refresh_token: encryptedRefreshToken,
                        expires_in: data.data.expires_in, 
                        remember: rememberMe,
                    };
                } catch (error:any) {
                    console.error("Authentication error:", error);
                    // Extract error message from API response
                    let errorMessage = "Invalid username or password";
                    
                    if (error?.response?.data?.status?.message) {
                        // API returned error with status message
                        errorMessage = error.response.data.status.message;
                    } else if (error?.message) {
                        // Error thrown with message
                        errorMessage = error.message;
                    } else if (error?.response?.data?.message) {
                        // Alternative error message location
                        errorMessage = error.response.data.message;
                    }
                    
                    // Throw error so NextAuth can pass it through
                    throw new Error(errorMessage);
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            // Initial sign in
            if (user) {
                // Calculate the expiry time
                const expiresAt = Math.floor(Date.now() / 1000) + (user.expires_in as number);
                return {
                    ...token,
                    access_token: user.access_token,
                    refreshToken: user.refresh_token,
                    expiresAt,
                    userId: user.id,
                    name: user.name,
                    role: user.role,
                    permissions: user.permissions,
                    rememberMe: user.remember, // Map from user.remember to token.rememberMe
                };
            }

            const currentTime = Math.floor(Date.now() / 1000);
            const tokenExpiry = token.expiresAt as number;
            // If token is expired and not an update request
            if (currentTime >= tokenExpiry && trigger !== "update") {
                return refreshAccessToken(token);
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.userId as string;
                session.user.name = token.name as string;
                session.user.role = token.role as string;
                session.user.permissions = token.permissions as string[];

                // Decrypt the access token before adding to session
                const decryptedAccessToken = token.access_token
                    ? decryptToken(token.access_token as  string)
                    : token.access_token;

                session.access_token = decryptedAccessToken as string;
                session.expires_in = token.expiresAt as number;
                session.error = token.error as string | undefined;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    events: {
        async signOut({ token }) {
            authService.loginOut({access_token: decryptToken(token.access_token as string), refresh_token: decryptToken(token.refreshToken as string)})
        }},
};

export default authOptions;