'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signupApi } from '@/lib/api';

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.email || !form.phone || !form.password) {
            setError('All fields are required');
            return;
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

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600 text-white text-xl font-bold mb-4">A</div>
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Create Account</h1>
                    <p className="text-sm text-zinc-500 mt-1">Set up your admin account</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col gap-5 shadow-sm">
                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}
                    {(['name', 'email', 'phone', 'password'] as const).map(field => (
                        <div key={field} className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                {field.charAt(0).toUpperCase() + field.slice(1)}
                            </label>
                            <input
                                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                                value={form[field]}
                                onChange={e => set(field, e.target.value)}
                                placeholder={field === 'phone' ? '+91 9876543210' : field === 'password' ? '••••••••' : ''}
                                className="px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>
                    ))}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                    <p className="text-center text-sm text-zinc-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-violet-600 font-medium hover:underline">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
