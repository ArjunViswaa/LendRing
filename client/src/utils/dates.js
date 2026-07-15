export function formatDate(value) {
    return new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatDateRange(start, end) {
    return `${formatDate(start)} → ${formatDate(end)}`;
}