import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ message: 'Guest access granted' });
    response.cookies.set('guest_mode', 'true', {
        httpOnly: false, // must be readable by middleware (Next.js reads it server-side)
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 2, // 2 hours
    });
    return response;
}
