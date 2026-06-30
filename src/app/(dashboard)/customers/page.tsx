import { cookies } from 'next/headers';
import { MdPerson, MdEmojiEvents, MdWorkspacePremium, MdMilitaryTech } from 'react-icons/md';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    order_count: number;
    customer_since: string;
}

async function getCustomers(token: string): Promise<Customer[]> {
    try {
        const res = await fetch(`${process.env.API_BASE}/admin/customers`, {
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

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function getRankBadge(index: number) {
    if (index === 0) return { Icon: MdEmojiEvents,      cls: 'bg-amber-100 text-amber-600 border border-amber-200' };
    if (index === 1) return { Icon: MdWorkspacePremium, cls: 'bg-zinc-100 text-zinc-500 border border-zinc-200' };
    if (index === 2) return { Icon: MdMilitaryTech,     cls: 'bg-orange-100 text-orange-600 border border-orange-200' };
    return null;
}

export default async function CustomersPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value
        ?? process.env.GUEST_TOKEN
        ?? '';

    const customers = await getCustomers(token);

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900">Customers</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    {customers.length} customer{customers.length !== 1 ? 's' : ''} · sorted by highest orders
                </p>
            </div>

            {customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-300 rounded-2xl text-zinc-400 gap-3">
                    <MdPerson className="text-5xl text-zinc-300" />
                    <p className="text-sm">No customers have placed an order yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#f0f7f0] border-b border-zinc-200">
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4a7a4a] uppercase tracking-wider w-10">
                                    #
                                </th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4a7a4a] uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4a7a4a] uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4a7a4a] uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="text-center px-5 py-3.5 text-xs font-semibold text-[#4a7a4a] uppercase tracking-wider">
                                    Orders
                                </th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4a7a4a] uppercase tracking-wider">
                                    Customer Since
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer, i) => {
                                const rank = getRankBadge(i);
                                return (
                                    <tr
                                        key={customer.id}
                                        className="border-b border-zinc-100 last:border-0 hover:bg-[#f7fbf7] transition-colors"
                                    >
                                        {/* Rank */}
                                        <td className="px-5 py-4 text-center">
                                            {rank ? (
                                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${rank.cls}`}>
                                                    <rank.Icon className="text-base" />
                                                </span>
                                            ) : (
                                                <span className="text-xs text-zinc-400 font-medium">{i + 1}</span>
                                            )}
                                        </td>

                                        {/* Customer name + avatar */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0">
                                                    <span className="text-xs font-bold text-[#166534]">
                                                        {customer.name !== '—' ? customer.name[0].toUpperCase() : '?'}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-zinc-900">{customer.name}</span>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-5 py-4 text-zinc-500">
                                            {customer.email}
                                        </td>

                                        {/* Phone */}
                                        <td className="px-5 py-4 text-zinc-500">
                                            {customer.phone}
                                        </td>

                                        {/* Order count badge */}
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]">
                                                {customer.order_count} order{customer.order_count !== 1 ? 's' : ''}
                                            </span>
                                        </td>

                                        {/* Customer since */}
                                        <td className="px-5 py-4 text-zinc-500">
                                            {formatDate(customer.customer_since)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
