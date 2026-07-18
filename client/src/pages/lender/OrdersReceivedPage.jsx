import { useEffect, useState } from 'react';
import { fetchReceivedBookings, approveBooking, declineBooking, markHandover, confirmReturn } from '../../api/bookings';
import { formatPaise } from '../../utils/money';
import { formatDateRange } from '../../utils/dates';
import { card, btnPrimary, btnSecondary, btnDanger, input } from '../../utils/ui';
import StatusBadge from '../../components/StatusBadge';
import ReviewForm from '../../components/ReviewForm';

import { fetchGivenReviews } from '../../api/reviews';
import { raiseDispute } from '../../api/disputes';

function OrdersReceivedPage() {
    const [bookings, setBookings] = useState(null);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');
    const [disputeFor, setDisputeFor] = useState(null); // booking id with open form
    const [disputeForm, setDisputeForm] = useState({ reason: 'damage', description: '', files: [] });
    const [submittingDispute, setSubmittingDispute] = useState(false);
    const [reviewedIds, setReviewedIds] = useState([]);
    const [reviewOpen, setReviewOpen] = useState(null);
    const [actionBusy, setActionBusy] = useState(false);

    useEffect(() => {
        fetchReceivedBookings()
            .then(setBookings)
            .catch(() => setError('Could not load bookings'));
        fetchGivenReviews().then(setReviewedIds).catch(() => { });
    }, []);

    async function act(booking, action) {
        if (actionBusy) return;
        setActionError('');
        setActionBusy(true);

        const calls = {
            approve: approveBooking,
            decline: declineBooking,
            handover: markHandover,
            confirmReturn: confirmReturn,
        };

        try {
            const updated = await calls[action](booking._id);
            setBookings(bookings.map((b) => (b._id === booking._id ? { ...b, ...updated } : b)));
        } catch (err) {
            setActionError(err.response?.data?.message || `Could not ${action} this booking`);
        } finally {
            setActionBusy(false);
        }
    }

    async function submitDispute(booking) {
        setActionError('');
        setSubmittingDispute(true);
        try {
            await raiseDispute({ bookingId: booking._id, ...disputeForm });
            setBookings(bookings.map((b) => (b._id === booking._id ? { ...b, status: 'disputed' } : b)));
            setDisputeFor(null);
            setDisputeForm({ reason: 'damage', description: '', files: [] });
        } catch (err) {
            setActionError(err.response?.data?.message || 'Could not raise the dispute');
        } finally {
            setSubmittingDispute(false);
        }
    }

    if (error) return <p className="text-red-600">{error}</p>;
    if (!bookings) return <p className="text-gray-500">Loading bookings...</p>;

    const pendingCount = bookings.filter((b) => b.status === 'requested').length;

    return (
        <div className="max-w-3xl">
            <h1 className="text-2xl font-semibold text-gray-900">Orders received</h1>
            <p className="mt-1 text-sm text-gray-500">
                {pendingCount > 0 ? `${pendingCount} request${pendingCount === 1 ? '' : 's'} waiting for your decision.` : 'Booking requests for your listings show up here.'}
            </p>

            {actionError && <p className="mt-4 text-sm text-red-600">{actionError}</p>}

            {bookings.length === 0 ? (
                <p className="mt-6 text-gray-500">No booking requests yet.</p>
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
                                    {b.renterId?.name} · trust score {b.renterId?.trustScore}
                                    {b.renterId?.city && ` · ${b.renterId.city}`}
                                </p>
                                <p className="text-sm text-gray-500">
                                    You earn {formatPaise(b.rentAmount - b.platformFee)} (after {formatPaise(b.platformFee)} platform fee)
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <StatusBadge status={b.status} />
                                {b.status === 'requested' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => act(b, 'approve')} className={`${btnPrimary} text-xs`} disabled={actionBusy}>
                                            Approve
                                        </button>
                                        <button onClick={() => act(b, 'decline')} className={`${btnSecondary} text-xs`} disabled={actionBusy}>
                                            Decline
                                        </button>
                                    </div>
                                )}
                                {b.status === 'paid' && (
                                    <button onClick={() => act(b, 'handover')} className={`${btnPrimary} text-xs`} disabled={actionBusy}>
                                        Confirm handover
                                    </button>
                                )}
                                {['active', 'returnRequested'].includes(b.status) && (
                                    <button onClick={() => act(b, 'confirmReturn')} className={`${btnPrimary} text-xs`} disabled={actionBusy}>
                                        Confirm return
                                    </button>
                                )}
                                {['active', 'returnRequested'].includes(b.status) && (
                                    <button onClick={() => setDisputeFor(disputeFor === b._id ? null : b._id)} className={`${btnDanger} text-xs`}>
                                        Report damage
                                    </button>
                                )}
                                {b.status === 'completed' && !reviewedIds.includes(b._id) && (
                                    <button
                                        onClick={() => setReviewOpen(reviewOpen === b._id ? null : b._id)}
                                        className={`${btnSecondary} text-xs`}
                                    >
                                        Rate renter
                                    </button>
                                )}
                            </div>
                            {disputeFor === b._id && (
                                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-3">
                                    <div className="flex gap-3">
                                        <select
                                            value={disputeForm.reason}
                                            onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                                            className={`${input} text-sm`}
                                        >
                                            <option value="damage">Item damaged</option>
                                            <option value="notReturned">Not returned</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => setDisputeForm({ ...disputeForm, files: Array.from(e.target.files) })}
                                            className="text-sm self-center"
                                        />
                                    </div>
                                    <textarea
                                        rows={2}
                                        placeholder="Describe what happened - the admin will review this with your photos"
                                        value={disputeForm.description}
                                        onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
                                        className={`${input} text-sm`}
                                    />
                                    <button
                                        onClick={() => submitDispute(b)}
                                        disabled={submittingDispute || !disputeForm.description}
                                        className={`${btnDanger} text-xs self-start`}
                                    >
                                        {submittingDispute ? 'Submitting...' : 'Submit dispute'}
                                    </button>
                                </div>
                            )}

                            {reviewOpen === b._id && (
                                <ReviewForm
                                    bookingId={b._id}
                                    counterpartName={b.renterId?.name || 'the renter'}
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

export default OrdersReceivedPage;