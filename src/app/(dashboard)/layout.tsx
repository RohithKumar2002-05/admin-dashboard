import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { MdVisibility, MdLogin } from 'react-icons/md';
import Link from 'next/link';

async function getAdmin(token: string) {
    try {
        const res = await fetch(`${process.env.API_BASE}/admin/me`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data ?? null;
    } catch {
        return null;
    }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const token     = cookieStore.get('admin_token')?.value;
    const guestMode = cookieStore.get('guest_mode')?.value === 'true';

    // No token and not a guest — send to login
    if (!token && !guestMode) redirect('/login');

    let admin = null;
    let isGuest = false;

    if (token) {
        admin = await getAdmin(token);
        if (!admin) redirect('/login');
    } else {
        // Guest user: use GUEST_TOKEN (read-only pre-signed JWT) to fetch data server-side
        const guestToken = process.env.GUEST_TOKEN;
        if (guestToken) {
            admin = await getAdmin(guestToken);
        }
        // Fallback if no GUEST_TOKEN or fetch fails
        if (!admin) admin = { name: 'Guest' };
        isGuest = true;
    }

    return (
        <div className="flex min-h-screen bg-[#f4f6f4] lg:flex-row flex-col">
            <Sidebar adminName={admin.name} adminRole={admin.role} isGuest={isGuest} />
            <main className="flex-1 min-w-0 overflow-y-auto bg-[#f4f6f4] pt-14 lg:pt-0">
                {/* Guest banner */}
                {isGuest && (
                    <div className="flex items-center justify-between px-6 py-2.5 bg-amber-50 border-b border-amber-200">
                        <div className="flex items-center gap-2 text-amber-800 text-sm">
                            <MdVisibility className="shrink-0 text-amber-600" />
                            <span>You are browsing as a <strong>Guest</strong>. View-only — no changes allowed.</span>
                        </div>
                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#166534] hover:bg-[#14532d] px-3 py-1.5 rounded-xl transition-colors"
                        >
                            <MdLogin className="text-sm" />
                            Login
                        </Link>
                    </div>
                )}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
