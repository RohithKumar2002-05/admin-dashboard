import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Returns the token value so the client-side socket can authenticate
// without accessing the httpOnly cookie via document.cookie
export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return NextResponse.json({ token: null }, { status: 401 });
    return NextResponse.json({ token });
}
