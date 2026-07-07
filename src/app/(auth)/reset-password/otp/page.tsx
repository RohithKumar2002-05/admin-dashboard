'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminResetVerifyOtpApi } from '@/lib/api';
import { MdDashboard } from 'react-icons/md';

export default function ResetPasswordOtpPage() {
    const router = useRouter();
    const [otp, setOtp]         = useState('');
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail]     = useState('');

    useEffect(() => {
        const stored = sessionStorage.getItem('reset_email');
        if (!stored) { router.replace('/reset-password'); return; }
        setEmail(stored);
    }, []);

    const inputCls = 'px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#1a2e1a] outline-none focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80] transition-colors text-center tracking-[0.3em] text-lg';
    const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!otp || otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
        setLoading(true);
        try {
            await adminResetVerifyOtpApi(email, otp);
            sessionStorage.setItem('reset_otp_verified', '1');
            router.push('/reset-password/new');
        } catch (err: unknown) {
            setError((err as { error?: string })?.error ?? 'Invalid or expired OTP');
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
                    <h1 className="text-2xl font-bold text-[#1a2e1a]">Enter OTP</h1>
                    <p className="text-sm text-gray-500 mt-1">A 6-digit code was sent to <strong>{email}</strong></p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col gap-5 shadow-sm">
                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
                    )}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>OTP Code</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="123456"
                                autoFocus
                                className={inputCls}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="mt-1 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500">
                        <Link href="/reset-password" className="text-[#166534] font-semibold hover:underline">← Back</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
