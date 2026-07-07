'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminResetPasswordApi } from '@/lib/api';
import { MdDashboard } from 'react-icons/md';

export default function ResetPasswordNewPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm]   = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [email, setEmail]       = useState('');

    useEffect(() => {
        const storedEmail    = sessionStorage.getItem('reset_email');
        const storedVerified = sessionStorage.getItem('reset_otp_verified');
        if (!storedEmail || !storedVerified) { router.replace('/reset-password'); return; }
        setEmail(storedEmail);
    }, []);

    const inputCls = 'px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#1a2e1a] outline-none focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80] transition-colors';
    const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (password !== confirm) { setError('Passwords do not match'); return; }
        setLoading(true);
        try {
            await adminResetPasswordApi(email, password);
            sessionStorage.removeItem('reset_email');
            sessionStorage.removeItem('reset_otp_verified');
            router.push('/login');
        } catch (err: unknown) {
            setError((err as { error?: string })?.error ?? 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#f4f6f4]">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#166534] text-white text-xl mb-4">
                        <MdDashboard className="text-[#4ade80] text-2xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#1a2e1a]">New Password</h1>
                    <p className="text-sm text-gray-500 mt-1">Set a new password for your account</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col gap-5 shadow-sm">
                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
                    )}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>New Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoFocus className={inputCls} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Confirm Password</label>
                            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" className={inputCls} />
                        </div>
                        <button type="submit" disabled={loading} className="mt-1 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500">
                        <Link href="/reset-password/otp" className="text-[#166534] font-semibold hover:underline">← Back</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
