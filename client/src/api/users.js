import api from './client';

export async function fetchMe() {
    const { data } = await api.get('/users/me');
    return data.user;
}

export async function updateProfile(updates) {
    const { data } = await api.put('/users/me', updates);
    return data.user;
}

export async function changePassword(currentPassword, newPassword) {
    const { data } = await api.put('/users/me/password', { currentPassword, newPassword });
    return data;
}