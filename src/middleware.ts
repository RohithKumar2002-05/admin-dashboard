import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup', '/api/auth/login', '/api/auth/signup'];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('admin_token')?.value;

    const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));

    // Already logged in — redirect away from auth pages
    if (token && isPublic && !pathname.startsWith('/api')) {
        return NextResponse.redirect(new URL('/overview', req.url));
    }

    // Not logged in — redirect to login for protected routes
    if (!token && !isPublic) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
