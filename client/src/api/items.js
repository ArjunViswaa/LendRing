import api from './client';

export async function fetchMyItems() {
    const { data } = await api.get('/items/mine');
    return data.items;
}

export async function createItem(details) {
    const { data } = await api.post('/items', details);
    return data.item;
}

export async function updateItem(id, updates) {
    const { data } = await api.put(`/items/${id}`, updates);
    return data.item;
}

export async function deleteItem(id) {
    await api.delete(`/items/${id}`);
}

export async function uploadItemPhotos(id, files) {
    const form = new FormData();
    files.forEach((f) => form.append('photos', f));
    const { data } = await api.post(`/items/${id}/photos`, form);
    return data.item;
}

export async function removeItemPhoto(id, photoUrl) {
    const { data } = await api.delete(`/items/${id}/photos`, { data: { photoUrl } });
    return data.item;
}