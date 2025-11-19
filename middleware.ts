import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    
    // Define protected paths
    const protectedPaths = ['/', '/partners'];
    const isProtectedPath = protectedPaths.some(prefix => 
        path === prefix || path.startsWith(`${prefix}/`)
    );
    
    if (isProtectedPath) {
        const token = await getToken({ 
            req, 
            secret: process.env.NEXTAUTH_SECRET 
        });
        
        if (!token) {
            const url = new URL('/login', req.url);
            url.searchParams.set('callbackUrl', path);
            
            return NextResponse.redirect(url);
        }
        
        if (token.error === "SessionExpired" || token.error === "RefreshTokenError") {
            const url = new URL('/login', req.url);
            url.searchParams.set('error', 'RefreshTokenError');
            return NextResponse.redirect(url);
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};