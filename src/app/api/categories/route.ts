import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE;

async function getToken() {
    const store = await cookies();
    return store.get('admin_token')?.value ?? null;
}

export async function GET() {
    const token = await getToken();
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await fetch(`${BACKEND}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
}

export async function POST(req: NextRequest) {
    const token = await getToken();
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Forward FormData as-is to the backend
    const form = await req.formData();
    const res = await fetch(`${BACKEND}/admin/categories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
}
