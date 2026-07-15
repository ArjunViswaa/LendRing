import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Link, useParams } from 'react-router-dom';

import { fetchItemDetail } from '../api/browse';
import { requestBooking } from '../api/bookings';
import { formatPaise } from '../utils/money';
import { card, input, btnPrimary } from '../utils/ui';

function countDays(start, end) {
    const ms = new Date(end) - new Date(start);
    if (isNaN(ms) || ms < 0) return 0;
    return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

function ItemDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [mainPhoto, setMainPhoto] = useState(null);
    const [dates, setDates] = useState({ start: '', end: '' });
    const [bookingError, setBookingError] = useState('');
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        fetchItemDetail(id)
            .then((data) => {
                setItem(data);
                setMainPhoto(data.photos[0] || null);
            })
            .catch(() => setNotFound(true));
    }, [id]);

    async function handleRequestBooking() {
        setBookingError('');
        setRequesting(true);
        try {
            await requestBooking(id, dates.start, dates.end);
            navigate('/dashboard/orders', { state: { justRequested: true } });
        } catch (err) {
            setBookingError(err.response?.data?.message || 'Could not request this booking');
            setRequesting(false);
        }
    }

    if (notFound) {
        return (
            <div>
                <p className="text-gray-600">This listing is no longer available.</p>
                <Link to="/dashboard/browse" className="underline text-sm text-gray-700">
                    ← Back to browse
                </Link>
            </div>
        );
    }

    if (!item) return <p className="text-gray-500">Loading...</p>;

    const lender = item.lenderId;
    const days = dates.start && dates.end ? countDays(dates.start, dates.end) : 0;
    const rentTotal = days * item.ratePerDay;

    return (
        <div className="max-w-5xl">
            <Link to="/dashboard/browse" className="text-sm text-gray-500 hover:text-gray-900">
                ← Back to browse
            </Link>

            <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
                <div>
                    {mainPhoto ? (
                        <img src={mainPhoto} alt={item.title} className="w-full h-96 object-cover rounded-xl border border-gray-200" />
                    ) : (
                        <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                            No photos for this listing
                        </div>
                    )}

                    {item.photos.length > 1 && (
                        <div className="mt-3 flex gap-2">
                            {item.photos.map((url) => (
                                <button key={url} onClick={() => setMainPhoto(url)} type="button">
                                    <img
                                        src={url}
                                        alt=""
                                        className={`h-16 w-16 object-cover rounded-lg border-2 ${url === mainPhoto ? 'border-brand-600' : 'border-transparent hover:border-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    <h1 className="mt-6 text-2xl font-semibold text-gray-900">{item.title}</h1>
                    <p className="mt-1 text-sm text-gray-500 capitalize">
                        {item.category} · {item.city || 'Location not set'}
                    </p>

                    <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>

                    {(item.availableFrom || item.availableTo) && (
                        <p className="mt-4 text-sm text-gray-500">
                            Available{' '}
                            {item.availableFrom && `from ${new Date(item.availableFrom).toLocaleDateString('en-IN')}`}{' '}
                            {item.availableTo && `until ${new Date(item.availableTo).toLocaleDateString('en-IN')}`}
                        </p>
                    )}

                    {/* lender card */}
                    <div className={`${card} mt-6 p-4 flex items-center gap-4 max-w-sm`}>
                        <div className="h-12 w-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-lg">
                            {lender.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900">{lender.name}</p>
                            <p className="text-sm text-gray-500">
                                {lender.city || 'City not set'} · member since{' '}
                                {new Date(lender.createdAt).getFullYear()}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-brand-700">{lender.trustScore}</p>
                            <p className="text-xs text-gray-500">trust score</p>
                        </div>
                    </div>
                </div>

                {/* right: booking panel */}
                <div className={`${card} p-6 h-fit sticky top-8`}>
                    <p className="text-xl text-gray-900">
                        <span className="font-semibold">{formatPaise(item.ratePerDay)}</span>
                        <span className="text-sm text-gray-500">/day</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        + {formatPaise(item.depositAmount)} refundable deposit
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1 text-sm text-gray-700">
                            From
                            <input
                                type="date"
                                value={dates.start}
                                onChange={(e) => setDates({ ...dates, start: e.target.value })}
                                className={input}
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm text-gray-700">
                            To
                            <input
                                type="date"
                                value={dates.end}
                                onChange={(e) => setDates({ ...dates, end: e.target.value })}
                                className={input}
                            />
                        </label>
                    </div>

                    {days > 0 && (
                        <div className="mt-4 text-sm text-gray-700 flex flex-col gap-1 border-t border-gray-100 pt-4">
                            <span className="flex justify-between">
                                <span>
                                    {formatPaise(item.ratePerDay)} × {days} day{days === 1 ? '' : 's'}
                                </span>
                                <span>{formatPaise(rentTotal)}</span>
                            </span>
                            <span className="flex justify-between">
                                <span>Refundable deposit</span>
                                <span>{formatPaise(item.depositAmount)}</span>
                            </span>
                            <span className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-1 mt-1">
                                <span>Due now</span>
                                <span>{formatPaise(rentTotal + item.depositAmount)}</span>
                            </span>
                        </div>
                    )}

                    {bookingError && <p className="mt-3 text-sm text-red-600">{bookingError}</p>}

                    {user.role === 'renter' ? (
                        <button
                            onClick={handleRequestBooking}
                            disabled={days < 1 || requesting}
                            className={`${btnPrimary} w-full mt-4`}
                        >
                            {requesting ? 'Sending request...' : days < 1 ? 'Select your dates' : 'Request booking'}
                        </button>
                    ) : (
                        <p className="mt-4 text-xs text-gray-400 text-center">
                            Log in as a renter to book this item.
                        </p>
                    )}
                    <p className="mt-2 text-xs text-gray-400 text-center">
                        You only pay after the lender approves your request.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ItemDetailPage;