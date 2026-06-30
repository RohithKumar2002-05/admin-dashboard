import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const B = process.env.API_BASE;
async function token() { return (await cookies()).get('admin_token')?.value ?? null; }

export async function DELETE(_req: Request, { params }: { params: Promise<{ adminId: string }> }) {
    const t = await token();
    if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { adminId } = await params;
    const res = await fetch(`${B}/admin/users/${adminId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${t}` } });
    return NextResponse.json(await res.json(), { status: res.status });
}
