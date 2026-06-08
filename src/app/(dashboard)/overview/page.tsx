import { cookies } from 'next/headers';

async function getStats(token: string) {
    try {
        const [catsRes, prodsRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/categories`, {
                headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE}/hub-admin/products`, {
                headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
            }),
        ]);
        const cats = catsRes.ok ? (await catsRes.json()).data ?? [] : [];
        const prods = prodsRes.ok ? (await prodsRes.json()).data ?? [] : [];
        return { categories: cats.length, subcategories: cats.reduce((a: number, c: { subcategories?: unknown[] }) => a + (c.subcategories?.length ?? 0), 0), products: prods.length };
    } catch {
        return { categories: 0, subcategories: 0, products: 0 };
    }
}

export default async function OverviewPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value ?? '';
    const stats = await getStats(token);

    const cards = [
        { label: 'Categories',    value: stats.categories,    icon: '❏', color: 'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400' },
        { label: 'Subcategories', value: stats.subcategories, icon: '⊟', color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' },
        { label: 'Products',      value: stats.products,      icon: '⊞', color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Overview</h1>
                <p className="text-sm text-zinc-500 mt-1">Platform-wide summary</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {cards.map(c => (
                    <div key={c.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${c.color}`}>
                            {c.icon}
                        </div>
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{c.value}</p>
                        <p className="text-sm text-zinc-500">{c.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
