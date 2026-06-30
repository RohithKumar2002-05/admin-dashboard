'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutApi } from '@/lib/api';
import {
    MdDashboard, MdCategory, MdHub, MdSettings,
    MdLogout, MdPerson, MdVisibility, MdPeople,
} from 'react-icons/md';

const navItems = [
    { href: '/overview',   label: 'Dashboard',  icon: MdDashboard },
    { href: '/categories', label: 'Categories', icon: MdCategory },
    { href: '/hubs',       label: 'Hubs',       icon: MdHub },
    { href: '/customers',  label: 'Customers',  icon: MdPeople },
    { href: '/settings',   label: 'Settings',   icon: MdSettings },
];

interface SidebarProps {
    adminName: string;
    isGuest?: boolean;
}

export default function Sidebar({ adminName, isGuest = false }: SidebarProps) {
    const pathname = usePathname();
    const router   = useRouter();

    const handleLogout = async () => {
        if (isGuest) {
            await fetch('/api/auth/guest-logout', { method: 'POST' });
        } else {
            await logoutApi();
        }
        router.push('/login');
    };

    return (
        <aside className="w-60 shrink-0 bg-[#1a2e1a] flex flex-col h-screen sticky top-0">
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 py-6">
                <div className="w-9 h-9 rounded-xl bg-[#2d5a2d] flex items-center justify-center shrink-0">
                    <MdDashboard className="text-[#4ade80] text-xl" />
                </div>
                <span className="text-white font-bold text-lg tracking-tight">AdminPanel</span>
            </div>

            {/* Section label */}
            <p className="px-6 text-[10px] font-semibold uppercase tracking-widest text-[#4a7a4a] mb-2">Menu</p>

            {/* Nav */}
            <nav className="flex flex-col gap-1 px-3">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                                ${active
                                    ? 'bg-[#2d5a2d] text-white'
                                    : 'text-[#8aab8a] hover:bg-[#243824] hover:text-white'
                                }`}
                        >
                            <Icon className={`text-lg shrink-0 ${active ? 'text-[#4ade80]' : ''}`} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* General section */}
            <p className="px-6 text-[10px] font-semibold uppercase tracking-widest text-[#4a7a4a] mt-6 mb-2">General</p>
            <nav className="flex flex-col gap-1 px-3">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#8aab8a] hover:bg-[#243824] hover:text-white transition-all"
                >
                    <MdSettings className="text-lg shrink-0" />
                    Settings
                </Link>
            </nav>

            <div className="flex-1" />

            {/* User + Logout */}
            <div className="px-3 pb-5 flex flex-col gap-1">
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${isGuest ? 'bg-amber-900/30' : 'bg-[#243824]'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isGuest ? 'bg-amber-800/40' : 'bg-[#2d5a2d]'}`}>
                        {isGuest
                            ? <MdVisibility className="text-amber-400 text-base" />
                            : <MdPerson className="text-[#4ade80] text-base" />
                        }
                    </div>
                    <div className="min-w-0">
                        <span className="text-sm font-medium text-white truncate block">{adminName}</span>
                        {isGuest && <span className="text-[10px] text-amber-400 font-medium">View only</span>}
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#8aab8a] hover:bg-red-900/30 hover:text-red-400 transition-all w-full text-left"
                >
                    <MdLogout className="text-lg shrink-0" />
                    {isGuest ? 'Exit Guest' : 'Logout'}
                </button>
            </div>
        </aside>
    );
}
