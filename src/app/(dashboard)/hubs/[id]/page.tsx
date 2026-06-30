import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MdArrowBack, MdCheckCircle, MdLocationOn, MdWarning } from 'react-icons/md';

interface HubAddress {
    id: string;
    full_address: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string | null;
    latitude: number;
    longitude: number;
    created_at: string;
    updated_at: string;
}

interface Hub {
    id: string;
    name: string;
    email: string;
    phone: string;
    hub_location: string;
    role: string;
    is_owner: boolean;
    address: HubAddress | null;
}

async function getHub(token: string, id: string): Promise<Hub | null> {
    try {
        const res = await fetch(`${process.env.API_BASE}/hub-admin/hubs/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data ?? null;
    } catch {
        return null;
    }
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-[#4a7a4a] uppercase tracking-wide">{label}</span>
            <span className="text-sm text-[#1a2e1a]">{value || '—'}</span>
        </div>
    );
}

export default async function HubDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value
        ?? process.env.GUEST_TOKEN
        ?? '';

    const hub = await getHub(token, id);
    if (!hub) notFound();

    const mapKey = process.env.NEXT_PUBLIC_MAP_API;
    const hasAddress = !!hub.address;
    const lat = hub.address?.latitude;
    const lng = hub.address?.longitude;

    const mapSrc = hasAddress && mapKey
        ? `https://www.google.com/maps/embed/v1/place?key=${mapKey}&q=${lat},${lng}&zoom=16`
        : null;

    return (
        <div className="max-w-4xl">
            {/* Back */}
            <Link
                href="/hubs"
                className="inline-flex items-center gap-1.5 text-sm text-[#166534] hover:underline transition-colors mb-6"
            >
                <MdArrowBack className="text-base" /> Back to Hubs
            </Link>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#dcfce7] flex items-center justify-center text-[#166534] font-bold text-xl shrink-0">
                    {hub.name[0]?.toUpperCase()}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-[#1a2e1a]">{hub.name}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{hub.hub_location || 'Hub Owner'}</p>
                </div>
                <div className="ml-auto">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                        hasAddress
                            ? 'bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]'
                            : 'bg-gray-100 text-gray-400'
                    }`}>
                        {hasAddress
                            ? <><MdCheckCircle />Address set</>
                            : <><MdWarning />No address</>}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hub Info Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                    <p className="text-xs font-bold text-[#4a7a4a] uppercase tracking-widest">Hub Info</p>
                    <InfoRow label="Owner Name" value={hub.name} />
                    <InfoRow label="Email" value={hub.email} />
                    <InfoRow label="Phone" value={hub.phone} />
                    <InfoRow label="Hub Location" value={hub.hub_location} />
                    <InfoRow label="Role" value={hub.role} />
                </div>

                {/* Address Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                    <p className="text-xs font-bold text-[#4a7a4a] uppercase tracking-widest">Address</p>
                    {hasAddress ? (
                        <>
                            <InfoRow label="Full Address" value={hub.address!.full_address} />
                            <div className="grid grid-cols-2 gap-4">
                                <InfoRow label="City" value={hub.address!.city} />
                                <InfoRow label="State" value={hub.address!.state} />
                                <InfoRow label="Pincode" value={hub.address!.pincode} />
                                {hub.address!.landmark && (
                                    <InfoRow label="Landmark" value={hub.address!.landmark} />
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoRow label="Latitude" value={String(hub.address!.latitude)} />
                                <InfoRow label="Longitude" value={String(hub.address!.longitude)} />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                            No address set for this hub.
                        </div>
                    )}
                </div>
            </div>

            {/* Map */}
            <div className="mt-6 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-[#4a7a4a] uppercase tracking-widest">
                        <MdLocationOn className="inline text-[#166534] mr-1 text-base" />
                        Location on Map
                    </p>
                    {hasAddress && (
                        <a
                            href={`https://www.google.com/maps?q=${lat},${lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[#166534] hover:underline"
                        >
                            Open in Google Maps →
                        </a>
                    )}
                </div>

                {mapSrc ? (
                    <iframe
                        src={mapSrc}
                        width="100%"
                        height="400"
                        style={{ border: 0, display: 'block' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Map for ${hub.name}`}
                    />
                ) : (
                    <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                        {!hasAddress ? 'Address not set — no map to display.' : 'Map API key not configured.'}
                    </div>
                )}
            </div>
        </div>
    );
}
