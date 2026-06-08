import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const json = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { error: json.error ?? 'Login failed' },
                { status: res.status }
            );
        }

        const response = NextResponse.json({ data: json.data });

        response.cookies.set('admin_token', json.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 24 * 60 * 60,
        });

        return response;
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
