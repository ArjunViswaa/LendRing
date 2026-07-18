function formatPaise(paise) {
    return `Rs. ${(paise / 100).toLocaleString('en-IN')}`;
}

module.exports = { formatPaise };