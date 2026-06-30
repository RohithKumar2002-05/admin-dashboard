import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.API_BASE;

async function getToken() {
    const store = await cookies();
    return store.get('admin_token')?.value ?? null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const token = await getToken();
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const res = await fetch(`${BACKEND}/hub-admin/hubs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
}
