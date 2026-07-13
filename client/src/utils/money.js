export function rupeesToPaise(rupees) {
    return Math.round(Number(rupees) * 100);
}

export function paiseToRupees(paise) {
    return paise / 100;
}

export function formatPaise(paise) {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
}