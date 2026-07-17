import api from './client';

export async function createReview(bookingId, rating, comment) {
    const { data } = await api.post('/reviews', { bookingId, rating, comment });
    return data.review;
}

export async function fetchGivenReviews() {
    const { data } = await api.get('/reviews/given');
    return data.bookingIds;
}

export async function fetchUserReviews(userId) {
    const { data } = await api.get(`/reviews/user/${userId}`);
    return data.reviews;
}