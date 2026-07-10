import { cookies } from 'next/headers';
import Link from 'next/link';
import { MdLocationOn, MdPhone, MdCheckCircle, MdStore, MdArrowForward, MdAdd } from 'react-icons/md';

interface HubAddress {
    id: string;
    full_address: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
}

interface Hub {
    id: string;
    name: string;
    email: string;
    phone: string;
    hub_location: string;
    role: string;
    is_owner: boolean;
    address?: HubAddress | null;
}

async function getHubs(token: string): Promise<Hub[]> {
    try {
        const res = await fetch(`${process.env.API_BASE}/hub-admin/hubs`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data ?? [];
    } catch {
        return [];
    }
}

export default async function HubsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value
        ?? process.env.GUEST_TOKEN
        ?? '';
    const hubs = await getHubs(token);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a2e1a]">Hubs</h1>
                    <p className="text-sm text-gray-500 mt-1">{hubs.length} registered hub{hubs.length !== 1 ? 's' : ''}</p>
                </div>
                <Link
                    href="/hubs/new"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold transition-colors"
                >
                    <MdAdd className="text-base" /> New Hub
                </Link>
            </div>

            {hubs.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                    No hubs registered yet.
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#f0fdf4] border-b border-gray-100">
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4a7a4a] uppercase tracking-wider">Hub</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4a7a4a] uppercase tracking-wider">Email</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4a7a4a] uppercase tracking-wider">Phone</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4a7a4a] uppercase tracking-wider">Location</th>
                                <th className="text-center px-5 py-3.5 text-xs font-semibold text-[#4a7a4a] uppercase tracking-wider">Address</th>
                                <th className="px-5 py-3.5" />
                            </tr>
                        </thead>
                        <tbody>
                            {hubs.map((hub) => (
                                <tr
                                    key={hub.id}
                                    className="border-b border-gray-100 last:border-0 hover:bg-[#f7fbf7] transition-colors"
                                >
                                    {/* Hub name + avatar */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-[#dcfce7] flex items-center justify-center shrink-0">
                                                {hub.name[0]?.toUpperCase()
                                                    ? <span className="text-[#166534] font-bold text-sm">{hub.name[0].toUpperCase()}</span>
                                                    : <MdStore className="text-[#166534]" />}
                                            </div>
                                            <span className="font-semibold text-[#1a2e1a]">{hub.name}</span>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className="px-5 py-4 text-gray-500">{hub.email}</td>

                                    {/* Phone */}
                                    <td className="px-5 py-4">
                                        <span className="flex items-center gap-1.5 text-gray-500">
                                            <MdPhone className="text-gray-400 shrink-0" />
                                            {hub.phone}
                                        </span>
                                    </td>

                                    {/* Location */}
                                    <td className="px-5 py-4">
                                        <span className="flex items-center gap-1.5 text-gray-500">
                                            <MdLocationOn className="text-gray-400 shrink-0" />
                                            {hub.hub_location || <span className="text-gray-300 italic">Not set</span>}
                                        </span>
                                    </td>

                                    {/* Address badge */}
                                    <td className="px-5 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                            hub.hub_location
                                                ? 'bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]'
                                                : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {hub.hub_location && <MdCheckCircle className="text-[#166534]" />}
                                            {hub.hub_location ? 'Address set' : 'No address'}
                                        </span>
                                    </td>

                                    {/* View details */}
                                    <td className="px-5 py-4">
                                        <Link
                                            href={`/hubs/${hub.id}`}
                                            className="flex items-center gap-1 text-xs font-semibold text-[#166534] hover:underline whitespace-nowrap"
                                        >
                                            View details <MdArrowForward className="text-sm" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
