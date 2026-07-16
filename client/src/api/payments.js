import api from './client';

export async function createPaymentOrder(bookingId) {
    const { data } = await api.post('/payments/order', { bookingId });
    return data.order;
}

export async function verifyPayment(payload) {
    const { data } = await api.post('/payments/verify', payload);
    return data.booking;
}

export async function fetchEarnings() {
    const { data } = await api.get('/payments/earnings');
    return data;
}