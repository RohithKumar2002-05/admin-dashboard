const BASE = process.env.NEXT_PUBLIC_API_BASE;

// ── Server-side fetch (token passed explicitly from cookies()) ──
export const serverFetch = async (url: string, token: string) => {
    const res = await fetch(`${BASE}${url}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
};

// Auth — these call the Next.js route handlers, not the backend directly
export const loginApi = (data: object) =>
    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(async res => {
        const json = await res.json();
        if (!res.ok) throw json;
        return json;
    });

export const signupApi = (data: object) =>
    fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(async res => {
        const json = await res.json();
        if (!res.ok) throw json;
        return json;
    });

export const logoutApi = () =>
    fetch('/api/auth/logout', { method: 'POST' });

// Categories — proxied through Next.js route handler so httpOnly token is attached server-side
export const getCategoriesApi = () =>
    fetch('/api/categories').then(async res => {
        const json = await res.json();
        if (!res.ok) throw json;
        return json;
    });

export const createCategoryApi = (form: FormData) =>
    fetch('/api/categories', {
        method: 'POST',
        body: form,
    }).then(async res => {
        const json = await res.json();
        if (!res.ok) throw json;
        return json;
    });

export const createSubCategoryApi = (categoryId: string, form: FormData) =>
    fetch(`/api/categories/${categoryId}/subcategories`, {
        method: 'POST',
        body: form,
    }).then(async res => {
        const json = await res.json();
        if (!res.ok) throw json;
        return json;
    });

export const getHubsApi = () =>
    fetch('/api/hubs').then(async res => {
        const json = await res.json();
        if (!res.ok) throw json;
        return json;
    });

export const getHubByIdApi = (id: string) =>
    fetch(`/api/hubs/${id}`).then(async res => {
        const json = await res.json();
        if (!res.ok) throw json;
        return json;
    });

export const createHubApi = (data: object) =>
    fetch('/api/hubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(async res => {
        const json = await res.json();
        if (!res.ok) throw json;
        return json;
    });

export const getRevenueApi = () =>
    fetch('/api/revenue').then(async res => {
        const json = await res.json();
        if (!res.ok) throw json;
        return json;
    });

export const getMeApi = () =>
    fetch('/api/me').then(async res => {
        const json = await res.json();
        if (!res.ok) throw json;
        return json;
    });

// ── Settings ────────────────────────────────────────────────────────────────
const call = (url: string, init?: RequestInit) =>
    fetch(url, init).then(async res => {
        const json = await res.json();
        if (!res.ok) throw json;
        return json;
    });

// Roles
export const getSettingsRolesApi = () => call('/api/settings/roles');
export const createSettingsRoleApi = (data: { name: string; permissions: string[] }) =>
    call('/api/settings/roles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
export const deleteSettingsRoleApi = (roleId: string) =>
    call(`/api/settings/roles/${roleId}`, { method: 'DELETE' });

// Users
export const getSettingsUsersApi = () => call('/api/settings/users');
export const createSettingsUserApi = (data: object) =>
    call('/api/settings/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
export const deleteSettingsUserApi = (adminId: string) =>
    call(`/api/settings/users/${adminId}`, { method: 'DELETE' });
export const updateSettingsUserRoleApi = (adminId: string, role_name: string) =>
    call(`/api/settings/users/${adminId}/role`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role_name }) });

// Password Reset
export const adminResetRequestOtpApi = (email: string) =>
    call('/api/password-reset/request-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });

export const adminResetVerifyOtpApi = (email: string, otp: string) =>
    call('/api/password-reset/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp }) });

export const adminResetPasswordApi = (email: string, new_password: string) =>
    call('/api/password-reset/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, new_password }) });
