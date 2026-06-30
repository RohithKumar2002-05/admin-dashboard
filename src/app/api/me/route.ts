import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const token     = cookieStore.get('admin_token')?.value;
    const guestMode = cookieStore.get('guest_mode')?.value === 'true';

    // Guest: return empty permissions so all can() checks return false
    if (!token && guestMode) {
        return NextResponse.json({ data: { name: 'Guest', permissions: [] } });
    }

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const res = await fetch(`${process.env.API_BASE}/admin/me`, {
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
