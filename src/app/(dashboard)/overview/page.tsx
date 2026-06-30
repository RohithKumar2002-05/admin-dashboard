import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';

interface RevenueStats {
    totalRevenue: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    totalOrders: number;
    thisMonthOrders: number;
    lastMonthOrders: number;
    avgOrderValue: number;
    chart: { month: string; revenue: number }[];
}

interface PlatformStats {
    categories: number;
    subcategories: number;
    products: number;
    hubs: number;
}

async function fetchRevenue(token: string): Promise<RevenueStats | null> {
    try {
        const res = await fetch(`${process.env.API_BASE}/admin/revenue-stats`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data ?? null;
    } catch { return null; }
}

async function fetchPlatform(token: string): Promise<PlatformStats> {
    try {
        const [catsRes, hubsRes] = await Promise.all([
            fetch(`${process.env.API_BASE}/admin/categories`, {
                headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
            }),
            fetch(`${process.env.API_BASE}/hub-admin/hubs`, {
                headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
            }),
        ]);
        const cats = catsRes.ok  ? (await catsRes.json()).data ?? [] : [];
        const hubs = hubsRes.ok  ? (await hubsRes.json()).data ?? [] : [];
        return {
            categories:    cats.length,
            subcategories: cats.reduce((a: number, c: { sub_categories?: unknown[] }) => a + (c.sub_categories?.length ?? 0), 0),
            products:      hubs.reduce((a: number, h: { products?: unknown[] }) => a + (h.products?.length ?? 0), 0),
            hubs:          hubs.length,
        };
    } catch {
        return { categories: 0, subcategories: 0, products: 0, hubs: 0 };
    }
}

export default async function OverviewPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value
        ?? process.env.GUEST_TOKEN
        ?? '';

    const [revenue, platform] = await Promise.all([
        fetchRevenue(token),
        fetchPlatform(token),
    ]);

    return (
        <DashboardClient
            initialRevenue={revenue}
            initialPlatform={platform}
            token={token}
        />
    );
}
