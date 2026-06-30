'use client';

import { useEffect, useRef, useState } from 'react';
import { getCategoriesApi, createCategoryApi, createSubCategoryApi } from '@/lib/api';
import { MdExpandMore, MdExpandLess, MdAdd } from 'react-icons/md';

interface SubCategory {
    id: string;
    name: string;
    description: string | null;
    image_path: string | null;
    category_id: string;
}

interface Category {
    id: string;
    name: string;
    description: string | null;
    image_path: string | null;
    sub_categories: SubCategory[];
}

type FormMode = 'category' | 'subcategory' | null;

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<FormMode>(null);
    const [submitting, setSubmitting] = useState(false);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const [catForm, setCatForm] = useState({ name: '', description: '' });
    const [subForm, setSubForm] = useState({ name: '', description: '', category_id: '' });

    const load = async () => {
        try {
            const res = await getCategoriesApi();
            setCategories(res.data ?? []);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openMode = (m: FormMode, prefillCategoryId = '') => {
        setMode(m);
        setError(''); setSuccess('');
        setCatForm({ name: '', description: '' });
        setSubForm({ name: '', description: '', category_id: prefillCategoryId });
        if (fileRef.current) fileRef.current.value = '';
    };

    const closeForm = () => { setMode(null); setError(''); };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!catForm.name.trim()) { setError('Name is required'); return; }
        const fd = new FormData();
        fd.append('name', catForm.name.trim());
        if (catForm.description) fd.append('description', catForm.description);
        if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0]);
        setSubmitting(true);
        try {
            await createCategoryApi(fd);
            setSuccess(`Category "${catForm.name}" created`);
            closeForm();
            await load();
        } catch (err: unknown) {
            setError((err as { error?: string })?.error ?? 'Failed to create category');
        } finally { setSubmitting(false); }
    };

    const handleSubCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!subForm.name.trim()) { setError('Name is required'); return; }
        if (!subForm.category_id) { setError('Please select a category'); return; }
        const fd = new FormData();
        fd.append('name', subForm.name.trim());
        if (subForm.description) fd.append('description', subForm.description);
        if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0]);
        setSubmitting(true);
        try {
            await createSubCategoryApi(subForm.category_id, fd);
            setSuccess(`Subcategory "${subForm.name}" created`);
            closeForm();
            await load();
        } catch (err: unknown) {
            setError((err as { error?: string })?.error ?? 'Failed to create subcategory');
        } finally { setSubmitting(false); }
    };

    const fieldCls = 'flex flex-col gap-1.5';
    const labelCls = 'text-xs font-semibold text-zinc-600 uppercase tracking-wide';
    const inputCls = 'px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm outline-none focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80] transition-colors text-zinc-900';

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a2e1a]">Categories</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage global categories and subcategories</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => mode === 'category' ? closeForm() : openMode('category')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold transition-colors"
                    >
                        <MdAdd className="text-base" />
                        {mode === 'category' ? 'Cancel' : 'Category'}
                    </button>
                    <button
                        onClick={() => mode === 'subcategory' ? closeForm() : openMode('subcategory')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] text-[#166534] text-sm font-semibold transition-colors hover:opacity-80"
                    >
                        <MdAdd className="text-base" />
                        {mode === 'subcategory' ? 'Cancel' : 'Subcategory'}
                    </button>
                </div>
            </div>

            {success && (
                <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-sm">
                    {success}
                </div>
            )}

            {/* Category form */}
            {mode === 'category' && (
                <div className="mb-6 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-6">
                    <p className="text-sm font-bold text-[#14532d] mb-4">New Category</p>
                    {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
                    <form onSubmit={handleCategorySubmit} className="grid grid-cols-2 gap-4">
                        <div className={fieldCls}>
                            <label className={labelCls}>Name *</label>
                            <input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Grocery" className={inputCls} />
                        </div>
                        <div className={fieldCls}>
                            <label className={labelCls}>Description</label>
                            <input value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" className={inputCls} />
                        </div>
                        <div className="col-span-2 flex flex-col gap-1.5">
                            <label className={labelCls}>Image</label>
                            <input type="file" accept="image/*" ref={fileRef} className="text-sm text-zinc-500 cursor-pointer" />
                        </div>
                        <div className="col-span-2 flex justify-end">
                            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-[#166634] hover:bg-[#14532d] disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                                {submitting ? 'Creating...' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Subcategory form */}
            {mode === 'subcategory' && (
                <div className="mb-6 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-6">
                    <p className="text-sm font-bold text-[#14532d] mb-4">New Subcategory</p>
                    {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
                    <form onSubmit={handleSubCategorySubmit} className="grid grid-cols-2 gap-4">
                        <div className={fieldCls}>
                            <label className={labelCls}>Category *</label>
                            <select value={subForm.category_id} onChange={e => setSubForm(f => ({ ...f, category_id: e.target.value }))} className={inputCls}>
                                <option value="">— Select category —</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className={fieldCls}>
                            <label className={labelCls}>Name *</label>
                            <input value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Dairy" className={inputCls} />
                        </div>
                        <div className="col-span-2 flex flex-col gap-1.5">
                            <label className={labelCls}>Description</label>
                            <input value={subForm.description} onChange={e => setSubForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" className={inputCls} />
                        </div>
                        <div className="col-span-2 flex flex-col gap-1.5">
                            <label className={labelCls}>Image</label>
                            <input type="file" accept="image/*" ref={fileRef} className="text-sm text-zinc-500 cursor-pointer" />
                        </div>
                        <div className="col-span-2 flex justify-end">
                            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-[#166634] hover:bg-[#14532d] disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                                {submitting ? 'Creating...' : 'Create Subcategory'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-zinc-100 animate-pulse" />)}
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-sm">
                    <p>No categories yet. Click <strong className="text-[#166634]">+ Category</strong> to create one.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                            <div
                                onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f0fdf4] transition-colors cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-3">
                                    {cat.image_path ? (
                                        <img src={cat.image_path} alt={cat.name} className="w-9 h-9 rounded-xl object-cover border border-zinc-100 shrink-0" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-xl bg-[#dcfce7] flex items-center justify-center text-[#166634] font-bold text-sm shrink-0">
                                            {cat.name[0]}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold text-[#1a2e1a]">{cat.name}</p>
                                        {cat.description && <p className="text-xs text-gray-400">{cat.description}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={e => { e.stopPropagation(); openMode('subcategory', cat.id); }}
                                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-[#bbf7d0] text-[#166634] hover:bg-[#f0fdf4] transition-colors"
                                    >
                                        <MdAdd /> Sub
                                    </button>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                                        {cat.sub_categories?.length ?? 0} subs
                                    </span>
                                    {expanded === cat.id
                                        ? <MdExpandLess className="text-gray-400 text-lg" />
                                        : <MdExpandMore className="text-gray-400 text-lg" />}
                                </div>
                            </div>

                            {expanded === cat.id && (
                                <div className="border-t border-gray-100 bg-[#f9fef9] px-5 py-3 flex flex-col gap-2">
                                    {!cat.sub_categories?.length ? (
                                        <p className="text-xs text-gray-400 py-1">No subcategories yet. Click <strong>+ Sub</strong> to add one.</p>
                                    ) : (
                                        cat.sub_categories.map(sub => (
                                            <div key={sub.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-2.5">
                                                {sub.image_path ? (
                                                    <img src={sub.image_path} alt={sub.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-lg bg-[#dcfce7] flex items-center justify-center text-[#166634] font-bold text-xs shrink-0">
                                                        {sub.name[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="text-sm font-medium text-zinc-700">{sub.name}</span>
                                                    {sub.description && <p className="text-xs text-gray-400">{sub.description}</p>}
                                                </div>
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
