import { useEffect, useState } from 'react';
import { fetchAdminItems, updateItemStatus } from '../../api/admin';
import { formatPaise } from '../../utils/money';
import { card, input, btnSecondary, btnDanger } from '../../utils/ui';
import Spinner from '../../components/Spinner';

function ModerateListingsPage() {
    const [data, setData] = useState(null);
    const [status, setStatus] = useState('');

    async function load(page = 1, which = status) {
        setData(await fetchAdminItems({ status: which || undefined, page }));
    }

    useEffect(() => {
        load(1);
    }, []);

    async function toggleSuspend(item) {
        const next = item.status === 'suspended' ? 'active' : 'suspended';
        const updated = await updateItemStatus(item._id, next);
        setData({ ...data, items: data.items.map((i) => (i._id === item._id ? { ...i, status: updated.status } : i)) });
    }

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-semibold text-gray-900">Listings</h1>
            <p className="mt-1 text-sm text-gray-500">Suspend listings that break the rules.</p>

            <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); load(1, e.target.value); }}
                className={`${input} mt-4`}
            >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="unlisted">Unlisted</option>
                <option value="suspended">Suspended</option>
            </select>

            {!data ? (
                <Spinner label="Loading listings" />
            ) : (
                <div className={`${card} mt-4 overflow-x-auto`}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-100">
                                <th className="px-4 py-3 font-medium">Item</th>
                                <th className="px-4 py-3 font-medium">Lender</th>
                                <th className="px-4 py-3 font-medium text-right">Rate/day</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((i) => (
                                <tr key={i._id} className="border-b border-gray-50 last:border-0">
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-2">
                                            {i.photos?.[0] && <img src={i.photos[0]} alt="" className="h-8 w-8 rounded object-cover" />}
                                            <span className="text-gray-900">{i.title}</span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {i.lenderId?.name} <span className="text-gray-400">(trust {i.lenderId?.trustScore})</span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-700">{formatPaise(i.ratePerDay)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${i.status === 'active' ? 'bg-green-100 text-green-800'
                                                : i.status === 'suspended' ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {i.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {i.status !== 'unlisted' && (
                                            <button onClick={() => toggleSuspend(i)} className={`${i.status === 'suspended' ? btnSecondary : btnDanger} text-xs`}>
                                                {i.status === 'suspended' ? 'Restore' : 'Suspend'}
                                            </button>
                                        )}
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

export default ModerateListingsPage;