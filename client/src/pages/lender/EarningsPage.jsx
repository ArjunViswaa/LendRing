import { useEffect, useState } from 'react';
import { fetchEarnings } from '../../api/payments';
import { formatPaise } from '../../utils/money';
import { formatDateRange } from '../../utils/dates';
import { card } from '../../utils/ui';
import Spinner from '../../components/Spinner';

function StatCard({ label, value, hint }) {
    return (
        <div className={`${card} p-5 flex-1`}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
            {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
        </div>
    );
}

function EarningsPage() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEarnings()
            .then(setData)
            .catch(() => setError('Could not load earnings'));
    }, []);

    if (error) return <p className="text-red-600">{error}</p>;
    if (!data) return <Spinner label="Loading earnings" />;

    const { summary, payments } = data;

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-semibold text-gray-900">Earnings</h1>
            <p className="mt-1 text-sm text-gray-500">
                Your share of rent from paid bookings. Deposits are held by the platform and refunded to
                renters after safe returns.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <StatCard
                    label="Total earned"
                    value={formatPaise(summary.totalEarned)}
                    hint={`across ${summary.paidBookings} paid booking${summary.paidBookings === 1 ? '' : 's'}`}
                />
                <StatCard label="Platform fees" value={formatPaise(summary.feesPaid)} hint="10% of rent" />
                <StatCard
                    label="Deposits held"
                    value={formatPaise(summary.depositsHeld)}
                    hint="refundable to renters"
                />
            </div>

            <h2 className="mt-8 text-lg font-medium text-gray-900">Payment history</h2>
            {payments.length === 0 ? (
                <p className="mt-3 text-gray-500">No paid bookings yet.</p>
            ) : (
                <div className={`${card} mt-3 overflow-x-auto`}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-100">
                                <th className="px-4 py-3 font-medium">Item</th>
                                <th className="px-4 py-3 font-medium">Renter</th>
                                <th className="px-4 py-3 font-medium">Dates</th>
                                <th className="px-4 py-3 font-medium text-right">Your share</th>
                                <th className="px-4 py-3 font-medium text-right">Fee</th>
                                <th className="px-4 py-3 font-medium text-right">Deposit held</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p) => (
                                <tr key={p._id} className="border-b border-gray-50 last:border-0">
                                    <td className="px-4 py-3 text-gray-900">{p.bookingId?.itemId?.title || '—'}</td>
                                    <td className="px-4 py-3 text-gray-700">{p.bookingId?.renterId?.name || '—'}</td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {p.bookingId ? formatDateRange(p.bookingId.startDate, p.bookingId.endDate) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                        {formatPaise(p.split.lenderPayable)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-500">{formatPaise(p.split.platformFee)}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">{formatPaise(p.split.heldDeposit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default EarningsPage;