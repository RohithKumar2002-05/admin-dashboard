'use client';

import { useEffect, useRef, useState } from 'react';
import { getCategoriesApi, createCategoryApi } from '@/lib/api';

interface Category {
    id: string;
    name: string;
    description: string | null;
    imagePath: string | null;
    parentId: string | null;
    subcategories: Category[];
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({ name: '', description: '', parentId: '' });

    const load = async () => {
        try {
            const res = await getCategoriesApi();
            setCategories(res.data ?? []);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const rootCategories = categories.filter(c => !c.parentId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!form.name.trim()) { setError('Name is required'); return; }

        const fd = new FormData();
        fd.append('name', form.name.trim());
        if (form.description) fd.append('description', form.description);
        if (form.parentId) fd.append('parentId', form.parentId);
        if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0]);

        setSubmitting(true);
        try {
            await createCategoryApi(fd);
            setSuccess(`${form.parentId ? 'Subcategory' : 'Category'} "${form.name}" created successfully`);
            setForm({ name: '', description: '', parentId: '' });
            if (fileRef.current) fileRef.current.value = '';
            setShowForm(false);
            await load();
        } catch (err: unknown) {
            setError((err as { error?: string })?.error ?? 'Failed to create');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Categories</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage global categories and subcategories</p>
                </div>
                <button
                    onClick={() => { setShowForm(v => !v); setError(''); setSuccess(''); }}
                    className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors whitespace-nowrap"
                >
                    {showForm ? 'Cancel' : '+ New Category'}
                </button>
            </div>

            {/* Success */}
            {success && (
                <div className="mb-4 px-4 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-sm">
                    {success}
                </div>
            )}

            {/* Create form */}
            {showForm && (
                <div className="mb-6 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900 rounded-2xl p-6">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                        {form.parentId ? 'New Subcategory' : 'New Category'}
                    </p>
                    {error && (
                        <p className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Name *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Grocery"
                                className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                                Parent <span className="normal-case font-normal text-zinc-400">(leave empty for root)</span>
                            </label>
                            <select
                                value={form.parentId}
                                onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                                className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-violet-500 transition-colors"
                            >
                                <option value="">— Root category —</option>
                                {rootCategories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2 flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Description</label>
                            <input
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Optional description"
                                className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>
                        <div className="col-span-2 flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Image</label>
                            <input type="file" accept="image/*" ref={fileRef} className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer" />
                        </div>
                        <div className="col-span-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                            >
                                {submitting ? 'Creating...' : `Create ${form.parentId ? 'Subcategory' : 'Category'}`}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                    ))}
                </div>
            ) : rootCategories.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl text-zinc-400 text-sm">
                    <p>No categories yet.</p>
                    <p>Click <strong className="text-zinc-600 dark:text-zinc-300">+ New Category</strong> to create the first one.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {rootCategories.map(cat => (
                        <div key={cat.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                            {/* Category row */}
                            <button
                                onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                                className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    {cat.imagePath ? (
                                        <img src={cat.imagePath} alt={cat.name} className="w-9 h-9 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-700 dark:text-violet-400 font-bold text-sm shrink-0">
                                            {cat.name[0]}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{cat.name}</p>
                                        {cat.description && <p className="text-xs text-zinc-400">{cat.description}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                                        {cat.subcategories?.length ?? 0} subcategories
                                    </span>
                                    <span className="text-xs text-zinc-400">{expanded === cat.id ? '▲' : '▼'}</span>
                                </div>
                            </button>

                            {/* Subcategories */}
                            {expanded === cat.id && (
                                <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 px-5 py-3 flex flex-col gap-2">
                                    {!cat.subcategories?.length ? (
                                        <p className="text-xs text-zinc-400 py-1">No subcategories. Use the form above with this category as parent.</p>
                                    ) : (
                                        cat.subcategories.map(sub => (
                                            <div key={sub.id} className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5">
                                                {sub.imagePath ? (
                                                    <img src={sub.imagePath} alt={sub.name} className="w-7 h-7 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0" />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0">
                                                        {sub.name[0]}
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{sub.name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
