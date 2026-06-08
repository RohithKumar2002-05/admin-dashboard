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
