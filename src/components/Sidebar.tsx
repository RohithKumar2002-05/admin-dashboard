'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutApi } from '@/lib/api';

const navItems = [
    { href: '/overview',    label: 'Overview',   icon: '▦' },
    { href: '/categories',  label: 'Categories', icon: '❏' },
];

export default function Sidebar({ adminName }: { adminName: string }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await logoutApi();
        router.push('/login');
    };

    return (
        <aside className="w-56 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-screen sticky top-0">
            {/* Brand */}
            <div className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">A</div>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Admin Panel</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 flex flex-col gap-0.5 p-3">
                {navItems.map(item => {
                    const active = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                ${active
                                    ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                                }`}
                        >
                            <span className="text-base w-5 text-center">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2.5 px-2 py-1.5">
                    <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-700 dark:text-violet-300 text-xs font-bold shrink-0">
                        {adminName?.[0]?.toUpperCase() ?? 'A'}
                    </div>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{adminName}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                    Sign out
                </button>
            </div>
        </aside>
    );
}
