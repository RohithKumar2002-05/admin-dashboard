import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const res = await fetch(`${process.env.API_BASE}/admin/revenue-stats`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
        const json = await res.json();
        if (!res.ok) return NextResponse.json({ error: json.error ?? 'Failed' }, { status: res.status });
        return NextResponse.json(json);
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
