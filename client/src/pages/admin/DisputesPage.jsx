import { useEffect, useState } from 'react';
import { fetchDisputes, resolveDispute } from '../../api/disputes';
import { formatPaise, rupeesToPaise, paiseToRupees } from '../../utils/money';
import { formatDateRange } from '../../utils/dates';
import { card, input, btnPrimary, btnSecondary } from '../../utils/ui';

function DisputesPage() {
    const [tab, setTab] = useState('open');
    const [disputes, setDisputes] = useState(null);
    const [error, setError] = useState('');
    const [resolving, setResolving] = useState(null);
    const [split, setSplit] = useState({ renterRupees: '', notes: '' });
    const [resolveBusy, setResolveBusy] = useState(false);

    async function load(which = tab) {
        setDisputes(null);
        try {
            setDisputes(await fetchDisputes(which));
        } catch {
            setError('Could not load disputes');
        }
    }

    useEffect(() => {
        load('open');
    }, []);

    function switchTab(which) {
        setTab(which);
        setResolving(null);
        load(which);
    }

    async function submitResolution(dispute) {
        const deposit = dispute.bookingId.depositAmount;
        const renterRefund = rupeesToPaise(split.renterRupees || 0);
        setResolveBusy(true);
        try {
            await resolveDispute(dispute._id, {
                renterRefund,
                lenderCompensation: deposit - renterRefund,
                notes: split.notes,
            });
            setResolving(null);
            setSplit({ renterRupees: '', notes: '' });
            load();
        } catch (err) {
            alert(err.response?.data?.message || 'Could not resolve');
        } finally {
            setResolveBusy(false);
        }
    }

    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <div className="max-w-3xl">
            <h1 className="text-2xl font-semibold text-gray-900">Disputes</h1>
            <p className="mt-1 text-sm text-gray-500">Decide how held deposits are split when returns go wrong.</p>

            <div className="mt-4 flex gap-2">
                {['open', 'resolved'].map((t) => (
                    <button
                        key={t}
                        onClick={() => switchTab(t)}
                        className={tab === t ? btnPrimary : btnSecondary}
                    >
                        {t === 'open' ? 'Open' : 'Resolved'}
                    </button>
                ))}
            </div>

            {!disputes ? (
                <p className="mt-6 text-gray-500">Loading...</p>
            ) : disputes.length === 0 ? (
                <p className="mt-6 text-gray-500">No {tab} disputes.</p>
            ) : (
                <div className="mt-6 flex flex-col gap-4">
                    {disputes.map((d) => {
                        const b = d.bookingId;
                        return (
                            <div key={d._id} className={`${card} p-5 flex flex-col gap-3`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-medium text-gray-900">{b?.itemId?.title}</p>
                                        <p className="text-sm text-gray-500">
                                            {b && formatDateRange(b.startDate, b.endDate)} · deposit {b && formatPaise(b.depositAmount)}
                                        </p>
                                        <p className="text-sm text-gray-700 mt-1">
                                            Lender {b?.lenderId?.name} (trust {b?.lenderId?.trustScore}) vs renter{' '}
                                            {b?.renterId?.name} (trust {b?.renterId?.trustScore})
                                        </p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 capitalize shrink-0">
                                        {d.reason}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{d.description}</p>

                                {d.evidencePhotos.length > 0 && (
                                    <div className="flex gap-2">
                                        {d.evidencePhotos.map((url) => (
                                            <a key={url} href={url} target="_blank" rel="noreferrer">
                                                <img src={url} alt="evidence" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {d.status === 'resolved' ? (
                                    <p className="text-sm text-gray-600">
                                        Resolved: {formatPaise(d.resolution.renterRefund)} refunded to renter,{' '}
                                        {formatPaise(d.resolution.lenderCompensation)} to lender.
                                        {d.resolution.notes && ` — "${d.resolution.notes}"`}
                                    </p>
                                ) : resolving === d._id ? (
                                    <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                                        <div className="flex items-center gap-3 text-sm text-gray-700">
                                            <label className="flex items-center gap-2">
                                                Refund to renter (₹)
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={paiseToRupees(b.depositAmount)}
                                                    value={split.renterRupees}
                                                    onChange={(e) => setSplit({ ...split, renterRupees: e.target.value })}
                                                    className={`${input} w-28`}
                                                />
                                            </label>
                                            <span className="text-gray-500">
                                                → lender gets {formatPaise(b.depositAmount - rupeesToPaise(split.renterRupees || 0))}
                                            </span>
                                        </div>
                                        <input
                                            placeholder="Resolution notes"
                                            value={split.notes}
                                            onChange={(e) => setSplit({ ...split, notes: e.target.value })}
                                            className={`${input} text-sm`}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => submitResolution(d)} className={`${btnPrimary} text-xs`} disabled={resolveBusy}>
                                                Resolve
                                            </button>
                                            <button onClick={() => setResolving(null)} className={`${btnSecondary} text-xs`}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setResolving(d._id)} className={`${btnPrimary} text-xs self-start`}>
                                        Review & resolve
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default DisputesPage;