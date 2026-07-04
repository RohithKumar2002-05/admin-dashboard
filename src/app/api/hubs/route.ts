import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.API_BASE;

async function getToken() {
    const store = await cookies();
    return store.get('admin_token')?.value ?? null;
}

export async function GET() {
    const token = await getToken();
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await fetch(`${BACKEND}/hub-admin/hubs`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
}

export async function POST(req: NextRequest) {
    const token = await getToken();
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const res = await fetch(`${BACKEND}/admin/hubs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
}
