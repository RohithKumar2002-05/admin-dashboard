import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const B = process.env.API_BASE;
async function token() { return (await cookies()).get('admin_token')?.value ?? null; }

export async function GET() {
    const t = await token();
    if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const res = await fetch(`${B}/admin/users`, { headers: { Authorization: `Bearer ${t}` }, cache: 'no-store' });
    return NextResponse.json(await res.json(), { status: res.status });
}

export async function POST(req: NextRequest) {
    const t = await token();
    if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const res = await fetch(`${B}/admin/users`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return NextResponse.json(await res.json(), { status: res.status });
}
