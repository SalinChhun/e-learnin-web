import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import authService from "@/service/auth.service";

/**
 * This endpoint allows client components to trigger token refresh when needed
 */
export async function GET(req: NextRequest) {
    try {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET
        });

        if (!token) {
            return new NextResponse(
                JSON.stringify({ error: "Not authenticated" }),
                { status: 401 }
            );
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const tokenExpiry = token.expiresAt as number;

        if (!tokenExpiry || currentTime + 30 >= tokenExpiry) {
            const response = await authService.refresh({refresh_token: token.refreshToken})
            

            if (!response.data) {
                throw new Error("Failed to refresh token");
            }

            const refreshedData = response.data;

            return NextResponse.json({ success: true });
        }

        // Token is still valid
        return NextResponse.json({ success: true });

    } catch (error) {
        return new NextResponse(
            JSON.stringify({ error: "Failed to refresh token" }),
            { status: 500 }
        );
    }
}