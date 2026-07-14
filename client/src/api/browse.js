import api from './client';

export async function searchItems(params) {
    const { data } = await api.get('/browse', { params });
    return data;
}

export async function fetchItemDetail(id) {
    const { data } = await api.get(`/browse/${id}`);
    return data.item;
}