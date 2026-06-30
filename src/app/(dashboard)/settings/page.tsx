'use client';

import { useEffect, useState } from 'react';
import {
    getSettingsRolesApi, createSettingsRoleApi, deleteSettingsRoleApi,
    getSettingsUsersApi, createSettingsUserApi, deleteSettingsUserApi, updateSettingsUserRoleApi,
} from '@/lib/api';
import { MdAdd, MdDelete, MdCheck, MdRemove, MdPerson, MdShield } from 'react-icons/md';

const ALL_PERMISSIONS = [
    '*:*',
    'categories:create', 'categories:update', 'categories:delete', 'categories:read',
    'hub:create', 'hub:read', 'hub:delete',
    'roles:create', 'roles:read', 'roles:delete',
    'users:read', 'users:delete',
    'orders:read',
];

interface Role { id: string; name: string; permissions: string[]; }
interface AdminUser { id: string; name: string; email: string; phone: string; role: string; permissions: string[]; }

type Tab = 'Roles' | 'Users' | 'Permission Matrix';
const TABS: Tab[] = ['Roles', 'Users', 'Permission Matrix'];

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-[#1a2e1a] outline-none focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80] transition-colors';
const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block';

export default function SettingsPage() {
    const [myPerms, setMyPerms] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/me')
            .then(r => r.ok ? r.json() : null)
            .then(json => { if (json?.data?.permissions) setMyPerms(json.data.permissions); })
            .catch(() => {});
    }, []);

    const can = (p: string) => myPerms.includes('*:*') || myPerms.includes(p);

    const [tab, setTab]         = useState<Tab>('Roles');
    const [roles, setRoles]     = useState<Role[]>([]);
    const [users, setUsers]     = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [error, setError]     = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [showRoleForm, setShowRoleForm]   = useState(false);
    const [roleName, setRoleName]           = useState('');
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

    const [showUserForm, setShowUserForm] = useState(false);
    const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', password: '', role_name: '' });

    const notify = (msg: string, isErr = false) => {
        if (isErr) { setError(msg); setSuccess(''); }
        else { setSuccess(msg); setError(''); }
        setTimeout(() => { setSuccess(''); setError(''); }, 4000);
    };

    const load = async () => {
        setLoading(true);
        try {
            const [r, u] = await Promise.all([getSettingsRolesApi(), getSettingsUsersApi()]);
            setRoles(r.data ?? []);
            setUsers(u.data ?? []);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const togglePerm = (p: string) =>
        setSelectedPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim()) { notify('Role name is required', true); return; }
        if (selectedPerms.length === 0) { notify('Select at least one permission', true); return; }
        setSubmitting(true);
        try {
            await createSettingsRoleApi({ name: roleName.trim(), permissions: selectedPerms });
            notify(`Role "${roleName}" created`);
            setRoleName(''); setSelectedPerms([]); setShowRoleForm(false);
            await load();
        } catch (err: any) { notify(err.error || 'Failed to create role', true); }
        finally { setSubmitting(false); }
    };

    const handleDeleteRole = async (roleId: string, name: string) => {
        if (!confirm(`Delete role "${name}"?`)) return;
        try {
            await deleteSettingsRoleApi(roleId);
            notify(`Role "${name}" deleted`);
            await load();
        } catch (err: any) { notify(err.error || 'Failed to delete role', true); }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const { name, email, phone, password, role_name } = userForm;
        if (!name || !email || !phone || !password || !role_name) { notify('All fields are required', true); return; }
        setSubmitting(true);
        try {
            await createSettingsUserApi(userForm);
            notify(`Admin "${name}" created`);
            setUserForm({ name: '', email: '', phone: '', password: '', role_name: '' });
            setShowUserForm(false);
            await load();
        } catch (err: any) { notify(err.error || 'Failed to create admin', true); }
        finally { setSubmitting(false); }
    };

    const handleDeleteUser = async (adminId: string, name: string) => {
        if (!confirm(`Delete admin "${name}"?`)) return;
        try {
            await deleteSettingsUserApi(adminId);
            notify(`Admin "${name}" deleted`);
            await load();
        } catch (err: any) { notify(err.error || 'Failed to delete admin', true); }
    };

    const handleRoleChange = async (adminId: string, role_name: string) => {
        try {
            await updateSettingsUserRoleApi(adminId, role_name);
            notify('Role updated');
            await load();
        } catch (err: any) { notify(err.error || 'Failed to update role', true); }
    };

    const uf = (k: string, v: string) => setUserForm(f => ({ ...f, [k]: v }));

    return (
        <div className="min-h-screen bg-[#f4f6f4]">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#1a2e1a]">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage roles, admin users and permissions</p>
            </div>

            {/* Feedback */}
            {success && (
                <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-sm flex items-center gap-2">
                    <MdCheck className="text-[#166534] shrink-0" />{success}
                </div>
            )}
            {error && (
                <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 mb-6">
                {TABS.map(t => (
                    <button
                        key={t}
                        onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                        className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                            tab === t
                                ? 'border-[#166534] text-[#166534]'
                                : 'border-transparent text-gray-500 hover:text-[#1a2e1a]'
                        }`}
                    >{t}</button>
                ))}
            </div>

            {/* ── ROLES TAB ─────────────────────────────────── */}
            {tab === 'Roles' && (
                <div className="flex flex-col gap-4">
                    {can('roles:create') && (
                        <div className="flex justify-end">
                            <button
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold transition-colors"
                                onClick={() => { setShowRoleForm(v => !v); setError(''); }}
                            >
                                <MdAdd />{showRoleForm ? 'Cancel' : 'New Role'}
                            </button>
                        </div>
                    )}

                    {showRoleForm && can('roles:create') && (
                        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-6">
                            <p className="text-sm font-bold text-[#14532d] mb-4">New Role</p>
                            <form onSubmit={handleCreateRole} className="flex flex-col gap-4">
                                <div>
                                    <label className={labelCls}>Role Name *</label>
                                    <input value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="e.g. CONTENT_MANAGER" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Permissions *</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                                        {ALL_PERMISSIONS.map(p => (
                                            <label key={p} className="flex items-center gap-2 text-sm text-[#1a2e1a] cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPerms.includes(p)}
                                                    onChange={() => togglePerm(p)}
                                                    className="accent-[#166534] w-4 h-4 rounded"
                                                />
                                                {p}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" disabled={submitting} className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                                        <MdAdd />{submitting ? 'Creating...' : 'Create Role'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />)}
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                            No roles found.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {roles.map(role => (
                                <div key={role.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-[#dcfce7] flex items-center justify-center">
                                                <MdShield className="text-[#166534] text-sm" />
                                            </div>
                                            <span className="text-sm font-bold text-[#1a2e1a]">{role.name}</span>
                                        </div>
                                        {can('roles:delete') && (
                                            <button
                                                onClick={() => handleDeleteRole(role.id, role.name)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                                            >
                                                <MdDelete className="text-sm" />Delete
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {role.permissions.map(p => (
                                            <span key={p} className="text-xs px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] font-medium">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── USERS TAB ─────────────────────────────────── */}
            {tab === 'Users' && (
                <div className="flex flex-col gap-4">
                    {can('roles:create') && (
                        <div className="flex justify-end">
                            <button
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold transition-colors"
                                onClick={() => { setShowUserForm(v => !v); setError(''); }}
                            >
                                <MdAdd />{showUserForm ? 'Cancel' : 'New Admin'}
                            </button>
                        </div>
                    )}

                    {showUserForm && can('roles:create') && (
                        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-6">
                            <p className="text-sm font-bold text-[#14532d] mb-4">New Admin User</p>
                            <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(['name', 'email', 'phone', 'password'] as const).map(k => (
                                    <div key={k}>
                                        <label className={labelCls}>{k.charAt(0).toUpperCase() + k.slice(1)} *</label>
                                        <input
                                            type={k === 'password' ? 'password' : k === 'email' ? 'email' : 'text'}
                                            value={userForm[k]}
                                            onChange={e => uf(k, e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className={labelCls}>Role *</label>
                                    <select value={userForm.role_name} onChange={e => uf('role_name', e.target.value)} className={inputCls}>
                                        <option value="">— Select role —</option>
                                        {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div className="sm:col-span-2 flex justify-end">
                                    <button type="submit" disabled={submitting} className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                                        <MdAdd />{submitting ? 'Creating...' : 'Create Admin'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />)}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                            No admin users found.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {users.map(u => (
                                <div key={u.id} className="bg-white border border-gray-100 rounded-2xl px-5 py-3.5 flex flex-wrap items-center gap-4 shadow-sm">
                                    <div className="w-9 h-9 rounded-xl bg-[#dcfce7] flex items-center justify-center shrink-0">
                                        <MdPerson className="text-[#166534] text-lg" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#1a2e1a] truncate">{u.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{u.email} · {u.phone}</p>
                                    </div>
                                    {can('roles:create') ? (
                                        <select
                                            value={u.role}
                                            onChange={e => handleRoleChange(u.id, e.target.value)}
                                            className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-sm text-[#1a2e1a] outline-none focus:border-[#4ade80] transition-colors"
                                        >
                                            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                        </select>
                                    ) : (
                                        <span className="text-xs px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] font-medium">
                                            {u.role}
                                        </span>
                                    )}
                                    {can('users:delete') && (
                                        <button
                                            onClick={() => handleDeleteUser(u.id, u.name)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                                        >
                                            <MdDelete className="text-sm" />Delete
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── PERMISSION MATRIX TAB ─────────────────────── */}
            {tab === 'Permission Matrix' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                    {loading ? (
                        <div className="h-40 rounded-2xl bg-gray-100 animate-pulse m-4" />
                    ) : (
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr>
                                    <th className="text-left px-5 py-4 bg-[#f0fdf4] text-[#166534] font-bold border-b border-gray-100 sticky left-0 min-w-40">
                                        Role
                                    </th>
                                    {ALL_PERMISSIONS.map(p => (
                                        <th key={p} className="px-3 py-4 bg-[#f0fdf4] text-[#166534] font-medium border-b border-gray-100 whitespace-nowrap">
                                            {p}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map((role, i) => (
                                    <tr key={role.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#f9fef9]'} hover:bg-[#f0fdf4] transition-colors`}>
                                        <td className="px-5 py-3 font-bold text-[#1a2e1a] sticky left-0 bg-inherit border-r border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <MdShield className="text-[#166534] shrink-0" />
                                                {role.name}
                                            </div>
                                        </td>
                                        {ALL_PERMISSIONS.map(p => {
                                            const has = role.permissions.includes('*:*') || role.permissions.includes(p);
                                            return (
                                                <td key={p} className="px-3 py-3 text-center">
                                                    {has ? (
                                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#dcfce7]">
                                                            <MdCheck className="text-[#166534] text-xs" />
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                                                            <MdRemove className="text-gray-300 text-xs" />
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
