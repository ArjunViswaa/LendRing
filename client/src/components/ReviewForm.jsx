import { useState } from 'react';
import { createReview } from '../api/reviews';
import { input, btnPrimary } from '../utils/ui';

function ReviewForm({ bookingId, counterpartName, onDone }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit() {
        setError('');
        setBusy(true);
        try {
            await createReview(bookingId, rating, comment);
            onDone(bookingId);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not submit the review');
            setBusy(false);
        }
    }

    return (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
            <p className="text-sm text-gray-700">How was your experience with {counterpartName}?</p>
            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl leading-none ${star <= rating ? 'text-amber-400' : 'text-gray-300 hover:text-amber-200'}`}
                    >
                        ★
                    </button>
                ))}
            </div>

            <textarea
                rows={2}
                placeholder="Optional comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={`${input} text-sm`}
            />
            <button
                onClick={submit}
                disabled={busy || rating === 0}
                className={`${btnPrimary} text-xs self-start`}
            >
                {busy ? 'Submitting...' : 'Submit review'}
            </button>
        </div>
    );
}

export default ReviewForm;