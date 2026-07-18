import { useEffect, useState } from 'react';
import { fetchAllPayments } from '../../api/admin';
import { formatPaise } from '../../utils/money';
import { formatDate } from '../../utils/dates';
import { card, btnSecondary } from '../../utils/ui';

const TYPE_STYLES = {
    charge: 'bg-brand-100 text-brand-700',
    depositRefund: 'bg-blue-100 text-blue-800',
    penaltyDeduction: 'bg-amber-100 text-amber-800',
    lenderPayout: 'bg-gray-200 text-gray-700',
};

function TransactionsPage() {
    const [data, setData] = useState(null);

    async function load(page = 1) {
        setData(await fetchAllPayments(page));
    }

    useEffect(() => {
        load(1);
    }, []);

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
            <p className="mt-1 text-sm text-gray-500">
                Every money movement on the platform, newest first. {data && `${data.total} records.`}
            </p>

            {!data ? (
                <p className="mt-6 text-gray-500">Loading...</p>
            ) : (
                <>
                    <div className={`${card} mt-4 overflow-x-auto`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-100">
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium">Item</th>
                                    <th className="px-4 py-3 font-medium">Renter → Lender</th>
                                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.payments.map((p) => (
                                    <tr key={p._id} className="border-b border-gray-50 last:border-0">
                                        <td className="px-4 py-3 text-gray-500">{formatDate(p.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_STYLES[p.type] || 'bg-gray-200'}`}>
                                                {p.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-900">{p.bookingId?.itemId?.title || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {p.bookingId?.renterId?.name || '—'} → {p.bookingId?.lenderId?.name || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-900 font-medium">{formatPaise(p.amount)}</td>
                                        <td className="px-4 py-3 text-gray-500">{p.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {data.pages > 1 && (
                        <div className="mt-4 flex items-center gap-3 text-sm">
                            <button disabled={data.page <= 1} onClick={() => load(data.page - 1)} className={`${btnSecondary} disabled:opacity-40`}>←</button>
                            <span className="text-gray-600">Page {data.page} of {data.pages}</span>
                            <button disabled={data.page >= data.pages} onClick={() => load(data.page + 1)} className={`${btnSecondary} disabled:opacity-40`}>→</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default TransactionsPage;