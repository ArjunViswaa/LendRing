import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyItems, updateItem, deleteItem } from '../../api/items';
import { formatPaise } from '../../utils/money';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';

function MyListingsPage() {
    const [items, setItems] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyItems()
            .then(setItems)
            .catch(() => setError('Could not load your listings'));
    }, []);

    async function toggleStatus(item) {
        const next = item.status === 'active' ? 'unlisted' : 'active';
        const updated = await updateItem(item._id, { status: next });
        setItems(items.map((i) => (i._id === item._id ? updated : i)));
    }

    async function handleDelete(item) {
        if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
        try {
            await deleteItem(item._id);
            setItems(items.filter((i) => i._id !== item._id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete this listing');
        }
    }

    if (error) return <p className="text-red-600">{error}</p>;
    if (!items) return <Spinner label="Loading your listings" />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">My listings</h1>
                <Link
                    to="/dashboard/add-item"
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                    + Add item
                </Link>
            </div>

            {items.length === 0 ? (
                <EmptyState
                    icon="🏷️"
                    title="Nothing listed yet"
                    message="Add your first item and start earning from things you already own."
                    actionTo="/dashboard/add-item"
                    actionLabel="Add item"
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <div key={item._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                            {item.photos.length > 0 ? (
                                <img src={item.photos[0]} alt={item.title} className="h-40 w-full object-cover" />
                            ) : (
                                <div className="h-40 w-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                                    No photo yet
                                </div>
                            )}

                            <div className="p-4 flex flex-col gap-1 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <h2 className="font-medium text-gray-900">{item.title}</h2>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${item.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                                <p className="text-sm text-gray-900 mt-1">
                                    {formatPaise(item.ratePerDay)}/day · {formatPaise(item.depositAmount)} deposit
                                </p>

                                <div className="mt-auto pt-3 flex gap-3 text-sm">
                                    <Link to={`/dashboard/listings/${item._id}/edit`} className="underline text-gray-700 hover:text-gray-900">
                                        Edit
                                    </Link>
                                    <button onClick={() => toggleStatus(item)} className="underline text-gray-700 hover:text-gray-900">
                                        {item.status === 'active' ? 'Unlist' : 'List again'}
                                    </button>
                                    <button onClick={() => handleDelete(item)} className="underline text-red-600 hover:text-red-800">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyListingsPage;