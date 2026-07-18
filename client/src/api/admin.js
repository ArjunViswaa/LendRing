import api from './client';

export async function fetchUsers(params) {
    const { data } = await api.get('/admin/users', { params });
    return data;
}

export async function updateUserFlags(id, flags) {
    const { data } = await api.put(`/admin/users/${id}`, flags);
    return data.user;
}

export async function fetchAdminItems(params) {
    const { data } = await api.get('/admin/items', { params });
    return data;
}

export async function updateItemStatus(id, status) {
    const { data } = await api.put(`/admin/items/${id}`, { status });
    return data.item;
}

export async function fetchAllPayments(page) {
    const { data } = await api.get('/payments/all', { params: { page } });
    return data;
}