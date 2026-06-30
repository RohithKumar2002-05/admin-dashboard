'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signupApi } from '@/lib/api';
import { MdDashboard, MdVisibility } from 'react-icons/md';

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm]   = useState({ name: '', email: '', phone: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading]       = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);

    const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.email || !form.phone || !form.password) {
            setError('All fields are required'); return;
        }
        setLoading(true);
        try {
            await signupApi(form);
            router.push('/login?registered=1');
        } catch (err: unknown) {
            setError((err as { error?: string })?.error ?? 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = async () => {
        setGuestLoading(true);
        try {
            await fetch('/api/auth/guest', { method: 'POST' });
            router.push('/overview');
        } finally {
            setGuestLoading(false);
        }
    };

    const inputCls = 'px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#1a2e1a] outline-none focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80] transition-colors';
    const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide';

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#f4f6f4]">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#166534] text-white text-xl mb-4">
                        <MdDashboard className="text-[#4ade80] text-2xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#1a2e1a]">Create Account</h1>
                    <p className="text-sm text-gray-500 mt-1">Set up your admin account</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col gap-5 shadow-sm">
                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {(['name', 'email', 'phone', 'password'] as const).map(field => (
                            <div key={field} className="flex flex-col gap-1.5">
                                <label className={labelCls}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                                <input
                                    type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                                    value={form[field]}
                                    onChange={e => set(field, e.target.value)}
                                    placeholder={field === 'phone' ? '+91 9876543210' : field === 'password' ? '••••••••' : ''}
                                    className={inputCls}
                                />
                            </div>
                        ))}
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-1 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <button
                        onClick={handleGuest}
                        disabled={guestLoading}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        <MdVisibility className="text-amber-600" />
                        {guestLoading ? 'Entering...' : 'Continue as Guest'}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                        Guest access is read-only. No changes can be made.
                    </p>

                    <p className="text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#166534] font-semibold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
