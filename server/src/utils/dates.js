function countDays(start, end) {
    const ms = new Date(end) - new Date(start);
    return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

function isValidDateString(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value));
}

function todayUtc() {
    return new Date(new Date().toISOString().slice(0, 10));
}

module.exports = { countDays, isValidDateString, todayUtc };