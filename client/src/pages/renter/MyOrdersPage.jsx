import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchMyBookings, cancelBooking } from '../../api/bookings';
import { formatPaise } from '../../utils/money';
import { formatDateRange } from '../../utils/dates';
import { card, btnPrimary, btnDanger } from '../../utils/ui';
import StatusBadge from '../../components/StatusBadge';

function MyOrdersPage() {
    const [bookings, setBookings] = useState(null);
    const [error, setError] = useState('');
    const justRequested = useLocation().state?.justRequested;

    useEffect(() => {
        fetchMyBookings()
            .then(setBookings)
            .catch(() => setError('Could not load your orders'));
    }, []);

    async function handleCancel(booking) {
        if (!window.confirm('Cancel this booking request?')) return;
        try {
            const updated = await cancelBooking(booking._id);
            setBookings(bookings.map((b) => (b._id === booking._id ? { ...b, status: updated.status } : b)));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not cancel');
        }
    }

    if (error) return <p className="text-red-600">{error}</p>;
    if (!bookings) return <p className="text-gray-500">Loading your orders...</p>;

    return (
        <div className="max-w-3xl">
            <h1 className="text-2xl font-semibold text-gray-900">My orders</h1>
            <p className="mt-1 text-sm text-gray-500">Everything you have requested or rented.</p>

            {justRequested && (
                <p className="mt-4 rounded-lg bg-brand-50 border border-brand-100 text-brand-700 text-sm px-4 py-3">
                    Request sent! The lender has been asked to approve your booking.
                </p>
            )}

            {bookings.length === 0 ? (
                <p className="mt-6 text-gray-500">
                    No orders yet.{' '}
                    <Link to="/dashboard/browse" className="underline">Browse items</Link> to get started.
                </p>
            ) : (
                <div className="mt-6 flex flex-col gap-3">
                    {bookings.map((b) => (
                        <div key={b._id} className={`${card} p-4 flex gap-4 items-center`}>
                            {b.itemId?.photos?.[0] ? (
                                <img src={b.itemId.photos[0]} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0" />
                            ) : (
                                <div className="h-16 w-16 rounded-lg bg-gray-100 shrink-0" />
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{b.itemId?.title || 'Listing removed'}</p>
                                <p className="text-sm text-gray-500">{formatDateRange(b.startDate, b.endDate)}</p>
                                <p className="text-sm text-gray-700 mt-1">
                                    {formatPaise(b.rentAmount)} rent + {formatPaise(b.depositAmount)} deposit
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <StatusBadge status={b.status} />

                                {b.status === 'approved' && (
                                    <button disabled className={`${btnPrimary} text-xs cursor-not-allowed`} title="Payments launching soon">
                                        Pay {formatPaise(b.totalAmount)}
                                    </button>
                                )}
                                {['requested', 'approved'].includes(b.status) && (
                                    <button onClick={() => handleCancel(b)} className={`${btnDanger} text-xs`}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyOrdersPage;