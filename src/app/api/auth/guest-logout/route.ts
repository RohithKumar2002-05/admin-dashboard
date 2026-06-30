import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ message: 'Guest session ended' });
    response.cookies.set('guest_mode', '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });
    return response;
}
