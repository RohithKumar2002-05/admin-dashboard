'use client';

import { useEffect, useState } from 'react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, BarChart, Bar,
} from 'recharts';
import {
    MdCategory, MdAccountTree, MdInventory2, MdStore,
    MdArrowOutward, MdTrendingUp, MdTrendingDown, MdCircle,
} from 'react-icons/md';
import { FiDollarSign, FiPackage, FiBarChart2, FiShoppingCart } from 'react-icons/fi';
import { connectSocket, disconnectSocket } from '@/lib/socket';

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

interface Props {
    initialRevenue: RevenueStats | null;
    initialPlatform: PlatformStats;
    token: string;
}

function formatK(n: number) {
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
    if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n.toFixed(0)}`;
}

function trendPct(current: number, prev: number) {
    if (prev === 0) return current > 0 ? { text: '+100%', up: true } : null;
    const pct = (((current - prev) / prev) * 100).toFixed(1);
    return { text: `${Number(pct) >= 0 ? '+' : ''}${pct}%`, up: Number(pct) >= 0 };
}

export default function DashboardClient({ initialRevenue, initialPlatform, token }: Props) {
    const [revenue, setRevenue]     = useState<RevenueStats | null>(initialRevenue);
    const [platform]                = useState<PlatformStats>(initialPlatform);
    const [liveFlash, setLiveFlash] = useState(false);

    const flash = () => { setLiveFlash(true); setTimeout(() => setLiveFlash(false), 2000); };

    // Refresh revenue from Next.js route handler (server reads httpOnly cookie)
    const refreshRevenue = async () => {
        try {
            const res = await fetch('/api/revenue');
            if (res.ok) {
                const json = await res.json();
                setRevenue(json.data ?? json);
            }
        } catch { /* ignore */ }
    };

    // Socket — token passed from server, no document.cookie access
    useEffect(() => {
        if (!token) return;
        const socket = connectSocket(token);

        socket.on('metrics_update', (stats: RevenueStats) => {
            setRevenue(stats);
            flash();
        });

        socket.on('order_placed', () => {
            refreshRevenue();
            flash();
        });

        return () => {
            socket.off('metrics_update');
            socket.off('order_placed');
            disconnectSocket();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const revTrend = trendPct(revenue?.thisMonthRevenue ?? 0, revenue?.lastMonthRevenue ?? 0);
    const ordTrend = trendPct(revenue?.thisMonthOrders  ?? 0, revenue?.lastMonthOrders  ?? 0);
    const chartData = revenue?.chart ?? [];

    const revenueCards = [
        { label: 'Total Revenue',   value: formatK(revenue?.totalRevenue ?? 0),            sub: 'All time captured',  trend: null,     Icon: FiDollarSign,  dark: true  },
        { label: 'This Month',      value: formatK(revenue?.thisMonthRevenue ?? 0),         sub: 'vs last month',      trend: revTrend, Icon: FiBarChart2,   dark: false },
        { label: 'Total Orders',    value: (revenue?.totalOrders ?? 0).toLocaleString(),    sub: `${revenue?.thisMonthOrders ?? 0} this month`, trend: ordTrend, Icon: FiPackage, dark: false },
        { label: 'Avg Order Value', value: formatK(revenue?.avgOrderValue ?? 0),            sub: 'Per captured order', trend: null,     Icon: FiShoppingCart, dark: false },
    ];

    const platformCards = [
        { label: 'Categories',    value: platform.categories,    Icon: MdCategory,   href: '/categories' },
        { label: 'Subcategories', value: platform.subcategories, Icon: MdAccountTree, href: '/categories' },
        { label: 'Products',      value: platform.products,      Icon: MdInventory2,  href: '/hubs' },
        { label: 'Hubs',          value: platform.hubs,          Icon: MdStore,       href: '/hubs' },
    ];

    return (
        <div className="min-h-screen bg-[#f4f6f4] space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a2e1a]">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Platform-wide revenue and metrics.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm">
                    <MdCircle className={`text-xs transition-colors duration-300 ${liveFlash ? 'text-[#4ade80]' : 'text-gray-300'}`} />
                    <span className="text-xs font-medium text-gray-500">Live</span>
                </div>
            </div>

            {/* Revenue Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {revenueCards.map((c) => {
                    const Icon = c.Icon;
                    return (
                        <div key={c.label} className={`rounded-2xl p-6 flex flex-col gap-3 shadow-sm border transition-transform hover:-translate-y-0.5 ${c.dark ? 'bg-[#1a3a1a] border-[#2d5a2d]' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center justify-between">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.dark ? 'bg-[#2d5a2d]' : 'bg-[#dcfce7]'}`}>
                                    <Icon className={`text-lg ${c.dark ? 'text-[#4ade80]' : 'text-[#166534]'}`} />
                                </div>
                                <MdArrowOutward className={c.dark ? 'text-[#4ade80]' : 'text-gray-300'} />
                            </div>
                            <p className={`text-3xl font-bold ${c.dark ? 'text-white' : 'text-[#1a2e1a]'}`}>{c.value}</p>
                            <div>
                                <p className={`text-xs ${c.dark ? 'text-[#86efac]' : 'text-gray-400'}`}>{c.label}</p>
                                {c.trend ? (
                                    <p className={`flex items-center gap-1 text-xs font-semibold mt-0.5 ${c.trend.up ? 'text-[#16a34a]' : 'text-red-500'}`}>
                                        {c.trend.up ? <MdTrendingUp /> : <MdTrendingDown />}
                                        {c.trend.text} vs last month
                                    </p>
                                ) : (
                                    <p className={`text-xs mt-0.5 ${c.dark ? 'text-[#4ade80]' : 'text-gray-400'}`}>{c.sub}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Area Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <p className="text-base font-bold text-[#1a2e1a]">Revenue Performance</p>
                            <p className="text-xs text-gray-400 mt-0.5">Monthly captured payments · last 8 months</p>
                        </div>
                        <span className="text-2xl font-bold text-[#1a2e1a]">{formatK(revenue?.totalRevenue ?? 0)}</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#166534" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#166534" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${Number(v) / 1000}K`} />
                            <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#166534" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#166534' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="bg-[#1a3a1a] rounded-2xl border border-[#2d5a2d] shadow-sm p-6">
                    <p className="text-base font-bold text-white mb-1">Monthly Revenue</p>
                    <p className="text-xs text-[#86efac] mb-5">Revenue per month</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={14}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2d5a2d" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#86efac' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#86efac' }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 10, background: '#1a3a1a', border: '1px solid #2d5a2d', color: '#fff', fontSize: 12 }} />
                            <Bar dataKey="revenue" name="Revenue" fill="#4ade80" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Platform Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Platform Quick Stats */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <p className="text-base font-bold text-[#1a2e1a] mb-5">Platform Overview</p>
                    <div className="grid grid-cols-2 gap-4">
                        {platformCards.map(({ label, value, Icon, href }) => (
                            <a key={label} href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f0fdf4] transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-[#dcfce7] flex items-center justify-center shrink-0">
                                    <Icon className="text-[#166534] text-lg" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-[#1a2e1a] group-hover:text-[#166534] transition-colors">{value}</p>
                                    <p className="text-xs text-gray-400">{label}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-[#1a3a1a] rounded-2xl border border-[#2d5a2d] shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-base font-bold text-white">Revenue Breakdown</p>
                        <MdCircle className={`text-xs transition-colors duration-300 ${liveFlash ? 'text-[#4ade80]' : 'text-[#2d5a2d]'}`} />
                    </div>
                    <div className="flex flex-col gap-5">
                        {[
                            { label: 'Total Revenue',   value: revenue?.totalRevenue    ?? 0, max: Math.max(revenue?.totalRevenue    ?? 1, 1), formatted: formatK(revenue?.totalRevenue    ?? 0) },
                            { label: 'This Month',      value: revenue?.thisMonthRevenue ?? 0, max: Math.max(revenue?.totalRevenue    ?? 1, 1), formatted: formatK(revenue?.thisMonthRevenue ?? 0) },
                            { label: 'Last Month',      value: revenue?.lastMonthRevenue ?? 0, max: Math.max(revenue?.totalRevenue    ?? 1, 1), formatted: formatK(revenue?.lastMonthRevenue ?? 0) },
                            { label: 'Avg Order Value', value: revenue?.avgOrderValue    ?? 0, max: Math.max(revenue?.thisMonthRevenue ?? 1, 1), formatted: formatK(revenue?.avgOrderValue    ?? 0) },
                        ].map(({ label, value, max, formatted }) => (
                            <div key={label}>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-xs text-[#86efac]">{label}</span>
                                    <span className="text-xs font-bold text-white">{formatted}</span>
                                </div>
                                <div className="h-2 bg-[#2d5a2d] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#4ade80] rounded-full transition-all duration-700" style={{ width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
