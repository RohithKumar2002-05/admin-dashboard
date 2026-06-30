import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.API_BASE;

async function getToken() {
    const store = await cookies();
    const token     = store.get('admin_token')?.value;
    const guestMode = store.get('guest_mode')?.value === 'true';
    // For guests, use GUEST_TOKEN so read endpoints still return data
    return token ?? (guestMode ? process.env.GUEST_TOKEN : null) ?? null;
}

// GET /api/categories — fetch all categories with sub_categories
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

// POST /api/categories — create category (blocked for guests — no token)
export async function POST(req: NextRequest) {
    const store     = await cookies();
    const token     = store.get('admin_token')?.value;
    const guestMode = store.get('guest_mode')?.value === 'true';
    if (!token || guestMode) return NextResponse.json({ error: 'Forbidden: guest users cannot make changes' }, { status: 403 });

    const form = await req.formData();
    const res = await fetch(`${BACKEND}/admin/categories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
}
