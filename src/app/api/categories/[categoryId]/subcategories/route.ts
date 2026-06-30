import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.API_BASE;

async function getToken() {
    const store = await cookies();
    return store.get('admin_token')?.value ?? null;
}

// GET /api/categories/[categoryId]/subcategories
export async function GET(_req: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
    const token = await getToken();
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { categoryId } = await params;
    const res = await fetch(`${BACKEND}/admin/categories/${categoryId}/subcategories`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
}

// POST /api/categories/[categoryId]/subcategories
export async function POST(req: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
    const token = await getToken();
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { categoryId } = await params;
    const form = await req.formData();
    const res = await fetch(`${BACKEND}/admin/categories/${categoryId}/subcategories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
}
