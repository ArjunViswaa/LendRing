const STATUS_STYLES = {
    requested: 'bg-amber-100 text-amber-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-brand-100 text-brand-700',
    active: 'bg-green-100 text-green-800',
    returnRequested: 'bg-amber-100 text-amber-800',
    completed: 'bg-gray-200 text-gray-700',
    declined: 'bg-gray-200 text-gray-500',
    cancelled: 'bg-gray-200 text-gray-500',
    disputed: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
    requested: 'Waiting for approval',
    approved: 'Approved - pay to confirm',
    paid: 'Paid',
    active: 'Rented out',
    returnRequested: 'Return pending',
    completed: 'Completed',
    declined: 'Declined',
    cancelled: 'Cancelled',
    disputed: 'In dispute',
};

function StatusBadge({ status }) {
    return (
        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[status] || 'bg-gray-200 text-gray-700'}`}>
            {STATUS_LABELS[status] || status}
        </span>
    );
}

export default StatusBadge;