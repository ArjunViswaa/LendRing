import { useEffect, useState } from 'react';
import { searchItems } from '../../api/browse';
import { rupeesToPaise } from '../../utils/money';
import { input, btnPrimary, btnSecondary } from '../../utils/ui';
import ItemCard from '../../components/ItemCard';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';

const CATEGORIES = ['electronics', 'tools', 'outdoor', 'events', 'sports', 'other'];

const EMPTY_FILTERS = {
    search: '',
    category: '',
    city: '',
    minRupees: '',
    maxRupees: '',
};

function BrowsePage() {
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function load(page = 1, activeFilters = filters) {
        setLoading(true);
        setError('');
        try {
            const params = {
                page,
                search: activeFilters.search || undefined,
                category: activeFilters.category || undefined,
                city: activeFilters.city || undefined,
                minRate: activeFilters.minRupees ? rupeesToPaise(activeFilters.minRupees) : undefined,
                maxRate: activeFilters.maxRupees ? rupeesToPaise(activeFilters.maxRupees) : undefined,
            };
            setResult(await searchItems(params));
        } catch {
            setError('Could not load items - is the server running?');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load(1, EMPTY_FILTERS);
    }, []);

    function updateFilter(e) {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    }

    function handleSearch(e) {
        e.preventDefault();
        load(1);
    }

    function clearFilters() {
        setFilters(EMPTY_FILTERS);
        load(1, EMPTY_FILTERS);
    }

    return (
        <div className="max-w-5xl">
            <h1 className="text-2xl font-semibold text-gray-900">Browse items</h1>
            <p className="mt-1 text-sm text-gray-500">Rent from people near you.</p>

            <form onSubmit={handleSearch} className="mt-6 flex flex-wrap gap-3 items-end">
                <label className="flex flex-col gap-1 text-sm text-gray-700 flex-1 min-w-48">
                    Search
                    <input
                        name="search"
                        value={filters.search}
                        onChange={updateFilter}
                        placeholder="camera, drill, tent..."
                        className={input}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Category
                    <select name="category" value={filters.category} onChange={updateFilter} className={input}>
                        <option value="">All</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    City
                    <input name="city" value={filters.city} onChange={updateFilter} className={`${input} w-32`} />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    ₹ min/day
                    <input name="minRupees" type="number" min="0" value={filters.minRupees} onChange={updateFilter} className={`${input} w-24`} />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    ₹ max/day
                    <input name="maxRupees" type="number" min="0" value={filters.maxRupees} onChange={updateFilter} className={`${input} w-24`} />
                </label>

                <button type="submit" className={btnPrimary}>Search</button>
                <button type="button" onClick={clearFilters} className={btnSecondary}>Clear</button>
            </form>

            <div className="mt-6">
                {error && <p className="text-red-600">{error}</p>}
                {loading && <Spinner label="Finding items" />}

                {!loading && !error && result && (
                    <>
                        <p className="text-sm text-gray-500 mb-4">
                            {result.total} item{result.total === 1 ? '' : 's'} found
                        </p>

                        {result.items.length === 0 ? (
                            <EmptyState
                                icon="🔍"
                                title="No items match those filters"
                                message="Try widening your search or clearing filters."
                            />
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {result.items.map((item) => (
                                    <ItemCard key={item._id} item={item} />
                                ))}
                            </div>
                        )}

                        {result.pages > 1 && (
                            <div className="mt-6 flex items-center gap-4">
                                <button
                                    onClick={() => load(result.page - 1)}
                                    disabled={result.page <= 1}
                                    className={`${btnSecondary} disabled:opacity-40`}
                                >
                                    ← Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {result.page} of {result.pages}
                                </span>
                                <button
                                    onClick={() => load(result.page + 1)}
                                    disabled={result.page >= result.pages}
                                    className={`${btnSecondary} disabled:opacity-40`}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default BrowsePage;