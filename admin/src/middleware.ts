import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith('/login');
    const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

    // Skip middleware for API and static files
    if (request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.includes('.')) {
        return NextResponse.next();
    }

    // Logic for browser-side (token is in localStorage normally, so middleware might need a cookie helper)
    // For simplicity since I'm using localStorage in context, I'll rely on the client-side check for now,
    // but a real middleware would use cookies.

    return NextResponse.next();
}
