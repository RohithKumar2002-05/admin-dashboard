import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const B = process.env.API_BASE;
async function token() { return (await cookies()).get('admin_token')?.value ?? null; }

export async function PUT(req: NextRequest, { params }: { params: Promise<{ adminId: string }> }) {
    const t = await token();
    if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { adminId } = await params;
    const body = await req.json();
    const res = await fetch(`${B}/admin/users/${adminId}/role`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return NextResponse.json(await res.json(), { status: res.status });
}
