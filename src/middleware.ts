import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup', '/reset-password', '/api/auth/login', '/api/auth/signup', '/api/auth/guest', '/api/password-reset'];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token     = req.cookies.get('admin_token')?.value;
    const guestMode = req.cookies.get('guest_mode')?.value === 'true';

    const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));

    // Authenticated — redirect away from auth pages
    if (token && isPublic && !pathname.startsWith('/api')) {
        return NextResponse.redirect(new URL('/overview', req.url));
    }

    // Guest — redirect away from auth pages
    if (guestMode && !token && isPublic && !pathname.startsWith('/api')) {
        return NextResponse.redirect(new URL('/overview', req.url));
    }

    // No token and not guest — redirect to login for protected routes
    if (!token && !guestMode && !isPublic) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
