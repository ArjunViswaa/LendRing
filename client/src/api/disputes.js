import api from './client';

export async function raiseDispute({ bookingId, reason, description, files }) {
    const form = new FormData();
    form.append('bookingId', bookingId);
    form.append('reason', reason);
    form.append('description', description);
    (files || []).forEach((f) => form.append('evidence', f));
    const { data } = await api.post('/disputes', form);
    return data.dispute;
}

export async function fetchDisputes(status) {
    const { data } = await api.get('/disputes', { params: { status } });
    return data.disputes;
}

export async function resolveDispute(id, payload) {
    const { data } = await api.put(`/disputes/${id}/resolve`, payload);
    return data.dispute;
}