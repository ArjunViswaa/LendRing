import { Link } from 'react-router-dom';

function EmptyState({ icon = '📦', title, message, actionTo, actionLabel }) {
    return (
        <div className="text-center py-12 px-4">
            <div className="text-4xl mb-3">{icon}</div>
            <p className="text-gray-900 font-medium">{title}</p>
            {message && <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">{message}</p>}
            {actionTo && (
                <Link
                    to={actionTo}
                    className="inline-block mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}

export default EmptyState;