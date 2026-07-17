import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchMyBookings, cancelBooking, markReturn } from '../../api/bookings';
import { createPaymentOrder, verifyPayment } from '../../api/payments';
import { formatPaise } from '../../utils/money';
import { formatDateRange } from '../../utils/dates';
import { card, btnPrimary, btnDanger, btnSecondary } from '../../utils/ui';
import StatusBadge from '../../components/StatusBadge';
import ReviewForm from '../../components/ReviewForm';
import { fetchGivenReviews } from '../../api/reviews';

function MyOrdersPage() {
    const [bookings, setBookings] = useState(null);
    const [error, setError] = useState('');
    const [reviewedIds, setReviewedIds] = useState([]);
    const [reviewOpen, setReviewOpen] = useState(null);
    const justRequested = useLocation().state?.justRequested;

    const { user } = useAuth();

    useEffect(() => {
        fetchMyBookings()
            .then(setBookings)
            .catch(() => setError('Could not load your orders'));
        fetchGivenReviews().then(setReviewedIds).catch(() => { });
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

    async function handlePay(booking) {
        try {
            const order = await createPaymentOrder(booking._id);

            const razorpay = new window.Razorpay({
                key: order.keyId,
                order_id: order.orderId,
                amount: order.amount,
                currency: order.currency,
                name: 'Lend-Ring',
                description: order.itemTitle,
                prefill: { name: user.name, email: user.email },
                theme: { color: '#0f766e' },
                handler: async (response) => {
                    try {
                        const updated = await verifyPayment(response);
                        setBookings((prev) =>
                            prev.map((b) => (b._id === booking._id ? { ...b, status: updated.status } : b))
                        );
                    } catch (err) {
                        alert(err.response?.data?.message || 'Payment verification failed');
                    }
                },
            });

            razorpay.open();
        } catch (err) {
            alert(err.response?.data?.message || 'Could not start the payment');
        }
    }

    async function handleReturn(booking) {
        try {
            const updated = await markReturn(booking._id);
            setBookings(bookings.map((b) => (b._id === booking._id ? { ...b, status: updated.status } : b)));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not mark the return');
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
                                    <button onClick={() => handlePay(b)} className={`${btnPrimary} text-xs`}>
                                        Pay {formatPaise(b.totalAmount)}
                                    </button>
                                )}
                                {['requested', 'approved'].includes(b.status) && (
                                    <button onClick={() => handleCancel(b)} className={`${btnDanger} text-xs`}>
                                        Cancel
                                    </button>
                                )}
                                {b.status === 'active' && (
                                    <button onClick={() => handleReturn(b)} className={`${btnPrimary} text-xs`}>
                                        Mark as returned
                                    </button>
                                )}
                                {b.status === 'completed' && (
                                    <p className="text-xs text-gray-500 text-right">
                                        {b.latePenalty > 0
                                            ? `${formatPaise(b.depositAmount - b.latePenalty)} refunded (${formatPaise(b.latePenalty)} deducted)`
                                            : 'Deposit refunded in full'}
                                    </p>
                                )}
                                {b.status === 'disputed' && (
                                    <p className="text-xs text-gray-500 text-right">Deposit held pending admin review</p>
                                )}
                                {b.status === 'completed' && !reviewedIds.includes(b._id) && (
                                    <button
                                        onClick={() => setReviewOpen(reviewOpen === b._id ? null : b._id)}
                                        className={`${btnSecondary} text-xs`}
                                    >
                                        Rate lender
                                    </button>
                                )}
                            </div>
                            {reviewOpen === b._id && (
                                <ReviewForm
                                    bookingId={b._id}
                                    counterpartName="the lender"
                                    onDone={(id) => {
                                        setReviewedIds([...reviewedIds, id]);
                                        setReviewOpen(null);
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyOrdersPage;