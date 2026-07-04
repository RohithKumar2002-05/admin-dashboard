'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createHubApi } from '@/lib/api';
import { MdArrowBack, MdLocationOn, MdMyLocation } from 'react-icons/md';

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#1a2e1a] outline-none focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80] transition-colors placeholder:text-gray-300';
const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block';

interface FormState {
    name: string;
    email: string;
    phone: string;
    password: string;
    hub_location: string;
    full_address: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
    latitude: string;
    longitude: string;
}

const EMPTY: FormState = {
    name: '', email: '', phone: '', password: '', hub_location: '',
    full_address: '', city: '', state: '', pincode: '', landmark: '',
    latitude: '', longitude: '',
};

export default function NewHubPage() {
    const router = useRouter();
    const [form, setForm] = useState<FormState>(EMPTY);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [locating, setLocating] = useState(false);

    const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

    const detectLocation = () => {
        if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            pos => {
                set('latitude', pos.coords.latitude.toFixed(7));
                set('longitude', pos.coords.longitude.toFixed(7));
                setLocating(false);
            },
            () => { setError('Could not detect location'); setLocating(false); }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const lat = parseFloat(form.latitude);
        const lng = parseFloat(form.longitude);
        if (isNaN(lat) || isNaN(lng)) { setError('Latitude and longitude must be valid numbers'); return; }

        setSubmitting(true);
        try {
            await createHubApi({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                password: form.password,
                hub_location: form.hub_location.trim(),
                full_address: form.full_address.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                pincode: form.pincode.trim(),
                ...(form.landmark.trim() && { landmark: form.landmark.trim() }),
                latitude: lat,
                longitude: lng,
            });
            router.push('/hubs');
        } catch (err: any) {
            setError(err?.error || err?.message || 'Failed to create hub');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <Link
                href="/hubs"
                className="inline-flex items-center gap-1.5 text-sm text-[#166534] hover:underline mb-6"
            >
                <MdArrowBack className="text-base" /> Back to Hubs
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#1a2e1a]">Create New Hub</h1>
                <p className="text-sm text-gray-500 mt-1">Set up a hub owner account and their physical location</p>
            </div>

            {error && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* Hub Owner Account */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-bold text-[#4a7a4a] uppercase tracking-widest mb-5">Hub Owner Account</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Name *</label>
                            <input
                                value={form.name}
                                onChange={e => set('name', e.target.value)}
                                placeholder="e.g. Ravi Kumar"
                                className={inputCls}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Email *</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => set('email', e.target.value)}
                                placeholder="hub@example.com"
                                className={inputCls}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Phone *</label>
                            <input
                                value={form.phone}
                                onChange={e => set('phone', e.target.value)}
                                placeholder="10-digit number"
                                className={inputCls}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Password *</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => set('password', e.target.value)}
                                placeholder="Min 6 characters"
                                className={inputCls}
                                required
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className={labelCls}>Hub Location Name *</label>
                            <input
                                value={form.hub_location}
                                onChange={e => set('hub_location', e.target.value)}
                                placeholder="e.g. Chennai - T.Nagar"
                                className={inputCls}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Hub Physical Address */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-bold text-[#4a7a4a] uppercase tracking-widest mb-5">
                        <MdLocationOn className="inline text-[#166534] mr-1 text-base" />
                        Hub Physical Address
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className={labelCls}>Full Address *</label>
                            <input
                                value={form.full_address}
                                onChange={e => set('full_address', e.target.value)}
                                placeholder="e.g. 12, Anna Salai, T.Nagar"
                                className={inputCls}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelCls}>City *</label>
                            <input
                                value={form.city}
                                onChange={e => set('city', e.target.value)}
                                placeholder="e.g. Chennai"
                                className={inputCls}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelCls}>State *</label>
                            <input
                                value={form.state}
                                onChange={e => set('state', e.target.value)}
                                placeholder="e.g. Tamil Nadu"
                                className={inputCls}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Pincode *</label>
                            <input
                                value={form.pincode}
                                onChange={e => set('pincode', e.target.value)}
                                placeholder="e.g. 600017"
                                className={inputCls}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Landmark</label>
                            <input
                                value={form.landmark}
                                onChange={e => set('landmark', e.target.value)}
                                placeholder="Optional"
                                className={inputCls}
                            />
                        </div>

                        {/* Coordinates */}
                        <div>
                            <label className={labelCls}>Latitude *</label>
                            <input
                                value={form.latitude}
                                onChange={e => set('latitude', e.target.value)}
                                placeholder="e.g. 13.0418"
                                className={inputCls}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Longitude *</label>
                            <input
                                value={form.longitude}
                                onChange={e => set('longitude', e.target.value)}
                                placeholder="e.g. 80.2341"
                                className={inputCls}
                                required
                            />
                        </div>

                        {/* Detect location button */}
                        <div className="sm:col-span-2">
                            <button
                                type="button"
                                onClick={detectLocation}
                                disabled={locating}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] text-[#166534] text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
                            >
                                <MdMyLocation className="text-base" />
                                {locating ? 'Detecting...' : 'Auto-detect my location'}
                            </button>
                            <p className="text-xs text-gray-400 mt-1.5">
                                Or enter coordinates manually. Use{' '}
                                <a
                                    href="https://www.google.com/maps"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#166534] underline"
                                >
                                    Google Maps
                                </a>{' '}
                                to find exact coordinates — right-click any location and copy the lat/lng.
                            </p>
                        </div>

                        {/* Map preview */}
                        {form.latitude && form.longitude && !isNaN(parseFloat(form.latitude)) && !isNaN(parseFloat(form.longitude)) && (
                            <div className="sm:col-span-2 rounded-xl overflow-hidden border border-gray-100 h-56">
                                <iframe
                                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_MAP_API ?? ''}&q=${form.latitude},${form.longitude}&zoom=15`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, display: 'block' }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Hub location preview"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        href="/hubs"
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                    >
                        {submitting ? 'Creating Hub...' : 'Create Hub'}
                    </button>
                </div>
            </form>
        </div>
    );
}
