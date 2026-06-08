import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

async function getAdmin(token: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/me`, {
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
    const token = cookieStore.get('admin_token')?.value;

    if (!token) redirect('/login');

    const admin = await getAdmin(token);
    if (!admin) redirect('/login');

    return (
        <div className="flex min-h-screen">
            <Sidebar adminName={admin.name} />
            <main className="flex-1 min-w-0 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
