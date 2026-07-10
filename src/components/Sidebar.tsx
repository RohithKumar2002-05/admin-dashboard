'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { logoutApi } from '@/lib/api';
import {
    MdDashboard, MdCategory, MdHub, MdSettings,
    MdLogout, MdPerson, MdVisibility, MdPeople, MdLock,
    MdMenu, MdClose,
} from 'react-icons/md';

const baseNavItems = [
    { href: '/overview',   label: 'Dashboard',  icon: MdDashboard },
    { href: '/categories', label: 'Categories', icon: MdCategory },
    { href: '/hubs',       label: 'Hubs',       icon: MdHub },
    { href: '/customers',  label: 'Customers',  icon: MdPeople },
    { href: '/settings',   label: 'Settings',   icon: MdSettings },
];

interface SidebarProps {
    adminName: string;
    adminRole?: string;
    isGuest?: boolean;
}

export default function Sidebar({ adminName, adminRole, isGuest = false }: SidebarProps) {
    const pathname = usePathname();
    const router   = useRouter();
    const [open, setOpen] = useState(false);

    const navItems = [
        ...baseNavItems,
        ...(adminRole === 'SUPER_ADMIN' ? [{ href: '/reset-password', label: 'Reset Password', icon: MdLock }] : []),
    ];

    const handleLogout = async () => {
        if (isGuest) {
            await fetch('/api/auth/guest-logout', { method: 'POST' });
        } else {
            await logoutApi();
        }
        router.push('/login');
    };

    const NavContent = ({ onNav }: { onNav?: () => void }) => (
        <>
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 py-6">
                <Image src="/logo.png" alt="Logo" width={110} height={32} className="object-contain" priority />
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
                            onClick={onNav}
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
        </>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-60 shrink-0 bg-[#1a2e1a] flex-col h-screen sticky top-0">
                <NavContent />
            </aside>

            {/* Mobile top bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#1a2e1a] flex items-center justify-between px-4 z-40 border-b border-[#2d5a2d]">
                <Image src="/logo.png" alt="Logo" width={90} height={26} className="object-contain" priority />
                <button
                    onClick={() => setOpen(v => !v)}
                    className="text-white p-2 rounded-xl hover:bg-[#2d5a2d] transition-colors"
                    aria-label="Toggle menu"
                >
                    {open ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
                </button>
            </div>

            {/* Mobile overlay */}
            {open && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <aside className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-[#1a2e1a] flex flex-col z-50 transition-transform duration-250 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <NavContent onNav={() => setOpen(false)} />
            </aside>
        </>
    );
}
