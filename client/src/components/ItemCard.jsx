import { Link } from 'react-router-dom';
import { formatPaise } from '../utils/money';
import { card } from '../utils/ui';

function ItemCard({ item }) {
    return (
        <Link
            to={`/dashboard/items/${item._id}`}
            className={`${card} overflow-hidden flex flex-col hover:shadow-md transition-shadow`}
        >
            {item.photos.length > 0 ? (
                <img src={item.photos[0]} alt={item.title} className="h-44 w-full object-cover" />
            ) : (
                <div className="h-44 w-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    No photo
                </div>
            )}

            <div className="p-4 flex flex-col gap-1 flex-1">
                <h2 className="font-medium text-gray-900 leading-snug">{item.title}</h2>
                <p className="text-sm text-gray-500 capitalize">
                    {item.category} · {item.city || 'Location not set'}
                </p>
                <p className="mt-auto pt-2 text-gray-900">
                    <span className="font-semibold">{formatPaise(item.ratePerDay)}</span>
                    <span className="text-sm text-gray-500">/day · {formatPaise(item.depositAmount)} deposit</span>
                </p>
            </div>
        </Link>
    );
}

export default ItemCard;