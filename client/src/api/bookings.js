import api from './client';

export async function requestBooking(itemId, startDate, endDate) {
    const { data } = await api.post('/bookings', { itemId, startDate, endDate });
    return data.booking;
}

export async function fetchMyBookings() {
    const { data } = await api.get('/bookings/mine');
    return data.bookings;
}

export async function fetchReceivedBookings() {
    const { data } = await api.get('/bookings/received');
    return data.bookings;
}

export async function approveBooking(id) {
    const { data } = await api.put(`/bookings/${id}/approve`);
    return data.booking;
}

export async function declineBooking(id) {
    const { data } = await api.put(`/bookings/${id}/decline`);
    return data.booking;
}

export async function cancelBooking(id) {
    const { data } = await api.put(`/bookings/${id}/cancel`);
    return data.booking;
}

export async function markHandover(id) {
    const { data } = await api.put(`/bookings/${id}/handover`);
    return data.booking;
}

export async function markReturn(id) {
    const { data } = await api.put(`/bookings/${id}/return`);
    return data.booking;
}

export async function confirmReturn(id) {
    const { data } = await api.put(`/bookings/${id}/confirm-return`);
    return data.booking;
}